<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\ShortUrl;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class LinkController extends Controller
{
    public function index(Request $request)
    {
        $sort = $request->get('sort','newest');

        $links = ShortUrl::where('user_id', Auth::id())
            ->when($request->search, function ($q, $s) {
                $q->where(fn ($q) => $q
                    ->where('short_code', 'like', "%{$s}%")
                    ->orWhere('original_url', 'like', "%{$s}%"));
            })
            ->when($request->status === 'active', fn ($q) => $q
                ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now())))
            ->when($request->status === 'expired', fn ($q) => $q->where('expires_at', '<=', now()))
            ->when($request->status === 'locked', fn ($q) => $q->whereNotNull('password'))
            ->when($request->status === 'qr', fn ($q) => $q->whereNotNull('qr_code_path'))
            ->when($sort === 'clicks', fn ($q) => $q->orderByDesc('visit_count'), fn ($q) => $q->latest())
            ->paginate(15)
            ->withQueryString();

            return Inertia::render('Links/Index', [
                'links' => $links,
                'filters' => $request->only(['search', 'status', 'sort']),
            ]);
    }

    public function show(ShortUrl $shortUrl)
    {
        Gate::authorize('view', $shortUrl);

        $isAdmin = Auth::user()->isAdmin();

        $base = AuditLog::where('target_type', 'ShortUrl')
            ->where('target_id', $shortUrl->id)
            ->where('action', 'link_visited');

        $total  = (clone $base)->count();
        // Computed server-side so owners get the number without seeing any IPs
        $unique = (clone $base)->whereNotNull('ip_address')->distinct()->count('ip_address');

        $daily = (clone $base)
            ->where('created_at', '>=', now()->subDays(29)->startOfDay())
            ->selectRaw('DATE(created_at) as day, COUNT(*) as clicks')
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        $visits = (clone $base)
            ->with('user:id,email,up_email')
            ->latest()
            ->paginate(20)
            ->through(function ($log) use ($isAdmin) {
                $row = [
                    'id'         => $log->id,
                    'visited_at' => $log->created_at,
                    'visitor'    => $log->user?->up_email ?? $log->user?->email, // null = anonymous
                    'user_agent' => $log->metadata['user_agent'] ?? null,
                    'referer'    => $log->metadata['referer'] ?? null,
                ];

                // IP is only ever added for admins
                if ($isAdmin) {
                    $row['ip'] = $log->ip_address;
                }

                return $row;
            });

        return Inertia::render('Links/Show', [
            'link'    => $shortUrl,
            'stats'   => ['total' => $total, 'unique' => $unique],
            'daily'   => $daily,
            'visits'  => $visits,
            'isAdmin' => $isAdmin,
        ]);
    }

    public function update(Request $request, ShortUrl $shortUrl)
    {
        Gate::authorize('update', $shortUrl);

        $data = $request->validate([
            'title'           => 'nullable|string|max:100',
            'expires_at'      => 'nullable|date',
            'password'        => 'nullable|string|min:6|max:255',
            'remove_password' => 'boolean',
        ]);

        $newExpiry = !empty($data['expires_at']) ? Carbon::parse($data['expires_at']) : null;

        $unchanged = $newExpiry && $shortUrl->expires_at
            && $newExpiry->format('Y-m-d H:i') === $shortUrl->expires_at->format('Y-m-d H:i');

        if ($newExpiry && ! $unchanged && $newExpiry->isPast()) {
            return back()->withErrors(['expires_at' => 'Pick a date in the future.']);
        }

        $changes = [
            'title'      => $data['title'] ?? null,
            'expires_at' => $newExpiry,
        ];

        if ($request->boolean('remove_password')) {
            $changes['password'] = null;
        } elseif ($request->filled('password')) {
            $changes['password'] = Hash::make($data['password']);
        }

        $shortUrl->update($changes);

        AuditLog::log('link_updated', $shortUrl, [
            'short_code'       => $shortUrl->short_code,
            'expires_at'       => $request->expires_at,
            'password_changed' => $request->filled('password') || $request->boolean('remove_password'),
        ]);

        return back()->with('success', 'Link updated.');
    }

    public function destroy(ShortUrl $shortUrl)
    {
        Gate::authorize('delete', $shortUrl);

        if ($shortUrl->qr_code_path) {
            Storage::disk('public')->delete($shortUrl->qr_code_path);
        }

        AuditLog::log('link_deleted', $shortUrl, ['short_code' => $shortUrl->short_code]);

        $shortUrl->delete();

        return redirect()->route('links.index');
    }



}
