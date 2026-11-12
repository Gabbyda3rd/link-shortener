import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    Bars3Icon,
    XMarkIcon,
    LinkIcon,
    QueueListIcon,
    ShieldCheckIcon,
    LinkSlashIcon,
    UsersIcon,
    ChartBarIcon,
    ClipboardDocumentListIcon,
    ChevronDownIcon,
} from '@heroicons/react/24/outline';

const focusRing = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD100]';

// `match` can be one pattern or several. Used to highlight the active item.
const MAIN_NAV = [
    { label: 'Shorten a link', icon: LinkIcon, route: 'shorten.index', match: ['shorten.*', 'home', 'dashboard'] },
    { label: 'My links', icon: QueueListIcon, route: 'links.index', match: ['links.*'] },
];

const ADMIN_NAV = [
    { label: 'Admin dashboard', icon: ShieldCheckIcon, route: 'admin.dashboard', match: ['admin.dashboard'] },
    { label: 'All links', icon: LinkSlashIcon, route: 'admin.links', match: ['admin.links*'] },
    { label: 'Users', icon: UsersIcon, route: 'admin.users', match: ['admin.users*'] },
    { label: 'Analytics', icon: ChartBarIcon, route: 'admin.analytics', match: ['admin.analytics'] },
    { label: 'Audit log', icon: ClipboardDocumentListIcon, route: 'admin.audit-log', match: ['admin.audit-log'] },
];

function NavItem({ item, expanded, onNavigate }) {
    const active = item.match.some((m) => route().current(m));
    return (
        <Link
            href={route(item.route)}
            onClick={onNavigate}
            title={!expanded ? item.label : undefined}
            aria-current={active ? 'page' : undefined}
            className={`mx-2 flex items-center gap-3 rounded-lg px-3 min-h-[44px] text-base font-medium transition
                ${active ? 'bg-[#7B1113] text-white' : 'text-stone-700 hover:bg-stone-200'}
                ${focusRing}`}
        >
            <item.icon className="w-6 h-6 shrink-0" />
            {expanded && <span className="truncate">{item.label}</span>}
        </Link>
    );
}

function SidebarNav({ expanded, isAdmin, onNavigate }) {
    return (
        <nav className="py-3 space-y-1">
            {MAIN_NAV.map((item) => (
                <NavItem key={item.route} item={item} expanded={expanded} onNavigate={onNavigate} />
            ))}

            {isAdmin && (
                <>
                    <div className="mx-4 mt-4 mb-1 border-t border-stone-300 pt-3">
                        {expanded ? (
                            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Admin</p>
                        ) : (
                            <span className="sr-only">Admin</span>
                        )}
                    </div>
                    {ADMIN_NAV.map((item) => (
                        <NavItem key={item.route} item={item} expanded={expanded} onNavigate={onNavigate} />
                    ))}
                </>
            )}
        </nav>
    );
}

export default function AuthenticatedLayout({ children }) {
    const user = usePage().props.auth.user;

    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    // Desktop: expanded vs icon-only (remembered). Mobile: drawer open/closed.
    const [expanded, setExpanded] = useState(() => {
        try { return localStorage.getItem('ikli-sidebar') !== 'collapsed'; } catch { return true; }
    });
    const [drawer, setDrawer] = useState(false);

    useEffect(() => {
        try { localStorage.setItem('ikli-sidebar', expanded ? 'expanded' : 'collapsed'); } catch {}
    }, [expanded]);

    const toggle = () => {
        if (window.matchMedia('(min-width: 1024px)').matches) setExpanded((e) => !e);
        else setDrawer((d) => !d);
    };

    return (
        <div className="min-h-screen bg-stone-50">
            {/* ── TOP BAR ── */}
            <header
                className="fixed top-0 inset-x-0 z-40 h-14 flex items-center justify-between px-3 text-white"
                style={{ background: 'linear-gradient(90deg, #7B1113 0%, #5a0a0c 100%)' }}
            >
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={toggle}
                        aria-label="Toggle menu"
                        className={`grid place-items-center w-11 h-11 rounded-lg hover:bg-white/10 ${focusRing}`}
                    >
                        <Bars3Icon className="w-6 h-6" />
                    </button>

                    <Link href={route('shorten.index')} className={`flex items-center gap-2.5 rounded ${focusRing}`}>
                        <span className="grid place-items-center w-9 h-9 rounded-full bg-white text-[#7B1113] text-xs font-extrabold">
                            UP
                        </span>
                        <span className="leading-tight">
                            <span className="block text-lg font-bold tracking-tight">IKLI</span>
                            <span className="block text-xs text-white/80">UP Manila link tools</span>
                        </span>
                    </Link>
                </div>

                {/* User dropdown */}
                <Dropdown>
                    <Dropdown.Trigger>
                        <button
                            type="button"
                            className={`flex items-center gap-2 rounded-lg px-2 min-h-[44px] text-white hover:bg-white/10 ${focusRing}`}
                        >
                            <span
                                className="grid place-items-center w-8 h-8 rounded-full text-sm font-bold"
                                style={{ background: '#FFD100', color: '#7B1113' }}
                            >
                                {initials}
                            </span>
                            <span className="hidden sm:inline text-base">{user.name}</span>
                            <ChevronDownIcon className="w-4 h-4" />
                        </button>
                    </Dropdown.Trigger>

                    <Dropdown.Content>
                        <div className="px-4 py-2 border-b border-stone-100">
                            <p className="text-sm font-semibold text-stone-800">{user.name}</p>
                            <p className="text-xs text-stone-500">{user.email}</p>
                            {user.is_admin && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7B1113] bg-[#7B1113]/10 px-1.5 py-0.5 rounded-full mt-1">
                                    <ShieldCheckIcon className="w-3 h-3" /> Admin
                                </span>
                            )}
                        </div>
                        <Dropdown.Link href={route('logout')} method="post" as="button">
                            Log Out
                        </Dropdown.Link>
                    </Dropdown.Content>
                </Dropdown>
            </header>

            {/* ── DESKTOP SIDEBAR ── */}
            <aside
                className={`hidden lg:block fixed top-14 bottom-0 left-0 z-30 bg-stone-100 border-r border-stone-200 overflow-y-auto transition-[width] duration-200
                    ${expanded ? 'w-60' : 'w-16'}`}
            >
                <SidebarNav expanded={expanded} isAdmin={user.is_admin} />
            </aside>

            {/* ── MOBILE DRAWER ── */}
            {drawer && (
                <div className="lg:hidden fixed inset-0 top-14 z-30">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setDrawer(false)} />
                    <aside className="relative w-64 h-full bg-stone-100 shadow-xl overflow-y-auto">
                        <button
                            type="button"
                            onClick={() => setDrawer(false)}
                            aria-label="Close menu"
                            className="absolute right-2 top-2 p-2 text-stone-600"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                        <div className="pt-8">
                            <SidebarNav expanded isAdmin={user.is_admin} onNavigate={() => setDrawer(false)} />
                        </div>
                    </aside>
                </div>
            )}

            {/* ── CONTENT ── */}
            <main className={`pt-14 transition-[padding] duration-200 ${expanded ? 'lg:pl-60' : 'lg:pl-16'}`}>
                {children}
            </main>
        </div>
    );
}