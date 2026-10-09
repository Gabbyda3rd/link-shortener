<?php

namespace App\Policies;

use App\Models\ShortUrl;
use App\Models\User;

class ShortUrlPolicy
{
    /**
     * Create a new policy instance.
     */
    public function view(User $user, ShortUrl $shortUrl): bool
    {
        return $user->id === $shortUrl->user_id || $user->is_admin();
    }

    public function update(User $user, ShortUrl $shortUrl): bool
    {
        return $this->view($user, $shortUrl);
    }

    public function delete(User $user, ShortUrl $shortUrl): bool
    {
        return $this->view($user, $shortUrl);
    }

}
