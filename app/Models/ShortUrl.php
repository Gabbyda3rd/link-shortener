<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShortUrl extends Model
{
    protected $fillable = [
        'original_url',
        'short_code',
        'qr_code_path',
        'total_clicks', 
        'user_id', 
    ];
}
