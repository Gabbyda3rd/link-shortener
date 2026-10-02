import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    LinkIcon, UsersIcon, ChartBarIcon,
    ClipboardDocumentListIcon, Squares2X2Icon,
    ChevronLeftIcon, Bars3Icon,
} from '@heroicons/react/24/outline';

const nav = [
    { href: 'admin.dashboard', label: 'Dashboard',        icon: Squares2X2Icon },
    { href: 'admin.links',     label: 'Links',             icon: LinkIcon },
    { href: 'admin.users',     label: 'Users',             icon: UsersIcon },
    { href: 'admin.analytics', label: 'Analytics',         icon: ChartBarIcon },
    { href: 'admin.audit-log', label: 'Audit Log',         icon: ClipboardDocumentListIcon },
];

export default function AdminLayout({ children, title }) {
    const { auth } = usePage().props;
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="min-h-screen flex bg-stone-50">
            {/* Sidebar */}
            <aside className={`${collapsed ? 'w-16' : 'w-56'} shrink-0 bg-[#7B1113] flex flex-col transition-all duration-200`}>
                {/* Logo */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
                    {!collapsed && (
                        <div>
                            <p className="text-white font-bold text-sm tracking-tight">IKLI Admin</p>
                            <p className="text-white/50 text-[10px]">UP Manila</p>
                        </div>
                    )}
                    <button onClick={() => setCollapsed(!collapsed)}
                        className="text-white/70 hover:text-white transition p-1 rounded">
                        {collapsed ? <Bars3Icon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
                    </button>
                </div>

                {/* Nav items */}
                <nav className="flex-1 py-4 space-y-0.5 px-2">
                    {nav.map(({ href, label, icon: Icon }) => {
                        const active = route().current(href);
                        return (
                            <Link key={href} href={route(href)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                                    active
                                        ? 'bg-white/15 text-white'
                                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                                }`}>
                                <Icon className="w-4 h-4 shrink-0" />
                                {!collapsed && label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User + back link */}
                <div className="border-t border-white/10 px-3 py-3 space-y-1">
                    {!collapsed && (
                        <p className="text-white/50 text-xs truncate px-1">{auth.user.email}</p>
                    )}
                    <Link href={route('home')}
                        className="flex items-center gap-2 text-white/60 hover:text-white text-xs px-1 py-1 transition">
                        ← {!collapsed && 'Back to app'}
                    </Link>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="bg-white border-b border-stone-200 px-6 py-3.5 flex items-center justify-between">
                    <h1 className="text-sm font-semibold text-stone-700">{title}</h1>
                    <span className="text-xs text-stone-400">{auth.user.name}</span>
                </header>

                <main className="flex-1 p-6 max-w-6xl w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}