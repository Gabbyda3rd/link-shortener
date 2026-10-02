import { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    LinkIcon,
    ClipboardIcon,
    CheckIcon,
    MagnifyingGlassIcon,
    ArrowTopRightOnSquareIcon,
    SparklesIcon,
    ChartBarIcon,
    BuildingLibraryIcon,
    LockClosedIcon,
    EyeIcon,
    EyeSlashIcon,
} from '@heroicons/react/24/outline';

// ── helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - d) / 86400000);
    if (diffDays === 0) {
        return `Today, ${d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })}`;
    }
    if (diffDays === 1) {
        return `Yesterday, ${d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })}`;
    }
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

function shortDomain(code) {
    return `lit.upm.edu.ph/${code}`;
}

// ── sub-components ────────────────────────────────────────────────────────────

function CopyButton({ text }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button
            onClick={copy}
            title="Copy link"
            className="p-1.5 rounded text-[#7B1113]/50 hover:text-[#7B1113] hover:bg-[#7B1113]/10 transition-colors"
        >
            {copied
                ? <CheckIcon className="w-4 h-4 text-green-600" />
                : <ClipboardIcon className="w-4 h-4" />}
        </button>
    );
}

function RecentLinkRow({ link }) {
    const shortUrl = `${window.location.origin}/${link.short_code}`;
    return (
        <div className="flex items-center justify-between py-3.5 border-b border-stone-100 last:border-0">
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-stone-800 truncate flex items-center gap-1">
                    {link.has_password && <LockClosedIcon className="w-3.5 h-3.5 text-[#7B1113] shrink-0" />}
                    <span className="truncate">{link.title || link.short_code}</span>
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                    <a  
                        href={shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#7B1113] hover:underline truncate"
                    >
                        {shortDomain(link.short_code)}
                    </a>
                    <CopyButton text={shortUrl} />
                </div>
                <p className="text-xs text-stone-400 mt-0.5">{formatDate(link.created_at)}</p>
            </div>
            <div className="ml-4 text-right shrink-0">
                <p className="text-base font-bold text-stone-800">{link.visit_count.toLocaleString()}</p>
                <p className="text-xs text-stone-400">clicks</p>
            </div>
        </div>
    );
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function Shortener({ auth, links = [], shortUrl = null, qrCodePath = null }) {
    const [linkType, setLinkType] = useState('auto');
    const [justCreated, setJustCreated] = useState(shortUrl);
    const [justCreatedType, setJustCreatedType] = useState(null);
    const [justCreatedQr, setJustCreatedQr] = useState(qrCodePath);
    const [copiedResult, setCopiedResult] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        url: '',
        link_type: 'auto',
        custom_code: '',
        expires_at: '',
        generate_qr: false,
        password: '',
    });

    const handleLinkType = (type) => {
        setLinkType(type);
        setData(prev => ({...prev, link_type: type, generate_qr: false}));
    };

    const submit = (e) => {
        e.preventDefault();
        const submittedType = linkType;
        post(route('shorten.store'), {
            preserveScroll: true,
            onSuccess: (page) => {
                setJustCreated(page.props.shortUrl ?? null);
                setJustCreatedQr(page.props.qrCodePath ?? null);
                setJustCreatedType(submittedType);
                reset('url', 'custom_code', 'expires_at','password');
                setShowPassword(false);
                setLinkType('auto');
                setData('link_type', 'auto');
            },
        });
    };

    const copyResult = () => {
        if (!justCreated) return;
        navigator.clipboard.writeText(justCreated);
        setCopiedResult(true);
        setTimeout(() => setCopiedResult(false), 2000);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            {/* ── HERO ── */}
            <section
                className="relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #6B0D0F 0%, #7B1113 60%, #5a0a0c 100%)' }}
            >
                {/* subtle dot texture */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                        backgroundSize: '28px 28px',
                    }}
                />
                <div className="relative max-w-3xl mx-auto px-5 py-15 md:py-15">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-[#FFD100]/80 border border-[#FFD100]/30 rounded-full px-3 py-1 mb-6 mt-5">
                        <SparklesIcon className="w-3.5 h-3.5" />
                        Built for UP Manila
                    </span>
                    <h1 className="text-4xl md:text-3xl font-extrabold text-white leading-tight">
                        Make every link
                    </h1>
                    <h1 className="text-4xl md:text-3xl font-extrabold text-[#FFD100] leading-tight mb-4">
                        easy to share.
                    </h1>
                    <p className="text-white/70 text-base md:text-lg max-w-md mb-4">
                        Trim long URLs into trackable links and scannable QR codes for every event, form, and announcement at UP Manila.
                    </p>
                </div>
            </section>

            {/* ── MAIN CONTENT ── */}
            <div className="bg-stone-50 min-h-screen">
                <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* ── LINK BUILDER CARD ── */}
                    <div className="lg:col-span-3 bg-white rounded-2xl border border-stone-200 shadow-sm p-6 ">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-xs font-semibold tracking-widest uppercase text-[#7B1113] mb-1">
                                    Link Builder
                                </p>
                                <h2 className="text-xl font-bold text-stone-800">Shorten a long URL</h2>
                                <p className="text-sm text-stone-500 mt-0.5">
                                    Turn a messy URL into something your audience can remember.
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-[#FFD100] flex items-center justify-center shrink-0">
                                <LinkIcon className="w-5 h-5 text-[#7B1113]" />
                            </div>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            {/* URL input */}
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">
                                    Destination URL
                                </label>
                                <input
                                    type="url"
                                    value={data.url}
                                    onChange={e => setData('url', e.target.value)}
                                    placeholder="https://upm.edu.ph/your-long-link"
                                    className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#7B1113]/30 focus:border-[#7B1113] transition"
                                />
                                {errors.url && <p className="text-xs text-red-500 mt-1">{errors.url}</p>}
                            </div>

                            {/* Link type */}
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">
                                    Link style
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { value: 'auto', label: 'Auto-generated', sub: 'Fast and unique every time' },
                                        { value: 'custom', label: 'Custom Link', sub: 'Make it easy to remember' },
                                        { value: 'qr_only', label: 'Generate QR', sub: 'Show QR, hide the short link'},
                                    ].map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => handleLinkType(opt.value)}
                                            className={`text-left rounded-lg border px-3.5 py-2.5 transition ${
                                                linkType === opt.value
                                                    ? 'border-[#7B1113] bg-[#7B1113]/5 ring-1 ring-[#7B1113]/20'
                                                    : 'border-stone-200 hover:border-stone-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-stone-800">{opt.label}</span>
                                                {linkType === opt.value && (
                                                    <CheckIcon className="w-4 h-4 text-[#7B1113]" />
                                                )}
                                            </div>
                                            <p className="text-xs text-stone-400 mt-0.5">{opt.sub}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom slug input */}
                            {linkType === 'custom' && (
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">
                                        Custom slug
                                    </label>
                                    <div className="flex items-center rounded-lg border border-stone-300 overflow-hidden focus-within:ring-2 focus-within:ring-[#7B1113]/30 focus-within:border-[#7B1113] transition">
                                        <span className="px-3 py-2.5 bg-stone-50 text-stone-400 text-sm border-r border-stone-300 whitespace-nowrap">
                                            lit.upm.edu.ph/
                                        </span>
                                        <input
                                            type="text"
                                            value={data.custom_code}
                                            onChange={e => setData('custom_code', e.target.value)}
                                            placeholder="freshie-2026"
                                            className="flex-1 px-3 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none bg-white"
                                        />
                                    </div>
                                    {errors.custom_code && (
                                        <p className="text-xs text-red-500 mt-1">{errors.custom_code}</p>
                                    )}
                                </div>
                            )}

                            {linkType === 'auto' && (
                                <div className="flex items-center gap-2">
                                    <input type="checkbox"
                                           id="generate_qr"
                                           checked={data.generate_qr}
                                           onChange={e =>setData('generate_qr',e.target.checked)}
                                           className="w-4 h-4 accent-[#7B1113]" />
                                           <label htmlFor="generate_qr"
                                                  className="text-sm text-stone-700 select-none" >
                                                    Also Generate a QR
                                            </label>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">
                                    Password <span className="text-stone-400 font-normal">(optional)</span>
                                </label>
                                <div className="relative">
                                    <LockClosedIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        placeholder="Leave empty for a public link"
                                        autoComplete="new-password"
                                        className="w-full rounded-lg border border-stone-300 pl-9 pr-10 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#7B1113]/30 focus:border-[#7B1113] transition"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(s => !s)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700"
                                    >
                                        {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                                <p className="text-xs text-stone-400 mt-1">
                                    Visitors must enter this before they are sent to the destination.
                                </p>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition disabled:opacity-60"
                                style={{ background: 'linear-gradient(90deg, #7B1113, #9B1517)' }}
                            >
                                <SparklesIcon className="w-4 h-4" />
                                {processing ? 'Shortening…' : 'Shorten URL'}
                            </button>
                        </form>

                        {/* ── RESULT ── */}
                        {justCreated && (
                            <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
                                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">
                                    ✓ Link created
                                </p>
                                {justCreatedType !== 'qr_only' &&(
                                    <div className="flex items-center gap-2">
                                        <a href={justCreated} target="_blank" rel="noopener noreferrer">
                                            {justCreated}
                                        </a>
                                        <button onClick={copyResult}
                                            className="shrink-0 flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border border-green-300 bg-white text-green-700 hover:bg-green-100 transition">
                                            {copiedResult
                                                ? <><CheckIcon className="w-3.5 h-3.5" /> Copied</>
                                                : <><ClipboardIcon className="w-3.5 h-3.5" /> Copy</>}
                                        </button>
                                    </div>
                                )}

                                {justCreatedQr && (
                                    <div className="mt-3 flex flex-col items-start gap-2">
                                        <img
                                            src={`/storage/${justCreatedQr}`}
                                            alt="QR code"
                                            className="w-60 h-60 rounded border border-green-200 bg-white p-1"
                                        />
                                        <a
                                            href={`/storage/${justCreatedQr}`}
                                            download
                                            className="text-xs text-[#7B1113] hover:underline"
                                        >
                                            Download QR code ↓
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── RECENT LINKS SIDEBAR ── */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-xs font-semibold tracking-widest uppercase text-stone-400 mb-1">
                                    Your Workspace
                                </p>
                                <h2 className="text-lg font-bold text-stone-800">Recent links</h2>
                            </div>
                            <button className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition">
                                <MagnifyingGlassIcon className="w-4 h-4" />
                            </button>
                        </div>

                        {links.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <LinkIcon className="w-8 h-8 text-stone-300 mb-2" />
                                <p className="text-sm text-stone-400">No links yet. Shorten your first URL.</p>
                            </div>
                        ) : (
                            <div>
                                {links.map(link => (
                                    <RecentLinkRow key={link.id} link={link} />
                                ))}
                            </div>
                        )}

                        <Link
                            href={route('home')}
                            className="mt-4 w-full flex items-center justify-center gap-1.5 text-sm font-medium text-stone-600 border border-stone-200 rounded-lg py-2 hover:bg-stone-50 transition"
                        >
                            View all links
                            <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                {/* ── FOOTER ── */}
                {/* <footer className="border-t border-stone-200 py-5 text-center">
                    <p className="text-xs text-stone-400">
                        LIT — Link Integration &amp; Information Tool · University of the Philippines Manila
                    </p>
                </footer> */}
            </div>
        </AuthenticatedLayout>
    );
}