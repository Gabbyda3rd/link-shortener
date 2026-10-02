import AdminLayout from '@/Layouts/AdminLayout';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const actionColors = {
    link_created:        'bg-green-50 text-green-700',
    link_deleted:        'bg-red-50 text-red-600',
    link_visited:        'bg-blue-50 text-blue-600',
    link_expiry_updated: 'bg-amber-50 text-amber-700',
    user_deactivated:    'bg-red-50 text-red-600',
    user_activated:      'bg-green-50 text-green-700',
    user_promoted_admin: 'bg-purple-50 text-purple-700',
    user_demoted_admin:  'bg-stone-100 text-stone-600',
};

export default function AuditLog({
    logs = { data: [], links: [], total: 0 },
    actions = [],
    filters = {},
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [action, setAction] = useState(filters.action ?? '');

    const apply = (e) => {
        e.preventDefault();
        router.get(route('admin.audit-log'), { search, action }, { preserveState: true });
    };

    return (
        <AdminLayout title="Audit Log">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-stone-800">Audit Log</h1>
                    <p className="text-sm text-stone-400">{logs.total} events recorded</p>
                </div>
            </div>

            {/* Filters */}
            <form onSubmit={apply} className="flex items-center gap-3 mb-5 flex-wrap">
                <select
                    value={action}
                    onChange={e => setAction(e.target.value)}
                    className="text-sm border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7B1113]/30"
                >
                    <option value="">All actions</option>
                    {actions.map(a => (
                        <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
                    ))}
                </select>

                <div className="flex items-center gap-2">
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search user…"
                        className="text-sm border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7B1113]/30 w-52"
                    />
                    <button type="submit" className="p-2 rounded-lg bg-[#7B1113] text-white hover:bg-[#9B1517]">
                        <MagnifyingGlassIcon className="w-4 h-4" />
                    </button>
                </div>
            </form>

            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-stone-50 border-b border-stone-200">
                        <tr>
                            {['When', 'User', 'Action', 'Target', 'Details', 'IP'].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {logs.data.map(log => (
                            <tr key={log.id} className="hover:bg-stone-50 transition">
                                <td className="px-4 py-3 text-xs text-stone-400 whitespace-nowrap">
                                    {new Date(log.created_at).toLocaleString('en-PH')}
                                </td>
                                <td className="px-4 py-3 text-xs text-stone-600">
                                    {log.user?.name ?? <span className="text-stone-300">—</span>}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${actionColors[log.action] ?? 'bg-stone-100 text-stone-600'}`}>
                                        {log.action.replace(/_/g, ' ')}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-xs text-stone-500">
                                    {log.target_type ? `${log.target_type} #${log.target_id}` : '—'}
                                </td>
                                <td className="px-4 py-3 text-xs text-stone-400 max-w-xs truncate">
                                    {log.metadata
                                        ? Object.entries(log.metadata).map(([k, v]) => `${k}: ${v}`).join(' · ')
                                        : '—'}
                                </td>
                                <td className="px-4 py-3 text-xs font-mono text-stone-400">
                                    {log.ip_address ?? '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {logs.data.length === 0 && (
                    <p className="text-center text-sm text-stone-400 py-10">No audit logs yet.</p>
                )}
            </div>

            {/* Pagination */}
            {logs.links && logs.links.length > 0 && (
                <div className="flex gap-1 mt-4 flex-wrap">
                    {logs.links.map((l, i) => (
                        <button
                            key={i}
                            disabled={!l.url}
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