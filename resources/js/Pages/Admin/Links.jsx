import AdminLayout from '@/Layouts/AdminLayout';
import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { MagnifyingGlassIcon, TrashIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

function ExpiryEditor({ link }) {
    const [editing, setEditing] = useState(false);
    const { data, setData, patch, processing } = useForm({
        expires_at: link.expires_at ? link.expires_at.slice(0, 16) : '',
    });

    const save = () => {
        patch(route('admin.links.expiry', link.id), {
            preserveScroll: true,
            onSuccess: () => setEditing(false),
        });
    };

    if (!editing) {
        return (
            <div className="flex items-center gap-1.5">
                <span className="text-xs text-stone-500">
                    {link.expires_at ? new Date(link.expires_at).toLocaleDateString('en-PH') : '—'}
                </span>
                <button onClick={() => setEditing(true)} className="text-stone-400 hover:text-[#7B1113]">
                    <PencilIcon className="w-3.5 h-3.5" />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1">
            <input
                type="datetime-local"
                value={data.expires_at}
                onChange={e => setData('expires_at', e.target.value)}
                className="text-xs border border-stone-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#7B1113]"
            />
            <button onClick={save} disabled={processing} className="text-green-600 hover:text-green-700">
                <CheckIcon className="w-4 h-4" />
            </button>
            <button onClick={() => setEditing(false)} className="text-stone-400 hover:text-stone-600">
                <XMarkIcon className="w-4 h-4" />
            </button>
        </div>
    );
}

export default function Links({ links = { data: [], links: [], total: 0 }, filters = {} }) {
    const [search, setSearch] = useState(filters.search ?? '');

    const doSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.links'), { search }, { preserveState: true });
    };

    const destroy = (id) => {
        if (!confirm('Delete this link? This cannot be undone.')) return;
        router.delete(route('admin.links.destroy', id), { preserveScroll: true });
    };

    return (
        <AdminLayout title="Link Management">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-stone-800">Link Management</h1>
                    <p className="text-sm text-stone-400">{links.total} links total</p>
                </div>
                <form onSubmit={doSearch} className="flex items-center gap-2">
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search short code or URL…"
                        className="text-sm border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7B1113]/30 w-64"
                    />
                    <button type="submit" className="p-2 rounded-lg bg-[#7B1113] text-white hover:bg-[#9B1517]">
                        <MagnifyingGlassIcon className="w-4 h-4" />
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-stone-50 border-b border-stone-200">
                        <tr>
                            {['Short code', 'Original URL', 'Owner', 'Clicks', 'Expires', 'Created', ''].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {links.data.map(link => (
                            <tr key={link.id} className="hover:bg-stone-50 transition">
                                <td className="px-4 py-3 font-mono text-[#7B1113] text-xs font-semibold">{link.short_code}</td>
                                <td className="px-4 py-3 max-w-xs">
                                    <a href={link.original_url} target="_blank" rel="noopener noreferrer"
                                        className="text-xs text-stone-600 hover:text-stone-900 truncate block max-w-[200px]">
                                        {link.original_url}
                                    </a>
                                </td>
                                <td className="px-4 py-3 text-xs text-stone-500">{link.user?.email ?? '—'}</td>
                                <td className="px-4 py-3 text-xs font-semibold text-stone-700">{link.visit_count.toLocaleString()}</td>
                                <td className="px-4 py-3"><ExpiryEditor link={link} /></td>
                                <td className="px-4 py-3 text-xs text-stone-400">
                                    {new Date(link.created_at).toLocaleDateString('en-PH')}
                                </td>
                                <td className="px-4 py-3">
                                    <button onClick={() => destroy(link.id)}
                                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {links.data.length === 0 && (
                    <p className="text-center text-sm text-stone-400 py-10">No links found.</p>
                )}
            </div>

            {/* Pagination */}
            {links.links && (
                <div className="flex gap-1 mt-4 flex-wrap">
                    {links.links.map((l, i) => (
                        <button key={i} disabled={!l.url}
                            onClick={() => l.url && router.get(l.url)}
                            className={`px-3 py-1.5 text-xs rounded-lg border transition ${
                                l.active
                                    ? 'bg-[#7B1113] text-white border-[#7B1113]'
                                    : 'border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-40'
                            }`}
                            dangerouslySetInnerHTML={{ __html: l.label }}
                        />
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}