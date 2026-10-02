import AdminLayout from '@/Layouts/AdminLayout';
import { Link } from '@inertiajs/react';
import {
    LinkIcon, UsersIcon, CursorArrowRaysIcon,
    ExclamationTriangleIcon, PlusCircleIcon, ClockIcon,
} from '@heroicons/react/24/outline';

const statCards = (stats) => [
    { label: 'Total Links',    value: stats.total_links,   icon: LinkIcon,                  color: 'text-[#7B1113]', bg: 'bg-[#7B1113]/8' },
    { label: 'Total Clicks',   value: stats.total_clicks,  icon: CursorArrowRaysIcon,        color: 'text-blue-600',  bg: 'bg-blue-50' },
    { label: 'Total Users',    value: stats.total_users,   icon: UsersIcon,                  color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Links Today',    value: stats.links_today,   icon: PlusCircleIcon,             color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Expired Links',  value: stats.expired_links, icon: ExclamationTriangleIcon,    color: 'text-red-500',   bg: 'bg-red-50' },
    { label: 'Active Users',   value: stats.active_users,  icon: ClockIcon,                  color: 'text-purple-600',bg: 'bg-purple-50' },
];

const navItems = [
    { href: 'admin.links',     label: 'Link Management',  desc: 'View, delete, and manage expiry of all links' },
    { href: 'admin.users',     label: 'User Management',  desc: 'Activate, deactivate, and promote users' },
    { href: 'admin.analytics', label: 'Analytics',        desc: 'Click trends, top links, new link activity' },
    { href: 'admin.audit-log', label: 'Audit Log',        desc: 'Full history of all system actions' },
];

export default function Dashboard({ stats }) {
    return (
        <AdminLayout title="Admin Dashboard">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-stone-800">Admin Dashboard</h1>
                <p className="text-sm text-stone-500 mt-1">Overview of IKLI — Instant Key Link Integration</p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {statCards(stats).map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="bg-white rounded-xl border border-stone-200 p-5 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-stone-800">{value.toLocaleString()}</p>
                            <p className="text-xs text-stone-400">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick nav */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {navItems.map(({ href, label, desc }) => (
                    <Link
                        key={href}
                        href={route(href)}
                        className="bg-white rounded-xl border border-stone-200 p-5 hover:border-[#7B1113]/30 hover:shadow-sm transition group"
                    >
                        <p className="text-sm font-semibold text-stone-800 group-hover:text-[#7B1113] transition">{label} →</p>
                        <p className="text-xs text-stone-400 mt-1">{desc}</p>
                    </Link>
                ))}
            </div>
        </AdminLayout>
    );
}