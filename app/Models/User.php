<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'fname',
        'mname',
        'lname',
        'up_email',
        'is_admin',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'is_admin'          => 'boolean',
            'is_active'         => 'boolean',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->is_admin;
    }

    public function shortUrls()
    {
        return $this->hasMany(ShortUrl::class);
    }

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }
}