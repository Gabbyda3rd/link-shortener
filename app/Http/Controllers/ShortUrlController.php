<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage; 
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use App\Models\ShortUrl;


class ShortUrlController extends Controller
{
    public function index()
    {
        return view('shortener');
    }

    public function store(Request $request)
    {

        $request->validate([
            'url'=>'required|url'
        ]);

        $shortCode = Str::random(6);
        $shortUrl = url("/{$shortCode}");
        

        $qrPath = "qrcode/{$shortCode}.svg";
        // Storage::makeDirectory($qrPath);
        // Storage::put($qrPath,QrCode::format('svg')->size(200)->generate($shorUrl));
        Storage::disk('public')->makeDirectory('qrcode');
        Storage::disk('public')->put($qrPath,QrCode::format('svg')->size(200)->generate($shortUrl));



        $short = ShortUrl::create([
            'original_url'=>$request->input('url'),
            'short_code'=>$shortCode,
            'qr_code_path'=>$qrPath
        ]);

        return view('shortener',[
            'shortUrl'=>$shortUrl,
            'qrCodePath'=>$qrPath
        ]);
    }

    public function redirect($code)
    {
        $short = ShortUrl::where('short_code',$code)->firstOrFail();
        $short->increment('visit_count');
        return redirect($short->original_url);
    }
}
