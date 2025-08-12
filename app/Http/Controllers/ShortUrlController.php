<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage; 
use Illuminate\Validation\Rule;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use App\Models\ShortUrl;


class ShortUrlController extends Controller
{
    public function index()
    {
        return view('shortener');
    }

    public function create()
    {
        return redirect()->route('home');
    }

    public function store(Request $request)
    {
 // Validation rules
    $rules = [
        'url' => 'required|url',
        'link_type' => 'required|in:auto,custom'
    ];

    // if ($request->link_type === 'custom') {
    //     $rules['custom_code'] = 'required|alpha_num|unique:short_urls,short_code|min:3|max:20';
    // }
    if ($request->link_type === 'custom') {
    $rules['custom_code'] = [
        'required',
        'alpha_num',
        'min:3',
        'max:20',
        Rule::unique('short_urls', 'short_code')
    ];
}

    // Validate request
    $validated = $request->validate($rules);

    // Generate short code
    $shortCode = $request->link_type === 'custom'
        ? $request->custom_code
        : Str::random(6);

    $shortUrl = url("/{$shortCode}");

    // Create QR Code
    $qrPath = "storage/qrcode/{$shortCode}.svg";
    Storage::disk('public')->makeDirectory('qrcode');
    Storage::disk('public')->put(
        $qrPath,
        QrCode::format('svg')->size(200)->generate($shortUrl)
    );

    // Save to database
    $short = ShortUrl::create([
        'original_url' => $request->url,
        'short_code'   => $shortCode,
        'qr_code_path' => $qrPath
    ]);

    // If request is AJAX, return JSON
    if ($request->ajax()) {
        return response()->json([
            'success' => true,
            'short_url' => $shortUrl,
            'qr_code_path'  => $qrPath
        ]);
    }

    // Otherwise return normal view
    return view('shortener', [
        'shortUrl' => $shortUrl,
        'qrCodePath' => $qrPath
    ]);

        

    }

    public function redirect($code)
    {
        $short = ShortUrl::where('short_code',$code)->firstOrFail();
        $short->increment('visit_count');
        return redirect($short->original_url);
    }

    // public function show($shortcode)
    // {
    //     $short = ShortUrl::where('short_code', $shortcode)->firstOrFail();
    //     return redirect()->away($short->original_url);
    // }
}
