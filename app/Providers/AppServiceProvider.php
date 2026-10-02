<?php

namespace App\Providers;

use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Cache\RateLimiting\Limit;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        Route::pattern('shortCode', '(?!(?:dashboard|admin|login|logout|register|shorten|storage|api)$)[a-zA-Z0-9]+');

        RateLimiter::for('link-create', fn (Request $r) => Limit::perMinute(20)->by($r->user()?->id ?: $r->ip()));
        RateLimiter::for('link-preview', fn(Request $r) => Limit::perMinute(120)->by($r->ip()));
        RateLimiter::for('link-confirm', fn(Request $r) => Limit::perMinute(60)->by($r->ip()));
    }
}
