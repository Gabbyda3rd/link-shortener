import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function AuthenticatedLayout({ children }) {
    const user = usePage().props.auth.user;
    const [mobileOpen, setMobileOpen] = useState(false);

    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <div className="min-h-screen bg-stone-50">
            <nav className="bg-white border-b border-stone-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <div className="flex h-14 items-center justify-between">

                        {/* Logo */}
                        <Link href={route('shorten.index')} className="flex items-center gap-2.5">
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-extrabold"
                                style={{ background: '#7B1113' }}
                            >
                                UP
                            </div>
                            <div className="leading-none">
                                <p className="text-sm font-bold text-stone-900 tracking-tight">IKLI</p>
                                <p className="text-[10px] text-stone-400">UP Manila link tools</p>
                            </div>
                        </Link>

                        {/* Desktop nav */}
                        <div className="hidden sm:flex items-center gap-6">
                            <Link href={route('shorten.index')} className="text-sm text-stone-600 hover:text-stone-900 transition">
                                Shorten a link
                            </Link>
                            <Link href={route('links.index')} className="text-sm text-stone-600 hover:text-stone-900 transition">
                                My links
                            </Link>

                            {user.is_admin && (
                                <Link
                                    href={route('admin.dashboard')}
                                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#7B1113] hover:text-[#9B1517] transition"
                                >
                                    <ShieldCheckIcon className="w-4 h-4" />
                                    Admin
                                </Link>
                            )}
                        </div>

                        {/* User dropdown */}
                        <div className="hidden sm:flex items-center">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        type="button"
                                        className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 border border-stone-200 hover:bg-stone-50 transition text-sm font-medium text-stone-700"
                                    >
                                        <div
                                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                                            style={{ background: '#FFD100', color: '#7B1113' }}
                                        >
                                            {initials}
                                        </div>
                                        {user.name.split(' ')[0]}
                                        <svg className="w-3.5 h-3.5 text-stone-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <div className="px-4 py-2 border-b border-stone-100">
                                        <p className="text-xs font-semibold text-stone-800">{user.name}</p>
                                        <p className="text-xs text-stone-400">{user.email}</p>
                                        {user.is_admin && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#7B1113] bg-[#7B1113]/10 px-1.5 py-0.5 rounded-full mt-1">
                                                <ShieldCheckIcon className="w-2.5 h-2.5" /> Admin
                                            </span>
                                        )}
                                    </div>
                                    {user.is_admin && (
                                        <Dropdown.Link href={route('admin.dashboard')}>
                                            Admin Dashboard
                                        </Dropdown.Link>
                                    )}
                                    <Dropdown.Link href={route('logout')} method="post" as="button">
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            className="sm:hidden p-2 rounded-md text-stone-500 hover:bg-stone-100"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Toggle menu"
                        >
                            <svg className="w-5 h-5" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                {mobileOpen
                                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                }
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div className="sm:hidden border-t border-stone-100 px-4 py-3 space-y-2">
                        <Link href={route('shorten.index')} className="block text-sm text-stone-700 py-1.5">Shorten a link</Link>
                        <Link href={route('links.index')} className="block text-sm text-stone-700 py-1.5">My links</Link>

                        {user.is_admin && (
                            <Link
                                href={route('admin.dashboard')}
                                className="flex items-center gap-1.5 text-sm font-semibold text-[#7B1113] py-1.5"
                            >
                                <ShieldCheckIcon className="w-4 h-4" />
                                Admin Dashboard
                            </Link>
                        )}
                        <div className="border-t border-stone-100 pt-3 mt-2">
                            <p className="text-xs font-semibold text-stone-800">{user.name}</p>
                            <p className="text-xs text-stone-400 mb-2">{user.email}</p>
                            <Link href={route('logout')} method="post" as="button" className="text-sm text-red-600">
                                Log Out
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            <main>{children}</main>
        </div>
    );
}