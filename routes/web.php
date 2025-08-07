<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ShortUrlController; 
use SimpleSoftwareIO\QrCode\Facades\QrCode;

Route::get('/', function () {
    return view('shortener');
});
Route::get('/',[ShortUrlController::class,'index']);
Route::post('/shorten',[ShortUrlController::class,'store'])->name('shorten');
Route::get('/{code}',[ShortUrlController::class,'redirect']);
