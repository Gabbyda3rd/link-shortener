import { useState, useRef, useEffect } from 'react';
import { useForm, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    LinkIcon,
    ClipboardIcon,
    ClipboardDocumentIcon,
    CheckIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    ArrowTopRightOnSquareIcon,
    SparklesIcon,
    LockClosedIcon,
    EyeIcon,
    EyeSlashIcon,
    QrCodeIcon,
    PencilSquareIcon,
    CalendarDaysIcon,
} from '@heroicons/react/24/outline';

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

// People often paste addresses without "https://". Add it instead of showing an error.
const normalizeUrl = (u) => {
    const t = (u ?? '').trim();
    if (!t) return t;
    return /^https?:\/\//i.test(t) ? t : `https://${t}`;
};

const focusRing =
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B1113]/40 focus-visible:border-[#7B1113]';

const inputBase = `w-full rounded-lg border border-stone-300 bg-white px-3.5 py-3 text-base text-stone-800 placeholder-stone-500 transition ${focusRing} focus:ring-2 focus:ring-[#7B1113]/30 focus:border-[#7B1113]`;

// Optional extras. `hasField` = the card expands to show an input when switched on.
const EXTRAS = [
    { key: 'custom', icon: PencilSquareIcon, label: 'Custom link name', hint: 'Easy to remember, like freshman-orientation', hasField: true },
    { key: 'password', icon: LockClosedIcon, label: 'Password', hint: 'Visitors must type it before opening the link', hasField: true },
    { key: 'expiry', icon: CalendarDaysIcon, label: 'Expiry date', hint: 'The link stops working after this date', hasField: true },
    { key: 'qr', icon: QrCodeIcon, label: 'QR code', hint: 'For posters, tarpaulins, and printed forms', hasField: false },
];

const EMPTY_EXTRAS = { custom: false, qr: false, password: false, expiry: false };

// ── sub-components ────────────────────────────────────────────────────────────

/**
 * A card with a big toggle button at the top. When switched on, the card
 * grows and shows its own input field (the `children`) inside it.
 *
 * The toggle is a real <button>. The input sits OUTSIDE that button
 * (buttons can't contain inputs), but inside the same card.
 */
function OptionCard({ icon: Icon, label, hint, active, hasField, onToggle, children }) {
    return (
        <div
            className={`rounded-xl border-2 transition-all ${
                active
                    ? `border-[#7B1113] bg-[#7B1113]/5 shadow-sm ${hasField ? 'sm:col-span-2' : ''}`
                    : 'border-stone-200 bg-white hover:border-[#7B1113]/40 hover:bg-stone-50 hover:shadow-sm'
            }`}
        >
            <button
                type="button"
                onClick={onToggle}
                aria-pressed={active}
                className={`group w-full text-left p-4 rounded-xl flex items-start gap-3 ${focusRing} focus-visible:ring-offset-2`}
            >
                <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition ${
                        active
                            ? 'bg-[#7B1113] text-white'
                            : 'bg-stone-100 text-stone-600 group-hover:bg-[#7B1113]/10 group-hover:text-[#7B1113]'
                    }`}
                >
                    <Icon className="h-6 w-6" />
                </span>

                <span className="min-w-0 flex-1">
                    <span className="block text-base font-semibold text-stone-900">{label}</span>
                    <span className="mt-0.5 block text-sm text-stone-600">{hint}</span>
                    <span
                        className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
                            active ? 'bg-[#7B1113] text-white' : 'border border-stone-300 text-stone-700'
                        }`}
                    >
                        {active
                            ? <><CheckIcon className="h-4 w-4" strokeWidth={3} /> Added</>
                            : <><PlusIcon className="h-4 w-4" strokeWidth={3} /> Add</>}
                    </span>
                </span>
            </button>

            {/* The field lives inside the card */}
            {active && children && (
                <div className="mx-4 mb-4 border-t border-[#7B1113]/15 pt-4">
                    {children}
                </div>
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
            className={`shrink-0 flex items-center gap-1.5 min-h-[40px] px-3 rounded-lg border border-stone-300 text-sm font-medium text-[#7B1113] hover:bg-[#7B1113]/10 transition-colors ${focusRing}`}
        >
            {copied
                ? <><CheckIcon className="w-4 h-4 text-green-700" /><span className="text-green-800">Copied</span></>
                : <><ClipboardIcon className="w-4 h-4" />Copy</>}
        </button>
    );
}

function RecentLinkRow({ link }) {
    const shortUrl = `${window.location.origin}/${link.short_code}`;
    return (
        <div className="py-3 border-b border-stone-100 last:border-0">
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-base font-medium text-stone-900 truncate flex items-center gap-1.5">
                        {link.has_password && <LockClosedIcon className="w-4 h-4 text-[#7B1113] shrink-0" />}
                        <Link
                            href={route('links.show', link.id)}
                            className={`truncate hover:text-[#7B1113] hover:underline ${focusRing}`}
                        >
                            {link.title || link.short_code}
                        </Link>
                    </p>
                    <div className="flex items-center gap-1.5 text-sm text-stone-700">
                        <a
                            href={shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-[#7B1113] hover:underline truncate ${focusRing}`}
                        >
                            /{link.short_code}
                        </a>
                        <span aria-hidden="true">·</span>
                        <span className="whitespace-nowrap">
                            {link.visit_count.toLocaleString()} {link.visit_count === 1 ? 'click' : 'clicks'}
                        </span>
                    </div>
                    <p className="text-sm text-stone-600">{formatDate(link.created_at)}</p>
                </div>
                <CopyButton text={shortUrl} />
            </div>
        </div>
    );
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function Shortener({ auth, links = [], shortUrl = null, qrCodePath = null }) {
    const { shortDomain } = usePage().props;
    const domain = shortDomain ?? 'ikli';

    const [justCreated, setJustCreated] = useState(shortUrl);
    const [justCreatedQr, setJustCreatedQr] = useState(qrCodePath);
    const [copiedResult, setCopiedResult] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [pasteFailed, setPasteFailed] = useState(false);
    const [extras, setExtras] = useState(EMPTY_EXTRAS);
    const resultRef = useRef(null);

    const { data, setData, post, processing, errors, reset, transform } = useForm({
        url: '',
        link_type: 'auto',
        custom_code: '',
        title: '',
        expires_at: '',
        generate_qr: false,
        password: '',
    });

    const toggle = (key) => setExtras(prev => ({ ...prev, [key]: !prev[key] }));

    // Only send what the user actually turned on.
    transform((d) => ({
        ...d,
        url: normalizeUrl(d.url),
        link_type: extras.custom ? 'custom' : 'auto',
        custom_code: extras.custom ? d.custom_code : '',
        generate_qr: extras.qr,
        password: extras.password ? d.password : '',
        expires_at: extras.expiry ? d.expires_at : '',
    }));

    // Bring the result into view so nobody has to scroll to find it.
    useEffect(() => {
        if (justCreated && resultRef.current) {
            resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [justCreated]);

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
                reset('url', 'custom_code', 'expires_at', 'password', 'title', 'generate_qr');
                setData('link_type', 'auto');
                setExtras(EMPTY_EXTRAS);
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

    // Plain-language message for a bad URL.
    const urlError = errors.url
        ? "That doesn't look like a web address. Copy it from your browser's address bar and paste it here."
        : null;

    // The input that appears inside each card when it is switched on.
    const renderField = (key) => {
        if (key === 'custom') {
            return (
                <div>
                    <label htmlFor="custom_code" className="block text-sm font-medium text-stone-800 mb-1.5">
                        Type the name you want
                    </label>
                    <div className="flex items-center rounded-lg border border-stone-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#7B1113]/30 focus-within:border-[#7B1113] transition">
                        <span className="px-3 py-3 bg-stone-100 text-stone-700 text-base border-r border-stone-300 whitespace-nowrap">
                            {domain}/
                        </span>
                        <input
                            id="custom_code"
                            type="text"
                            autoFocus
                            value={data.custom_code}
                            onChange={e => setData('custom_code', e.target.value)}
                            placeholder="freshman-orientation"
                            className="flex-1 min-w-0 px-3 py-3 text-base text-stone-900 placeholder-stone-500 focus:outline-none bg-white"
                        />
                    </div>
                    <p className="text-sm text-stone-600 mt-1">Letters and numbers only, 3 to 20 characters.</p>
                    {errors.custom_code && <p className="text-sm text-red-700 mt-1">{errors.custom_code}</p>}
                </div>
            );
        }

        if (key === 'password') {
            return (
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-stone-800 mb-1.5">
                        Choose a password
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            autoFocus
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            placeholder="At least 6 characters"
                            autoComplete="new-password"
                            className={`${inputBase} pr-24`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(s => !s)}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 min-h-[40px] rounded text-sm font-medium text-stone-700 hover:text-stone-900 ${focusRing}`}
                        >
                            {showPassword
                                ? <><EyeSlashIcon className="w-4 h-4" />Hide</>
                                : <><EyeIcon className="w-4 h-4" />Show</>}
                        </button>
                    </div>
                    {errors.password && <p className="text-sm text-red-700 mt-1">{errors.password}</p>}
                </div>
            );
        }

        if (key === 'expiry') {
            return (
                <div>
                    <label htmlFor="expires_at" className="block text-sm font-medium text-stone-800 mb-1.5">
                        Pick the date and time it stops working
                    </label>
                    <input
                        id="expires_at"
                        type="datetime-local"
                        value={data.expires_at}
                        onChange={e => setData('expires_at', e.target.value)}
                        className={inputBase}
                    />
                    {errors.expires_at && <p className="text-sm text-red-700 mt-1">{errors.expires_at}</p>}
                </div>
            );
        }

        return null; // QR has no field
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            {/* ── HERO (compact) ── */}
            <section
                className="relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #6B0D0F 0%, #7B1113 60%, #5a0a0c 100%)' }}
            >
                <div className="relative max-w-5xl mx-auto px-5 py-6">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
                        Make every link <span className="text-[#FFD100]">easy to share.</span>
                    </h1>
                    <p className="text-white/85 text-base mt-1 max-w-xl">
                        Short links and QR codes for UP Manila events, forms, and announcements.
                    </p>
                </div>
            </section>

            {/* ── MAIN CONTENT ── */}
            <div className="bg-stone-50 min-h-screen">
                <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* ── LINK BUILDER ── */}
                    <div className="lg:col-span-3 bg-white rounded-2xl border border-stone-200 shadow-sm p-6 self-start">
                        <h2 className="text-xl font-bold text-stone-900 mb-4">Shorten a long link</h2>

                        <form onSubmit={submit} className="space-y-5">
                            {/* URL input */}
                            <div>
                                <label htmlFor="url" className="block text-base font-medium text-stone-800 mb-1.5">
                                    Paste your link here
                                </label>
                                <div className="relative">
                                    <LinkIcon className="w-5 h-5 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        id="url"
                                        type="text"
                                        inputMode="url"
                                        autoCapitalize="none"
                                        autoCorrect="off"
                                        value={data.url}
                                        onChange={e => setData('url', e.target.value)}
                                        placeholder="Example: https://forms.gle/abc123"
                                        autoFocus
                                        className={`w-full rounded-xl border-2 border-stone-300 pl-11 pr-28 py-4 text-lg text-stone-900 placeholder-stone-500 transition ${focusRing} focus:ring-2 focus:ring-[#7B1113]/30`}
                                    />
                                    <button
                                        type="button"
                                        onClick={pasteUrl}
                                        className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-lg px-3 min-h-[44px] text-sm font-semibold text-[#7B1113] hover:bg-[#7B1113]/10 ${focusRing}`}
                                    >
                                        <ClipboardDocumentIcon className="w-5 h-5" />
                                        Paste
                                    </button>
                                </div>
                                {pasteFailed && (
                                    <p className="text-sm text-stone-700 mt-1.5">
                                        Your browser blocked the Paste button. Click the box and press Ctrl+V instead.
                                    </p>
                                )}
                                {urlError && <p className="text-sm text-red-700 mt-1.5">{urlError}</p>}
                            </div>

                            {/* Optional extras — each card opens its own field */}
                            <div>
                                <p className="text-base font-medium text-stone-800 mb-0.5">Optional extras</p>
                                <p className="text-sm text-stone-600 mb-3">
                                    Tap a button to add it. Tap again to remove it.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                                    {EXTRAS.map(({ key, icon, label, hint, hasField }) => (
                                        <OptionCard
                                            key={key}
                                            icon={icon}
                                            label={label}
                                            hint={hint}
                                            hasField={hasField}
                                            active={extras[key]}
                                            onToggle={() => toggle(key)}
                                        >
                                            {renderField(key)}
                                        </OptionCard>
                                    ))}
                                </div>
                            </div>

                            {/* Primary action */}
                            <button
                                type="submit"
                                disabled={processing}
                                className={`w-full flex items-center justify-center gap-2 rounded-xl py-4 text-lg font-semibold text-white transition disabled:opacity-60 ${focusRing}`}
                                style={{ background: 'linear-gradient(90deg, #7B1113, #9B1517)' }}
                            >
                                <SparklesIcon className="w-5 h-5" />
                                {processing ? 'Shortening…' : 'Shorten link'}
                            </button>
                        </form>

                        {/* ── RESULT ── */}
                        {justCreated && (
                            <div
                                ref={resultRef}
                                role="status"
                                className="mt-6 rounded-xl border-2 border-green-300 bg-green-50 p-5"
                            >
                                <p className="text-base font-semibold text-green-800 mb-2">✓ Your short link is ready</p>

                                <a
                                    href={justCreated}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`block text-xl font-bold text-stone-900 break-all hover:underline rounded ${focusRing}`}
                                >
                                    {justCreated}
                                </a>

                                <div className="flex flex-wrap items-center gap-3 mt-4">
                                    <button
                                        type="button"
                                        onClick={copyResult}
                                        className={`flex items-center gap-2 text-base font-semibold px-5 min-h-[48px] rounded-lg bg-[#7B1113] text-white hover:bg-[#9B1517] transition ${focusRing}`}
                                    >
                                        {copiedResult
                                            ? <><CheckIcon className="w-5 h-5" /> Copied ✓</>
                                            : <><ClipboardIcon className="w-5 h-5" /> Copy link</>}
                                    </button>
                                    <a
                                        href={justCreated}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-2 text-base font-medium px-5 min-h-[48px] rounded-lg border border-green-400 bg-white text-green-900 hover:bg-green-100 transition ${focusRing}`}
                                    >
                                        <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                                        Test the link
                                    </a>
                                </div>

                                {justCreatedQr && (
                                    <div className="mt-5 flex flex-col items-start gap-2">
                                        <p className="flex items-center gap-1.5 text-base font-medium text-stone-800">
                                            <QrCodeIcon className="w-5 h-5" /> Your QR code
                                        </p>
                                        <img
                                            src={`/storage/${justCreatedQr}`}
                                            alt="QR code for the new short link"
                                            className="w-48 h-48 rounded border border-green-200 bg-white p-1"
                                        />
                                        <a
                                            href={`/storage/${justCreatedQr}`}
                                            download
                                            className={`inline-flex items-center min-h-[44px] text-base font-medium text-[#7B1113] hover:underline rounded ${focusRing}`}
                                        >
                                            Download QR code
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── RECENT LINKS ── */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-sm p-6 self-start">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <p className="text-sm text-stone-700">Your workspace</p>
                                <h2 className="text-xl font-bold text-stone-900">Recent links</h2>
                            </div>
                            <button
                                type="button"
                                aria-label="Search links"
                                className={`p-2.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition ${focusRing}`}
                            >
                                <MagnifyingGlassIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {links.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <LinkIcon className="w-8 h-8 text-stone-400 mb-2" />
                                <p className="text-base text-stone-700">
                                    No links yet. Paste a link on the left to make your first one.
                                </p>
                            </div>
                        ) : (
                            <div>
                                {links.map(link => (
                                    <RecentLinkRow key={link.id} link={link} />
                                ))}
                            </div>
                        )}

                        <Link
                            href={route('links.index')}
                            className={`mt-4 w-full flex items-center justify-center gap-1.5 text-base font-medium text-stone-800 border border-stone-300 rounded-lg min-h-[48px] hover:bg-stone-50 transition ${focusRing}`}
                        >
                            View all links
                            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}