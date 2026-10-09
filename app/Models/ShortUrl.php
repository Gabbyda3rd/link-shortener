<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class ShortUrl extends Model
{
    protected $fillable = [
        'user_id',
        'original_url',
        'short_code',
        'title',
        'qr_code_path',
        'visit_count',
        'expires_at',
        'password',
    ];

    protected $hidden = [
        'password',
    ];

    protected $appends = [
        'has_password',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    // Check if link is expired
    public function isExpired(): bool
    {
        return $this->expires_at && Carbon::now()->isAfter($this->expires_at);
    }

    // Relationship — link belongs to a user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getHasPasswordAttribute(): bool
    {
        return $this->password !== null;
    }

}