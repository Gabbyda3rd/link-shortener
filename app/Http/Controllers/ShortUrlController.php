<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\ShortUrl;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Hash;


class ShortUrlController extends Controller
{
    public function index()
    {
        $links = ShortUrl::where('user_id', Auth::id())
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Shortener', [
            'links'      => $links,
            'shortUrl'   => session('shortUrl'),
            'qrCodePath' => session('qrCodePath'),
        ]);
    }

    public function store(Request $request)
    {
        $rules = [
            // FIX: only allow http/https destinations
            'url'         => 'required|url:http,https',
            'link_type'   => 'required|in:auto,custom,qr_only',
            'expires_at'  => 'nullable|date|after:now',
            'generate_qr' => 'boolean',
            'title'       => 'nullable|string|max:100', 
            'password'   => 'nullable|string|min:6|max:255',
        ];

        if ($request->link_type === 'custom') {
            $rules['custom_code'] = [
                'required',
                'alpha_num',
                'min:3',
                'max:20',
                Rule::unique('short_urls', 'short_code'),
                // FIX: reserved list is built from your real routes
                Rule::notIn($this->reservedCodes()),
            ];
        }

        $request->validate($rules);

        // FIX: auto codes are checked for collisions and reserved words
        $shortCode = $request->link_type === 'custom'
            ? $request->custom_code
            : $this->generateUniqueCode();

        $shortUrl = url("/{$shortCode}");

        $shouldGenerateQR = $request->link_type === 'qr_only' || $request->boolean('generate_qr');

        $qrPath = null;

        if ($shouldGenerateQR) {
            $qrPath = "qrcode/{$shortCode}.svg";
            Storage::disk('public')->makeDirectory('qrcode');

            // Generate the QR as SVG — no Imagick needed
            $qrSvg = QrCode::format('svg')
                ->size(500)
                ->errorCorrection('H')
                ->color(123, 17, 19)
                ->backgroundColor(255, 255, 255)
                ->margin(1)
                ->generate($shortUrl);

            // Convert UP Manila logo to base64 so it embeds inside the SVG
            $logoPath   = public_path('images/up_logo.webp');
            $logoBase64 = base64_encode(file_get_contents($logoPath));

            // Center math — QR is 500x500, logo is 22% = 110px
            $logoSize = 110;
            $logoX    = (500 - $logoSize) / 2;
            $logoY    = (500 - $logoSize) / 2;

            $logoTag = <<<SVG

                <image
                    href="data:image/webp;base64,{$logoBase64}"
                    x="{$logoX}"
                    y="{$logoY}"
                    width="{$logoSize}"
                    height="{$logoSize}"
                    preserveAspectRatio="xMidYMid meet"
                />
            SVG;

            // Inject logo before the closing </svg> tag
            $qrSvg = str_replace('</svg>', $logoTag . '</svg>', $qrSvg);

            Storage::disk('public')->put($qrPath, $qrSvg);
        }

        ShortUrl::create([
            'user_id'      => Auth::id(),
            'original_url' => $request->url,
            'short_code'   => $shortCode,
            'qr_code_path' => $qrPath,
            'title'        => $request->title,
            'expires_at'   => $request->expires_at
                ? Carbon::parse($request->expires_at)
                : null,
            'password'     => $request->filled('password') ? Hash::make($request->password) : null,
        ]);

        // POST → Redirect → GET pattern
        return redirect()->route('shorten.index')
            ->with('shortUrl', $shortUrl)
            ->with('qrCodePath', $qrPath);
    }

    /**
     * FIX: single flow. Opening /{code} now always shows the preview page.
     * The click is logged and counted only in confirm(), so no click can
     * bypass the audit log.
     */
    public function redirect(Request $request, $code)
    {
        return $this->preview($request, $code);
    }

    public function preview(Request $request, $code)
    {
        $short = ShortUrl::where('short_code', $code)->firstOrFail();

        if ($short->isExpired()) {
            return $this->expiredResponse($request);
        }

        return Inertia::render('LinkPreview', [
            'short_code'        => $short->short_code,
            'original_url'      => $short->original_url,
            'requires_password' => $short->has_password,
            'short_url'         => url("/{$short->short_code}"),
            'expires_at'   => $short->expires_at?->toIso8601String(),
        ]);
    }

    public function confirm(Request $request, $code)
    {
        $short = ShortUrl::where('short_code', $code)->firstOrFail();

        if ($short->isExpired()) {
            // Plain render here: confirm() is an Inertia visit, and a 4xx
            // status would show Inertia's error modal instead of the page.
            return Inertia::render('LinkExpired');
        }

        if($short->has_password){
            $request->validate([
                'password'  => ['required','string']
            ]);

            if(! Hash::check($request->password, $short->password)){
                return back()->withErrors(['password' => 'Incorrect password.']);
            }
        }



        AuditLog::log('link_visited', $short, [
            'short_code' => $short->short_code,
            'ip'         => $request->ip(),
            'user_agent' => $request->userAgent(),
            'user_id'    => Auth::id(),
            'referer'    => $request->header('referer'),
            'confirmed'  => true,
        ]);

        $short->increment('visit_count');

        return Inertia::location($short->original_url); // hard redirect, bypasses Inertia
    }

    /**
     * FIX: expired links return HTTP 410 (Gone) instead of 200.
     */
    private function expiredResponse(Request $request)
    {
        return Inertia::render('LinkExpired')
            ->toResponse($request)
            ->setStatusCode(410);
    }

    /**
     * FIX: retry until the code is unused and not a reserved word.
     */
    private function generateUniqueCode(): string
    {
        $reserved = array_map('strtolower', $this->reservedCodes());

        do {
            $code = Str::random(6);
        } while (
            in_array(strtolower($code), $reserved, true)
            || ShortUrl::where('short_code', $code)->exists()
        );

        return $code;
    }

    /**
     * FIX: a static baseline plus the first URL segment of every registered
     * route, so a custom code can never shadow a real page.
     */
    private function reservedCodes(): array
    {
        $baseline = [
            'shorten', 'admin', 'login', 'logout', 'register',
            'dashboard', 'api', 'storage', 'preview', 'confirm',
        ];

        $fromRoutes = collect(Route::getRoutes()->getRoutes())
            ->map(fn ($route) => explode('/', trim($route->uri(), '/'))[0])
            ->filter(fn ($segment) => $segment !== '' && ! str_starts_with($segment, '{'))
            ->all();

        return array_values(array_unique(array_merge($baseline, $fromRoutes)));
    }
}