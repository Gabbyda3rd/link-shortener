<?php

namespace App\Http\Controllers;

use App\Models\ShortUrl;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class AdminController extends Controller
{
    // ── DASHBOARD ────────────────────────────────────────────────────────────

    public function index()
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => $this->buildStats(),
        ]);
    }

    // ── LINK MANAGEMENT ──────────────────────────────────────────────────────

    public function links(Request $request)
    {
        $links = ShortUrl::with('user')
            ->when($request->search, fn($q) =>
                $q->where('short_code', 'like', "%{$request->search}%")
                  ->orWhere('original_url', 'like', "%{$request->search}%")
            )
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Links', [
            'links'   => $links,
            'filters' => $request->only('search'),
        ]);
    }

    public function deleteLink(ShortUrl $shortUrl)
    {
        AuditLog::log('link_deleted', $shortUrl, [
            'short_code'   => $shortUrl->short_code,
            'original_url' => $shortUrl->original_url,
            'owner'        => $shortUrl->user?->email,
        ]);

        $shortUrl->delete();

        return back()->with('success', 'Link deleted.');
    }

    public function updateExpiry(Request $request, ShortUrl $shortUrl)
    {
        $request->validate([
            'expires_at' => 'nullable|date',
        ]);

        $shortUrl->update([
            'expires_at' => $request->expires_at ? Carbon::parse($request->expires_at) : null,
        ]);

        AuditLog::log('link_expiry_updated', $shortUrl, [
            'short_code' => $shortUrl->short_code,
            'expires_at' => $request->expires_at,
        ]);

        return back()->with('success', 'Expiry updated.');
    }

    // ── USER MANAGEMENT ──────────────────────────────────────────────────────

    public function users(Request $request)
    {
        $users = User::withCount('shortUrls')
            ->when($request->search, fn($q) =>
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
            )
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Users', [
            'users'   => $users,
            'filters' => $request->only('search'),
        ]);
    }

    public function toggleUser(User $user)
    {
        if ($user->id === Auth::id()) {
            return back()->with('error', 'You cannot deactivate yourself.');
        }

        $user->update(['is_active' => ! $user->is_active]);

        AuditLog::log(
            $user->is_active ? 'user_activated' : 'user_deactivated',
            $user,
            ['email' => $user->email]
        );

        return back()->with('success', $user->is_active ? 'User activated.' : 'User deactivated.');
    }

    public function toggleAdmin(User $user)
    {
        if ($user->id === Auth::id()) {
            return back()->with('error', 'You cannot change your own admin status.');
        }

        $user->update(['is_admin' => ! $user->is_admin]);

        AuditLog::log(
            $user->is_admin ? 'user_promoted_admin' : 'user_demoted_admin',
            $user,
            ['email' => $user->email]
        );

        return back()->with('success', 'Admin status updated.');
    }

    // ── ANALYTICS ────────────────────────────────────────────────────────────

    public function analytics(Request $request)
    {
        $range = $request->range ?? '7';
        $start = match($range) {
            '7'      => Carbon::now()->subDays(7),
            '30'     => Carbon::now()->subDays(30),
            'custom' => Carbon::parse($request->from ?? now()->subDays(7)),
            default  => Carbon::now()->subDays(7),
        };
        $end = $range === 'custom'
            ? Carbon::parse($request->to ?? now())
            : Carbon::now();

        // Daily clicks in range
        $dailyClicks = AuditLog::where('action', 'link_visited')
            ->whereBetween('created_at', [$start, $end])
            ->selectRaw("DATE(created_at) as date, COUNT(*) as count")
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Top links
        $topLinks = ShortUrl::orderByDesc('visit_count')
            ->take(10)
            ->get(['short_code', 'original_url', 'visit_count']);

        // New links created per day
        $newLinks = ShortUrl::whereBetween('created_at', [$start, $end])
            ->selectRaw("DATE(created_at) as date, COUNT(*) as count")
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return Inertia::render('Admin/Analytics', [
            'dailyClicks' => $dailyClicks,
            'topLinks'    => $topLinks,
            'newLinks'    => $newLinks,
            'stats'       => $this->buildStats(),
            'filters'     => [
                'range' => $range,
                'from'  => $request->from,
                'to'    => $request->to,
            ],
        ]);
    }

    // ── AUDIT LOG ────────────────────────────────────────────────────────────

    public function auditLog(Request $request)
    {
        $logs = AuditLog::with('user')
            ->when($request->action, fn($q) => $q->where('action', $request->action))
            ->when($request->search, fn($q) =>
                $q->whereHas('user', fn($u) =>
                    $u->where('name', 'like', "%{$request->search}%")
                      ->orWhere('email', 'like', "%{$request->search}%")
                )
            )
            ->latest()
            ->paginate(30)
            ->withQueryString();

        $actions = AuditLog::distinct()->pluck('action')->sort()->values();

        return Inertia::render('Admin/AuditLog', [
            'logs'    => $logs,
            'actions' => $actions,
            'filters' => $request->only('action', 'search'),
        ]);
    }

    // ── PRIVATE ──────────────────────────────────────────────────────────────

    private function buildStats(): array
    {
        return [
            'total_links'   => ShortUrl::count(),
            'total_clicks'  => ShortUrl::sum('visit_count'),
            'total_users'   => User::count(),
            'active_users'  => User::where('is_active', true)->count(),
            'expired_links' => ShortUrl::whereNotNull('expires_at')
                                ->where('expires_at', '<', now())
                                ->count(),
            'links_today'   => ShortUrl::whereDate('created_at', today())->count(),
        ];
    }
}