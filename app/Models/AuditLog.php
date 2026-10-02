<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $fillable = [
        'user_id',
        'action',
        'target_type',
        'target_id',
        'metadata',
        'ip_address',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Convenience logger — call from anywhere
    public static function log(string $action, ?Model $target = null, array $metadata = [], ?int $userId = null): void
    {
        static::create([
            'user_id'     => $userId ?? auth()->id(),
            'action'      => $action,
            'target_type' => $target ? class_basename($target) : null,
            'target_id'   => $target?->getKey(),
            'metadata'    => $metadata,
            'ip_address'  => request()->ip(),
        ]);
    }
}