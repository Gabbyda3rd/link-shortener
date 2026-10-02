import AdminLayout from '@/Layouts/AdminLayout';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { MagnifyingGlassIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function Users({ users, filters }) {
    const [search, setSearch] = useState(filters.search ?? '');

    const doSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.users'), { search }, { preserveState: true });
    };

    const toggle = (id) => router.patch(route('admin.users.toggle', id), {}, { preserveScroll: true });
    const toggleAdmin = (id) => {
        if (!confirm('Change admin status for this user?')) return;
        router.patch(route('admin.users.admin', id), {}, { preserveScroll: true });
    };

    return (
        <AdminLayout title="User Management">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-stone-800">User Management</h1>
                    <p className="text-sm text-stone-400">{users.total} users total</p>
                </div>
                <form onSubmit={doSearch} className="flex items-center gap-2">
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search name or email…"
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
                            {['Name', 'Email', 'Links', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {users.data.map(user => (
                            <tr key={user.id} className="hover:bg-stone-50 transition">
                                <td className="px-4 py-3 font-medium text-stone-800">{user.name}</td>
                                <td className="px-4 py-3 text-xs text-stone-500">{user.email}</td>
                                <td className="px-4 py-3 text-xs text-stone-600">{user.short_urls_count}</td>
                                <td className="px-4 py-3">
                                    {user.is_admin
                                        ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#7B1113] bg-[#7B1113]/8 px-2 py-0.5 rounded-full">
                                            <ShieldCheckIcon className="w-3 h-3" /> Admin
                                          </span>
                                        : <span className="text-xs text-stone-400">User</span>
                                    }
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                        user.is_active
                                            ? 'bg-green-50 text-green-700'
                                            : 'bg-red-50 text-red-600'
                                    }`}>
                                        {user.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-xs text-stone-400">
                                    {new Date(user.created_at).toLocaleDateString('en-PH')}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => toggle(user.id)}
                                            className={`text-xs px-2.5 py-1 rounded-lg border transition font-medium ${
                                                user.is_active
                                                    ? 'border-red-200 text-red-600 hover:bg-red-50'
                                                    : 'border-green-200 text-green-600 hover:bg-green-50'
                                            }`}>
                                            {user.is_active ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button onClick={() => toggleAdmin(user.id)}
                                            className="text-xs px-2.5 py-1 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition font-medium">
                                            {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.data.length === 0 && (
                    <p className="text-center text-sm text-stone-400 py-10">No users found.</p>
                )}
            </div>

            {users.links && (
                <div className="flex gap-1 mt-4 flex-wrap">
                    {users.links.map((l, i) => (
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