import { useState, useEffect } from 'react';
import { router, useForm } from '@inertiajs/react';
import {
    ShieldCheckIcon,
    ArrowTopRightOnSquareIcon,
    XCircleIcon,
    ClockIcon,
    LinkIcon,
    LockClosedIcon,
} from '@heroicons/react/24/outline';

function truncate(str, n) {
    return str.length > n ? str.slice(0, n) + '…' : str;
}

// NEW: requires_password comes from ShortUrlController::preview()
export default function LinkPreview({ short_code, original_url, requires_password = false, short_url, expires_at }) {
    const [countdown, setCountdown] = useState(10);
    const [proceeded, setProceeded] = useState(false);

    // NEW: a small form just for the password
    const { data, setData, post, processing, errors } = useForm({ password: '' });

    // Auto-redirect after the countdown, but never for password-protected links
    useEffect(() => {
        if (requires_password) return; // NEW: wait for the visitor to unlock instead

        if (countdown <= 0) {
            handleContinue();
            return;
        }
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown, requires_password]);

    const handleContinue = () => {
        if (proceeded) return;
        setProceeded(true);
        // POST to confirm — server logs click then redirects
        router.post(route('redirect.confirm', short_code));
    };

    // NEW: send the typed password to the same confirm route
    const handleUnlock = (e) => {
        e.preventDefault();
        post(route('redirect.confirm', short_code));
    };

    const handleCancel = () => {
        window.history.back();
    };

    // CHANGED: original_url is null for protected links, so guard against it
    const hostname = (() => {
        if (!original_url) return null;
        try { return new URL(original_url).hostname; }
        catch { return original_url; }
    })();

    return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md">

                {/* Header badge */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    <div className="w-10 h-10 rounded-full bg-[#FFD100] flex items-center justify-center">
                        <LinkIcon className="w-5 h-5 text-[#7B1113]" />
                    </div>
                    <span className="text-sm font-bold text-stone-700">IKLI · UP Manila</span>
                </div>

                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">

                    {/* Top bar */}
                    <div className="bg-[#7B1113] px-6 py-4 text-white">
                        <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-1">
                            {requires_password ? 'This link is locked' : "You're about to visit"}
                        </p>
                        <div className="flex items-center gap-2">
                            {requires_password
                                ? <LockClosedIcon className="w-5 h-5 text-[#FFD100] shrink-0" />
                                : <ShieldCheckIcon className="w-5 h-5 text-[#FFD100] shrink-0" />}
                            <p className="font-bold text-lg truncate">
                                {requires_password ? 'Password required' : hostname}
                            </p>
                        </div>
                    </div>

                    <div className="px-6 py-5 space-y-4">

                        {/* Short link info */}
                        <div className="bg-stone-50 rounded-xl border border-stone-200 px-4 py-3">
                            <p className="text-xs text-stone-400 mb-1">Short link</p>
                            <p className="text-sm font-medium text-[#7B1113]">{short_url}</p>
                        </div>

                        {/* Destination: hidden until a protected link is unlocked */}
                        {requires_password ? (
                            <p className="text-sm text-stone-500">
                                The owner of this link set a password. Enter it to see where the link goes.
                            </p>
                        ) : (
                            <div className="bg-stone-50 rounded-xl border border-stone-200 px-4 py-3">
                                <p className="text-xs text-stone-400 mb-1">Destination</p>
                                <p className="text-sm text-stone-700 break-all">
                                    {truncate(original_url, 80)}
                                </p>
                            </div>
                        )}

                        {/* Expiry if set */}
                        {expires_at && (
                            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                                <ClockIcon className="w-4 h-4 shrink-0" />
                                <span>This link expires on {new Date(expires_at).toLocaleDateString('en-PH', { dateStyle: 'long' })}</span>
                            </div>
                        )}

                        {/* Warning */}
                        <p className="text-xs text-stone-400 text-center">
                            This is a shortened link created via UP Manila's IKLI system.
                            Only continue if you trust the source.
                        </p>

                        {requires_password ? (
                            /* NEW: unlock form for protected links */
                            <form onSubmit={handleUnlock} className="space-y-3 pt-1">
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    placeholder="Enter password"
                                    autoFocus
                                    autoComplete="off"
                                    className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#7B1113]/30 focus:border-[#7B1113] transition"
                                />
                                {errors.password && (
                                    <p className="text-xs text-red-500">{errors.password}</p>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-stone-200 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 transition"
                                    >
                                        <XCircleIcon className="w-4 h-4" />
                                        Go back
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition disabled:opacity-60"
                                        style={{ background: 'linear-gradient(90deg, #7B1113, #9B1517)' }}
                                    >
                                        <LockClosedIcon className="w-4 h-4" />
                                        {processing ? 'Checking…' : 'Unlock link'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            /* Original buttons for normal links */
                            <div className="flex gap-3 pt-1">
                                <button
                                    onClick={handleCancel}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-stone-200 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 transition"
                                >
                                    <XCircleIcon className="w-4 h-4" />
                                    Go back
                                </button>

                                <button
                                    onClick={handleContinue}
                                    disabled={proceeded}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition disabled:opacity-60"
                                    style={{ background: 'linear-gradient(90deg, #7B1113, #9B1517)' }}
                                >
                                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                    Continue ({countdown})
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* The countdown only applies to normal links */}
                {!requires_password && (
                    <p className="text-center text-xs text-stone-400 mt-4">
                        You'll be redirected automatically in {countdown}s
                    </p>
                )}
            </div>
        </div>
    );
}