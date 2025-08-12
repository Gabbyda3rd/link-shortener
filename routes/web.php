<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ShortUrlController; 
use SimpleSoftwareIO\QrCode\Facades\QrCode;

Route::get('/', [ShortUrlController::class, 'index'])->name('home');
Route::get('/shorten',[ShortUrlController::class,'index'])->name('shorten.create');
Route::post('/shorten',[ShortUrlController::class,'store'])->name('shorten.store');
Route::get('/{ShortCode}',[ShortUrlController::class,'redirect'])->name('shorten.redirect');
