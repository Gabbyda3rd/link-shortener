import AdminLayout from '@/Layouts/AdminLayout';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { MagnifyingGlassIcon, ShieldCheckIcon, PlusIcon } from '@heroicons/react/24/outline';
import UserFormModal from './UserFormModal';

function RoleBadge({ isAdmin }) {
    return isAdmin ? (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#7B1113] bg-[#7B1113]/8 px-2 py-0.5 rounded-full">
            <ShieldCheckIcon className="w-3 h-3" /> Admin
        </span>
    ) : (
        <span className="text-xs text-stone-400">User</span>
    );
}

function StatusBadge({ isActive }) {
    return (
        <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
            }`}
        >
            {isActive ? 'Active' : 'Inactive'}
        </span>
    );
}

function UserActions({ user, onToggle, onToggleAdmin, onEdit, onDelete }) {
    const base = 'text-xs px-2.5 py-1.5 rounded-lg border transition font-medium';
    return (
        <div className="flex flex-wrap items-center gap-2">
            <button
                onClick={() => onToggle(user.id)}
                className={`${base} ${
                    user.is_active
                        ? 'border-red-200 text-red-600 hover:bg-red-50'
                        : 'border-green-200 text-green-600 hover:bg-green-50'
                }`}
            >
                {user.is_active ? 'Deactivate' : 'Activate'}
            </button>
            <button
                onClick={() => onToggleAdmin(user.id)}
                className={`${base} border-stone-200 text-stone-600 hover:bg-stone-50`}
            >
                {user.is_admin ? 'Remove Admin' : 'Make Admin'}
            </button>
            <button
                onClick={() => onEdit(user)}
                className={`${base} border-stone-200 text-stone-600 hover:bg-stone-50`}
            >
                Edit
            </button>
            <button
                onClick={() => onDelete(user)}
                className={`${base} border-red-200 text-red-600 hover:bg-red-50`}
            >
                Delete
            </button>
        </div>
    );
}

export default function Users({ users, filters }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [modal, setModal] = useState({ open: false, user: null });

    const doSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.users'), { search }, { preserveState: true });
    };

    const toggle = (id) =>
        router.patch(route('admin.users.toggle', id), {}, { preserveScroll: true });

    const toggleAdmin = (id) => {
        if (!confirm('Change admin status for this user?')) return;
        router.patch(route('admin.users.admin', id), {}, { preserveScroll: true });
    };

    const destroy = (user) => {
        if (!confirm(`Delete ${user.name}? This action cannot be undone`)) return;
        router.delete(route('admin.users.destroy', user.id), { preserveScroll: true });
    };

    const edit = (user) => setModal({ open: true, user });

    const actionProps = { onToggle: toggle, onToggleAdmin: toggleAdmin, onEdit: edit, onDelete: destroy };

    return (
        <AdminLayout title="User Management">
            {/* Header: stacks on mobile, side by side from sm up */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
                <div>
                    <h1 className="text-xl font-bold text-stone-800">User Management</h1>
                    <p className="text-sm text-stone-400">{users.total} users total</p>
                </div>
                <form onSubmit={doSearch} className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name or email…"
                        className="text-sm border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7B1113]/30 flex-1 min-w-0 sm:flex-none sm:w-64"
                    />
                    <button
                        type="submit"
                        aria-label="Search"
                        className="p-2 rounded-lg bg-[#7B1113] text-white hover:bg-[#9B1517] shrink-0"
                    >
                        <MagnifyingGlassIcon className="w-4 h-4" />
                    </button>
                </form>
            </div>

            <button
                onClick={() => setModal({ open: true, user: null })}
                className="flex items-center justify-center gap-1.5 text-sm font-semibold text-white px-3.5 py-2 rounded-lg mb-3 w-full sm:w-auto"
                style={{ background: 'linear-gradient(90deg, #7B1113, #9B1517)' }}
            >
                <PlusIcon className="w-4 h-4" /> Add user
            </button>

            {/* Mobile: card list */}
            <div className="md:hidden space-y-3">
                {users.data.map((user) => (
                    <div key={user.id} className="bg-white rounded-xl border border-stone-200 p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="font-medium text-stone-800 truncate">{user.name}</p>
                                <p className="text-xs text-stone-500 truncate">{user.email}</p>
                            </div>
                            <StatusBadge isActive={user.is_active} />
                        </div>

                        <dl className="grid grid-cols-3 gap-2 mt-3 text-xs">
                            <div>
                                <dt className="text-stone-400">Role</dt>
                                <dd className="mt-0.5"><RoleBadge isAdmin={user.is_admin} /></dd>
                            </div>
                            <div>
                                <dt className="text-stone-400">Links</dt>
                                <dd className="mt-0.5 text-stone-600">{user.short_urls_count}</dd>
                            </div>
                            <div>
                                <dt className="text-stone-400">Joined</dt>
                                <dd className="mt-0.5 text-stone-600">
                                    {new Date(user.created_at).toLocaleDateString('en-PH')}
                                </dd>
                            </div>
                        </dl>

                        <div className="mt-3 pt-3 border-t border-stone-100">
                            <UserActions user={user} {...actionProps} />
                        </div>
                    </div>
                ))}
                {users.data.length === 0 && (
                    <p className="text-center text-sm text-stone-400 py-10 bg-white rounded-xl border border-stone-200">
                        No users found.
                    </p>
                )}
            </div>

            {/* Desktop/tablet: table (scrolls horizontally if it still doesn't fit) */}
            <div className="hidden md:block bg-white rounded-xl border border-stone-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-stone-50 border-b border-stone-200">
                            <tr>
                                {['Name', 'Email', 'Links', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                                    <th
                                        key={h}
                                        className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide whitespace-nowrap"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {users.data.map((user) => (
                                <tr key={user.id} className="hover:bg-stone-50 transition">
                                    <td className="px-4 py-3 font-medium text-stone-800">{user.name}</td>
                                    <td className="px-4 py-3 text-xs text-stone-500">{user.email}</td>
                                    <td className="px-4 py-3 text-xs text-stone-600">{user.short_urls_count}</td>
                                    <td className="px-4 py-3"><RoleBadge isAdmin={user.is_admin} /></td>
                                    <td className="px-4 py-3"><StatusBadge isActive={user.is_active} /></td>
                                    <td className="px-4 py-3 text-xs text-stone-400 whitespace-nowrap">
                                        {new Date(user.created_at).toLocaleDateString('en-PH')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <UserActions user={user} {...actionProps} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {users.data.length === 0 && (
                    <p className="text-center text-sm text-stone-400 py-10">No users found.</p>
                )}
            </div>

            {users.links && (
                <div className="flex gap-1 mt-4 flex-wrap">
                    {users.links.map((l, i) => (
                        <button
                            key={i}
                            disabled={!l.url}
                            onClick={() => l.url && router.get(l.url)}
                            className={`px-3 py-2 sm:py-1.5 text-xs rounded-lg border transition ${
                                l.active
                                    ? 'bg-[#7B1113] text-white border-[#7B1113]'
                                    : 'border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-40'
                            }`}
                            dangerouslySetInnerHTML={{ __html: l.label }}
                        />
                    ))}
                </div>
            )}

            {modal.open && (
                <UserFormModal
                    key={modal.user?.id ?? 'new'}
                    user={modal.user}
                    onClose={() => setModal({ open: false, user: null })}
                />
            )}
        </AdminLayout>
    );
}