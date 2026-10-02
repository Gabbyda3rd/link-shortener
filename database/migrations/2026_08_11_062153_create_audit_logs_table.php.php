<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('action');         // e.g. link_created, link_deleted, user_deactivated, link_visited
            $table->string('target_type')->nullable();   // e.g. ShortUrl, User
            $table->unsignedBigInteger('target_id')->nullable();
            $table->json('metadata')->nullable();        // extra info e.g. short_code, original_url
            $table->string('ip_address')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};