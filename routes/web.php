<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ShortUrlController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\LinkController;

// Protected routes — must be logged in
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [ShortUrlController::class, 'index'])->name('home');
    Route::get('/dashboard', [ShortUrlController::class, 'index'])->name('dashboard');
    Route::get('/shorten', [ShortUrlController::class, 'index'])->name('shorten.index');
    Route::post('/shorten', [ShortUrlController::class, 'store'])->middleware('throttle:link-create')->name('shorten.store');
    Route::get('/links', [LinkController::class, 'index'])->name('links.index');
    Route::get('/links/{shortUrl}', [LinkController::class, 'show'])->name('links.show');
    Route::delete('/links/{shortUrl}', [LinkController::class, 'destroy'])->name('links.destroy');
    Route::patch('/links/{shortUrl}', [LinkController::class, 'update'])->name('links.update');
});


require __DIR__.'/auth.php';


// Admin routes
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminController::class, 'index'])->name('dashboard');

    // Link management
    Route::get('/links', [AdminController::class, 'links'])->name('links');
    Route::delete('/links/{shortUrl}', [AdminController::class, 'deleteLink'])->name('links.destroy');
    Route::patch('/links/{shortUrl}/expiry', [AdminController::class, 'updateExpiry'])->name('links.expiry');

    // User management
    Route::get('/users', [AdminController::class, 'users'])->name('users');
    Route::patch('/users/{user}/toggle', [AdminController::class, 'toggleUser'])->name('users.toggle');
    Route::patch('/users/{user}/admin', [AdminController::class, 'toggleAdmin'])->name('users.admin');
    Route::post('/users', [AdminController::class, 'storeUser'])->name('users.store');
    Route::put('/users/{user}', [AdminController::class, 'updateUser'])->name('users.update');
    Route::delete('/users/{user}', [AdminController::class, 'deleteUser'])->name('users.destroy');


    // Analytics
    Route::get('/analytics', [AdminController::class, 'analytics'])->name('analytics');

    // Audit log
    Route::get('/audit-log', [AdminController::class, 'auditLog'])->name('audit-log');
});


// Public redirect routes
Route::get('/{shortCode}', [ShortUrlController::class, 'preview'])
    ->middleware('throttle:link-preview')
    ->name('redirect.preview');

Route::post('/{shortCode}/confirm', [ShortUrlController::class, 'confirm'])
    ->middleware('throttle:link-confirm')
    ->name('redirect.confirm');