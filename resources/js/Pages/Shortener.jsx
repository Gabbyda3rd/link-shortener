import { useState, useEffect } from 'react';
import { useForm, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    LinkIcon,
    ClipboardIcon,
    ClipboardDocumentIcon,
    CheckIcon,
    ArrowTopRightOnSquareIcon,
    ArrowPathIcon,
    ArrowDownTrayIcon,
    SparklesIcon,
    LockClosedIcon,
    EyeIcon,
    EyeSlashIcon,
    QrCodeIcon,
    PencilSquareIcon,
    CalendarDaysIcon,
    CursorArrowRaysIcon,
    ClockIcon,
    QueueListIcon,
} from '@heroicons/react/24/outline';

// ── UP Manila palette ────────────────────────────────────────────────────────
// Maroon  #7B1113  primary (hero, icons, links)
// Deep    #5a0a0c  maroon shade for gradients
// Green   #014421  UP forest green (primary action, success)
// Gold    #E8B63A  accent, ONLY on maroon/dark backgrounds (contrast)

// ── helpers ──────────────────────────────────────────────────────────────────

const TZ = 'Asia/Manila';

// Calendar day in Manila time, so "Today" / "Yesterday" are correct.
const dayKey = (d) => d.toLocaleDateString('en-CA', { timeZone: TZ });

function formatDate(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const yesterday = new Date(now.getTime() - 86400000);
    const time = d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', timeZone: TZ });

    if (dayKey(d) === dayKey(now)) return `Today, ${time}`;
    if (dayKey(d) === dayKey(yesterday)) return `Yesterday, ${time}`;
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', timeZone: TZ });
}

// Greeting based on the hour in Manila.
function getGreeting() {
    const hour =
        Number(new Date().toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: TZ })) % 24;
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
}

// People often paste addresses without "https://". Add it instead of showing an error.
const normalizeUrl = (u) => {
    const t = (u ?? '').trim();
    if (!t) return t;
    return /^https?:\/\//i.test(t) ? t : `https://${t}`;
};

const focusRing =
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#014421]/50 focus-visible:border-[#014421]';

// Focus ring that stays visible on the maroon hero.
const focusRingOnDark =
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8B63A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#5a0a0c]';

const inputBase = `w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-base text-stone-800 placeholder-stone-500 transition ${focusRing} focus:ring-2 focus:ring-[#014421]/30 focus:border-[#014421]`;

const PLACEHOLDERS = [
    'https://forms.gle/abc123',
    'https://drive.google.com/file/d/…',
    'https://docs.google.com/document/d/…',
    'https://upm.edu.ph/announcements/…',
];

// ── sub-components ────────────────────────────────────────────────────────────

/** Small animations used by the hero. Respect "reduce motion". */
function HeroStyles() {
    return (
        <style>{`
            @keyframes ikli-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
            @keyframes ikli-pop { from { opacity: 0; transform: translateY(6px) scale(.98); } to { opacity: 1; transform: none; } }
            .ikli-float { animation: ikli-float 6s ease-in-out infinite; }
            .ikli-pop { animation: ikli-pop .25s ease-out both; }
            @media (prefers-reduced-motion: reduce) {
                .ikli-float { animation: none; }
                .ikli-pop { animation: none; }
            }
        `}</style>
    );
}

/** Frosted stat pill that sits on the maroon hero. */
function StatChip({ icon: Icon, label, value }) {
    return (
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white backdrop-blur">
            <Icon aria-hidden="true" className="w-4 h-4 text-[#E8B63A]" />
            <span className="font-bold text-[#E8B63A]">{Number(value).toLocaleString()}</span>
            <span className="text-white/90">{label}</span>
        </span>
    );
}

/** Toggle chip for an optional setting. */
function OptionChip({ icon: Icon, label, active, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 min-h-[40px] text-sm font-medium transition ${focusRingOnDark} ${
                active
                    ? 'border-white bg-white text-[#7B1113]'
                    : 'border-white/30 bg-white/10 text-white hover:bg-white/20'
            }`}
        >
            <Icon aria-hidden="true" className="w-4 h-4" />
            {label}
            {active && <CheckIcon aria-hidden="true" className="w-4 h-4 text-[#014421]" />}
        </button>
    );
}

/** Floating preview card on the right of the hero. Shows the real QR once one exists. */
function PreviewCard({ domain, qrPath }) {
    return (
        <div className="ikli-float w-full max-w-xs rounded-2xl border border-white/25 bg-white/10 p-5 text-white shadow-2xl backdrop-blur-md">
            {qrPath ? (
                <div className="ikli-pop flex flex-col items-center gap-3">
                    <p className="text-sm font-semibold uppercase tracking-wider text-[#E8B63A]">Your QR code</p>
                    <img
                        src={`/storage/${qrPath}`}
                        alt="QR code for the new short link"
                        className="h-40 w-40 rounded-lg bg-white p-1.5"
                    />
                    <a
                        href={`/storage/${qrPath}`}
                        download
                        className={`inline-flex items-center gap-1.5 rounded-lg bg-white px-4 min-h-[40px] text-sm font-semibold text-[#7B1113] hover:bg-stone-100 ${focusRingOnDark}`}
                    >
                        <ArrowDownTrayIcon aria-hidden="true" className="w-4 h-4" />
                        Download QR
                    </a>
                </div>
            ) : (
                <>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#E8B63A]">Example result</p>
                    <div className="mt-2 flex items-center gap-2 rounded-lg bg-white/90 px-3 py-2.5">
                        <LinkIcon aria-hidden="true" className="w-4 h-4 shrink-0 text-[#7B1113]" />
                        <span className="min-w-0 flex-1 truncate text-sm font-bold text-[#7B1113]">
                            {domain}/freshman-orientation
                        </span>
                        <ClipboardIcon aria-hidden="true" className="w-4 h-4 shrink-0 text-stone-600" />
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-white">
                            <QrCodeIcon aria-hidden="true" className="h-10 w-10 text-[#7B1113]" />
                        </span>
                        <p className="text-sm text-white/90">Short link and QR code, ready for posters and forms.</p>
                    </div>
                </>
            )}
        </div>
    );
}

function CopyButton({ text }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button
            type="button"
            onClick={copy}
            aria-label="Copy link"
            className={`shrink-0 flex items-center gap-1.5 min-h-[40px] px-3 rounded-lg border text-sm font-medium transition-colors ${
                copied
                    ? 'border-[#014421] bg-[#014421]/10 text-[#014421]'
                    : 'border-stone-300 text-[#7B1113] hover:bg-[#7B1113]/10'
            } ${focusRing}`}
        >
            {copied
                ? <><CheckIcon className="w-4 h-4" />Copied</>
                : <><ClipboardIcon className="w-4 h-4" />Copy</>}
        </button>
    );
}

/** Compact card for one recent link. */
function RecentCard({ link }) {
    const shortUrl = `${window.location.origin}/${link.short_code}`;
    return (
        <div className="flex flex-col gap-2 rounded-xl border border-stone-200 bg-white p-3.5 transition hover:shadow-md hover:border-[#7B1113]/30">
            <div className="flex items-center gap-2.5">
                <span className="grid place-items-center w-9 h-9 rounded-lg bg-[#7B1113]/10 text-[#7B1113] shrink-0">
                    {link.has_password
                        ? <LockClosedIcon aria-hidden="true" className="w-5 h-5" />
                        : <LinkIcon aria-hidden="true" className="w-5 h-5" />}
                </span>
                <div className="min-w-0 flex-1">
                    <Link
                        href={route('links.show', link.id)}
                        className={`block text-base font-semibold text-stone-900 truncate hover:text-[#7B1113] hover:underline rounded ${focusRing}`}
                    >
                        {link.title || link.short_code}
                    </Link>
                    <a
                        href={shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`block text-sm text-[#7B1113] hover:underline truncate rounded ${focusRing}`}
                    >
                        /{link.short_code}
                    </a>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-700">
                    <CursorArrowRaysIcon aria-hidden="true" className="w-3.5 h-3.5" />
                    {link.visit_count.toLocaleString()} {link.visit_count === 1 ? 'click' : 'clicks'}
                </span>
                {link.has_password && (
                    <span className="rounded-full bg-[#014421]/10 px-2 py-0.5 text-xs font-semibold text-[#014421]">
                        Protected
                    </span>
                )}
            </div>

            <div className="mt-auto flex items-center justify-between gap-2">
                <p className="text-sm text-stone-600 truncate">{formatDate(link.created_at)}</p>
                <CopyButton text={shortUrl} />
            </div>
        </div>
    );
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function Shortener({ links = [], shortUrl = null, qrCodePath = null, stats = null }) {
    const { shortDomain, auth } = usePage().props;
    const domain = shortDomain ?? 'I.upm.edu.ph';
    const firstName = auth?.user?.name?.trim().split(/\s+/)[0] ?? null;

    const [justCreated, setJustCreated] = useState(shortUrl);
    const [justCreatedQr, setJustCreatedQr] = useState(qrCodePath);
    const [copiedResult, setCopiedResult] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [pasteFailed, setPasteFailed] = useState(false);
    const [open, setOpen] = useState({ custom: false, password: false, expiry: false });
    const [phIndex, setPhIndex] = useState(0);

    const { data, setData, post, processing, errors, reset, transform } = useForm({
        url: '',
        link_type: 'auto',
        custom_code: '',
        expires_at: '',
        generate_qr: false,
        password: '',
    });

    // A field that is filled in is used, an empty one is ignored.
    // Options that are switched off are always cleared (see toggleOption), so nothing hidden is sent.
    transform((d) => {
        const custom = d.custom_code.trim();
        return {
            ...d,
            url: normalizeUrl(d.url),
            link_type: custom ? 'custom' : 'auto',
            custom_code: custom,
        };
    });

    // Cycle the example in the empty input.
    useEffect(() => {
        if (justCreated || data.url) return;
        const id = setInterval(() => setPhIndex((i) => (i + 1) % PLACEHOLDERS.length), 2800);
        return () => clearInterval(id);
    }, [justCreated, data.url]);

    const toggleOption = (key) => {
        const isOpen = open[key];
        if (isOpen) {
            // Closing an option clears its value, so it can't be sent by accident.
            if (key === 'custom') setData('custom_code', '');
            if (key === 'password') { setData('password', ''); setShowPassword(false); }
            if (key === 'expiry') setData('expires_at', '');
        }
        setOpen((o) => ({ ...o, [key]: !isOpen }));
    };

    const pasteUrl = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                setData('url', text.trim());
                setPasteFailed(false);
            }
        } catch {
            setPasteFailed(true);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('shorten.store'), {
            preserveScroll: true,
            onSuccess: (page) => {
                setJustCreated(page.props.shortUrl ?? null);
                setJustCreatedQr(page.props.qrCodePath ?? null);
                reset('url', 'custom_code', 'expires_at', 'password', 'generate_qr');
                setData('link_type', 'auto');
                setOpen({ custom: false, password: false, expiry: false });
                setShowPassword(false);
                setPasteFailed(false);
            },
        });
    };

    const copyResult = () => {
        if (!justCreated) return;
        navigator.clipboard.writeText(justCreated);
        setCopiedResult(true);
        setTimeout(() => setCopiedResult(false), 3000);
    };

    const shortenAnother = () => {
        setJustCreated(null);
        setJustCreatedQr(null);
        setCopiedResult(false);
    };

    // Plain-language message for a bad URL.
    const urlError = errors.url
        ? "That doesn't look like a web address. Copy it from your browser's address bar and paste it here."
        : null;

    const anyOptionOpen = open.custom || open.password || open.expiry;
    const recent = links.slice(0, 4);

    return (
        <AuthenticatedLayout>
            <HeroStyles />
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 space-y-5">

                {/* ── HERO: headline, input, options, stats ── */}
                <section
                    className="relative overflow-hidden rounded-2xl text-white shadow-lg"
                    style={{
                        background:
                            'radial-gradient(600px circle at 92% 8%, rgba(1,68,33,0.6), transparent 60%), radial-gradient(520px circle at 70% 125%, rgba(232,182,58,0.2), transparent 60%), linear-gradient(120deg, #7B1113 0%, #5a0a0c 100%)',
                    }}
                >
                    {/* texture */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 opacity-100"
                        style={{
                            backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
                            backgroundSize: '18px 18px',
                        }}
                    />
                    {/* accent bar: green with gold edge */}
                    <div aria-hidden="true" className="absolute left-0 inset-y-0 w-1.5 bg-[#014421]" />
                    <div aria-hidden="true" className="absolute left-1.5 inset-y-0 w-0.5 bg-[#E8B63A]" />

                    <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-6 px-6 sm:px-8 py-6 items-center">
                        {/* left: the working area */}
                        <div className="lg:col-span-3 min-w-0">
                            <p className="text-sm font-semibold uppercase tracking-wider text-[#E8B63A]">
                                {firstName ? `${getGreeting()}, ${firstName}` : 'UP Manila link tools'}
                            </p>
                            <h1 className="mt-1 text-3xl md:text-4xl font-extrabold leading-tight">
                                Make every link <span className="text-[#E8B63A]">easy to share.</span>
                            </h1>
                            <p className="mt-1.5 max-w-xl text-base text-white/90">
                                Short links and QR codes for UP Manila events, forms, and announcements.
                            </p>

                            {justCreated ? (
                                /* ── RESULT replaces the input ── */
                                <div role="status" className="ikli-pop mt-5">
                                    <p className="mb-2 flex items-center gap-1.5 text-base font-semibold text-white">
                                        <span className="grid h-6 w-6 place-items-center rounded-full bg-[#014421] ring-2 ring-[#E8B63A]">
                                            <CheckIcon aria-hidden="true" className="h-4 w-4 text-white" />
                                        </span>
                                        Your short link is ready
                                    </p>
                                    <div className="flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl sm:flex-row sm:items-center">
                                        <a
                                            href={justCreated}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`min-w-0 flex-1 truncate rounded-lg px-3 py-2 text-lg font-bold text-[#7B1113] hover:underline ${focusRing}`}
                                        >
                                            {justCreated}
                                        </a>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={copyResult}
                                                className={`flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#7B1113] px-5 min-h-[48px] text-base font-semibold text-white transition hover:bg-[#5a0a0c] sm:flex-none ${focusRing}`}
                                            >
                                                {copiedResult
                                                    ? <><CheckIcon className="w-5 h-5" />Copied</>
                                                    : <><ClipboardIcon className="w-5 h-5" />Copy link</>}
                                            </button>
                                            <a
                                                href={justCreated}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`flex items-center gap-1.5 rounded-xl border border-[#014421]/50 px-4 min-h-[48px] text-base font-medium text-[#014421] transition hover:bg-[#014421]/10 ${focusRing}`}
                                            >
                                                <ArrowTopRightOnSquareIcon aria-hidden="true" className="w-5 h-5" />
                                                Test
                                            </a>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={shortenAnother}
                                        className={`mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-4 min-h-[40px] text-sm font-medium text-white transition hover:bg-white/20 ${focusRingOnDark}`}
                                    >
                                        <ArrowPathIcon aria-hidden="true" className="w-4 h-4" />
                                        Shorten another link
                                    </button>
                                </div>
                            ) : (
                                /* ── INPUT + OPTIONS ── */
                                <form onSubmit={submit} className="mt-5">
                                    <div className="flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl sm:flex-row sm:items-center">
                                        <div className="relative min-w-0 flex-1">
                                            <LinkIcon aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500" />
                                            <label htmlFor="url" className="sr-only">Paste your link here</label>
                                            <input
                                                id="url"
                                                type="text"
                                                inputMode="url"
                                                autoCapitalize="none"
                                                autoCorrect="off"
                                                value={data.url}
                                                onChange={e => setData('url', e.target.value)}
                                                placeholder={PLACEHOLDERS[phIndex]}
                                                autoFocus
                                                className={`w-full rounded-xl border-0 bg-transparent py-3.5 pl-11 pr-24 text-lg text-stone-900 placeholder-stone-500 ${focusRing}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={pasteUrl}
                                                className={`absolute right-1 top-1/2 flex min-h-[44px] -translate-y-1/2 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-[#7B1113] hover:bg-[#7B1113]/10 ${focusRing}`}
                                            >
                                                <ClipboardDocumentIcon aria-hidden="true" className="w-5 h-5" />
                                                Paste
                                            </button>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className={`group flex items-center justify-center gap-2 rounded-xl bg-[#014421] px-6 min-h-[52px] text-lg font-semibold text-white shadow-md transition hover:bg-[#02592b] hover:shadow-lg disabled:opacity-60 ${focusRing}`}
                                        >
                                            <SparklesIcon aria-hidden="true" className="w-5 h-5 text-[#E8B63A] transition group-hover:rotate-12" />
                                            {processing ? 'Shortening…' : 'Shorten'}
                                        </button>
                                    </div>

                                    {pasteFailed && (
                                        <p className="mt-2 rounded-md bg-white/95 px-3 py-1.5 text-sm text-stone-800">
                                            Your browser blocked the Paste button. Click the box and press Ctrl+V instead.
                                        </p>
                                    )}
                                    {urlError && (
                                        <p role="alert" className="mt-2 rounded-md bg-white/95 px-3 py-1.5 text-sm font-medium text-red-700">
                                            {urlError}
                                        </p>
                                    )}

                                    {/* Optional settings: nothing is required */}
                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <span className="text-sm text-white/80">Optional:</span>
                                        <OptionChip icon={PencilSquareIcon} label="Custom name" active={open.custom} onClick={() => toggleOption('custom')} />
                                        <OptionChip icon={LockClosedIcon} label="Password" active={open.password} onClick={() => toggleOption('password')} />
                                        <OptionChip icon={CalendarDaysIcon} label="Expiry" active={open.expiry} onClick={() => toggleOption('expiry')} />
                                        <OptionChip icon={QrCodeIcon} label="QR code" active={data.generate_qr} onClick={() => setData('generate_qr', !data.generate_qr)} />
                                    </div>

                                    {anyOptionOpen && (
                                        <div className="ikli-pop mt-3 grid grid-cols-1 gap-3 rounded-xl bg-white p-4 text-stone-800 shadow-lg sm:grid-cols-2">
                                            {open.custom && (
                                                <div className="sm:col-span-2">
                                                    <label htmlFor="custom_code" className="text-base font-medium text-stone-800">
                                                        Custom link name
                                                    </label>
                                                    <p className="text-sm text-stone-600">
                                                        Letters and numbers only, 3 to 20 characters.
                                                    </p>
                                                    <div className="mt-1.5 flex items-center overflow-hidden rounded-lg border border-stone-300 bg-white transition focus-within:border-[#014421] focus-within:ring-2 focus-within:ring-[#014421]/30">
                                                        <span className="whitespace-nowrap border-r border-stone-300 bg-[#014421]/10 px-3 py-2.5 text-base font-medium text-[#014421]">
                                                            {domain}/
                                                        </span>
                                                        <input
                                                            id="custom_code"
                                                            type="text"
                                                            autoFocus
                                                            value={data.custom_code}
                                                            onChange={e => setData('custom_code', e.target.value)}
                                                            placeholder="freshman-orientation"
                                                            className="min-w-0 flex-1 bg-white px-3 py-2.5 text-base text-stone-900 placeholder-stone-500 focus:outline-none"
                                                        />
                                                    </div>
                                                    {errors.custom_code && <p className="mt-1 text-sm text-red-700">{errors.custom_code}</p>}
                                                </div>
                                            )}

                                            {open.password && (
                                                <div>
                                                    <label htmlFor="password" className="text-base font-medium text-stone-800">
                                                        Password
                                                    </label>
                                                    <p className="text-sm text-stone-600">Visitors must type it to open the link.</p>
                                                    <div className="relative mt-1.5">
                                                        <input
                                                            id="password"
                                                            type={showPassword ? 'text' : 'password'}
                                                            autoFocus
                                                            value={data.password}
                                                            onChange={e => setData('password', e.target.value)}
                                                            placeholder="At least 6 characters"
                                                            autoComplete="new-password"
                                                            className={`${inputBase} pr-20`}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(s => !s)}
                                                            className={`absolute right-2 top-1/2 flex min-h-[40px] -translate-y-1/2 items-center gap-1 rounded px-2 text-sm font-medium text-stone-700 hover:text-stone-900 ${focusRing}`}
                                                        >
                                                            {showPassword
                                                                ? <><EyeSlashIcon className="w-4 h-4" />Hide</>
                                                                : <><EyeIcon className="w-4 h-4" />Show</>}
                                                        </button>
                                                    </div>
                                                    {errors.password && <p className="mt-1 text-sm text-red-700">{errors.password}</p>}
                                                </div>
                                            )}

                                            {open.expiry && (
                                                <div>
                                                    <label htmlFor="expires_at" className="text-base font-medium text-stone-800">
                                                        Expiry date
                                                    </label>
                                                    <p className="text-sm text-stone-600">The link stops working after this date.</p>
                                                    <input
                                                        id="expires_at"
                                                        type="datetime-local"
                                                        autoFocus
                                                        value={data.expires_at}
                                                        onChange={e => setData('expires_at', e.target.value)}
                                                        className={`${inputBase} mt-1.5`}
                                                    />
                                                    {errors.expires_at && <p className="mt-1 text-sm text-red-700">{errors.expires_at}</p>}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </form>
                            )}

                            {/* Stats: only shown when the controller sends `stats` */}
                            {stats && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <StatChip icon={QueueListIcon} label="links" value={stats.links} />
                                    <StatChip icon={CursorArrowRaysIcon} label="total clicks" value={stats.clicks} />
                                    <StatChip icon={ClockIcon} label="made today" value={stats.today} />
                                </div>
                            )}
                        </div>

                        {/* right: floating preview card (large screens only) */}
                        <div aria-hidden={!justCreatedQr} className="hidden lg:col-span-2 lg:flex items-center justify-center">
                            <PreviewCard domain={domain} qrPath={justCreatedQr} />
                        </div>
                    </div>
                </section>

                {/* ── RECENT LINKS ── */}
                <section aria-labelledby="recent-heading">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <h2 id="recent-heading" className="flex items-center gap-2 text-xl font-bold text-[#7B1113]">
                            <ClockIcon aria-hidden="true" className="w-6 h-6" />
                            Recent links
                        </h2>
                        <Link
                            href={route('links.index')}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 min-h-[40px] text-base font-semibold text-[#7B1113] transition hover:bg-[#7B1113]/10 ${focusRing}`}
                        >
                            View all links
                            <ArrowTopRightOnSquareIcon aria-hidden="true" className="w-4 h-4" />
                        </Link>
                    </div>

                    {recent.length === 0 ? (
                        <div className="flex items-center gap-3 rounded-xl border border-dashed border-stone-300 bg-white px-5 py-6">
                            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#7B1113]/10">
                                <LinkIcon aria-hidden="true" className="h-6 w-6 text-[#7B1113]" />
                            </span>
                            <p className="text-base text-stone-700">
                                No links yet. Paste a link above to make your first one.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {recent.map(link => (
                                <RecentCard key={link.id} link={link} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </AuthenticatedLayout>
    );
}