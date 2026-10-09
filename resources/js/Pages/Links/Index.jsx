import { useState, useEffect, useRef } from 'react';
import { router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    MagnifyingGlassIcon, LockClosedIcon, QrCodeIcon, TrashIcon,
    ChartBarIcon, ClipboardIcon, CheckIcon, LinkIcon,
} from '@heroicons/react/24/outline';

const STATUS = [
    { value: '', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'expired', label: 'Expired' },
    { value: 'locked', label: 'Password' },
    { value: 'qr', label: 'Has QR' },
];

function isExpired(link) {
    return link.expires_at && new Date(link.expires_at) <= new Date();
}

function fmt(d) {
    return new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

function CopyButton({ text }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            title="Copy link"
            onClick={() => {
                navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
            }}
            className="p-1.5 rounded text-stone-400 hover:text-[#7B1113] hover:bg-[#7B1113]/10 transition"
        >
            {copied ? <CheckIcon className="w-4 h-4 text-green-600" /> : <ClipboardIcon className="w-4 h-4" />}
        </button>
    );
}

export function Pagination({ links }) {
    if (!links || links.length <= 3) return null;
    return (
        <div className="flex flex-wrap gap-1 justify-center mt-5">
            {links.map((l, i) => {
                const label = l.label.replace('&laquo;', '«').replace('&raquo;', '»')
                    .replace('Previous', '').replace('Next', '').trim() || (i === 0 ? '«' : '»');
                return l.url ? (
                    <Link
                        key={i}
                        href={l.url}
                        preserveScroll
                        className={`px-3 py-1.5 text-sm rounded-lg border transition ${
                            l.active
                                ? 'bg-[#7B1113] text-white border-[#7B1113]'
                                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                        }`}
                    >
                        {label}
                    </Link>
                ) : (
                    <span key={i} className="px-3 py-1.5 text-sm rounded-lg border border-stone-100 text-stone-300">
                        {label}
                    </span>
                );
            })}
        </div>
    );
}

export default function Index({ auth, links, filters }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const first = useRef(true);

    const visit = (params) =>
        router.get(route('links.index'), params, { preserveState: true, replace: true });

    // Debounced search
    useEffect(() => {
        if (first.current) { first.current = false; return; }
        const t = setTimeout(() => visit({ ...filters, search: search || undefined }), 350);
        return () => clearTimeout(t);
    }, [search]);

    const setFilter = (key, value) => visit({ ...filters, search: search || undefined, [key]: value || undefined });

    const remove = (link) => {
        if (!confirm(`Delete ${link.short_code}? Its QR code will stop working.`)) return;
        router.delete(route('links.destroy', link.id), { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <div className="bg-stone-50 min-h-screen">
                <div className="max-w-5xl mx-auto px-4 py-10">
                    <div className="flex items-end justify-between mb-6 gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-stone-800">My links</h1>
                            <p className="text-sm text-stone-500 mt-0.5">
                                {links.total} {links.total === 1 ? 'link' : 'links'} you've created
                            </p>
                        </div>
                        <Link
                            href={route('shorten.index')}
                            className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
                            style={{ background: 'linear-gradient(90deg, #7B1113, #9B1517)' }}
                        >
                            New link
                        </Link>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 mb-4 space-y-3">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <MagnifyingGlassIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search by short code or destination"
                                    className="w-full rounded-lg border border-stone-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1113]/30 focus:border-[#7B1113]"
                                />
                            </div>
                            <select
                                value={filters.sort ?? 'newest'}
                                onChange={e => setFilter('sort', e.target.value)}
                                className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1113]/30 focus:border-[#7B1113]"
                            >
                                <option value="newest">Newest first</option>
                                <option value="clicks">Most clicks</option>
                            </select>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {STATUS.map(s => {
                                const active = (filters.status ?? '') === s.value;
                                return (
                                    <button
                                        key={s.value}
                                        onClick={() => setFilter('status', s.value)}
                                        className={`px-3 py-1 text-xs font-medium rounded-full border transition ${
                                            active
                                                ? 'bg-[#7B1113] text-white border-[#7B1113]'
                                                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                                        }`}
                                    >
                                        {s.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* List */}
                    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                        {links.data.length === 0 ? (
                            <div className="flex flex-col items-center py-14 text-center">
                                <LinkIcon className="w-8 h-8 text-stone-300 mb-2" />
                                <p className="text-sm text-stone-500">
                                    {filters.search || filters.status
                                        ? 'No links match these filters. Clear them to see all your links.'
                                        : 'No links yet. Shorten your first URL to see it here.'}
                                </p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-stone-100">
                                {links.data.map(link => {
                                    const shortUrl = `${window.location.origin}/${link.short_code}`;
                                    const expired = isExpired(link);
                                    return (
                                        <li key={link.id} className="flex items-center gap-4 px-5 py-4">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Link
                                                        href={route('links.show', link.id)}
                                                        className="text-sm font-semibold text-stone-800 hover:text-[#7B1113] truncate"
                                                    >
                                                        {link.title || link.short_code}
                                                    </Link>
                                                    {link.has_password && (
                                                        <span title="Password protected"><LockClosedIcon className="w-3.5 h-3.5 text-[#7B1113]" /></span>
                                                    )}
                                                    {link.qr_code_path && (
                                                        <span title="Has QR code"><QrCodeIcon className="w-3.5 h-3.5 text-stone-400" /></span>
                                                    )}
                                                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                                                        expired ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
                                                    }`}>
                                                        {expired ? 'Expired' : 'Active'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <a href={shortUrl} target="_blank" rel="noopener noreferrer"
                                                       className="text-xs text-[#7B1113] hover:underline">
                                                        lit.upm.edu.ph/{link.short_code}
                                                    </a>
                                                    <CopyButton text={shortUrl} />
                                                </div>
                                                <p className="text-xs text-stone-400 truncate mt-0.5">{link.original_url}</p>
                                                <p className="text-xs text-stone-400 mt-0.5">
                                                    Created {fmt(link.created_at)}
                                                    {link.expires_at && ` · ${expired ? 'Expired' : 'Expires'} ${fmt(link.expires_at)}`}
                                                </p>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <p className="text-lg font-bold text-stone-800">{link.visit_count.toLocaleString()}</p>
                                                <p className="text-xs text-stone-400">clicks</p>
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0">
                                                <Link
                                                    href={route('links.show', link.id)}
                                                    title="View clicks"
                                                    className="p-2 rounded-lg text-stone-400 hover:text-[#7B1113] hover:bg-[#7B1113]/10 transition"
                                                >
                                                    <ChartBarIcon className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => remove(link)}
                                                    title="Delete link"
                                                    className="p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    <Pagination links={links.links} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}