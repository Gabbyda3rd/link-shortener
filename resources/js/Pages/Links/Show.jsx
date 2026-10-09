import { Link,useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeftIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { Pagination } from './Index';

// Fill missing days so the chart always spans 30 days
function buildSeries(daily) {
    const map = Object.fromEntries(daily.map(d => [String(d.day).slice(0, 10), Number(d.clicks)]));
    const out = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
        out.push({ day: key, clicks: map[key] ?? 0 });
    }
    return out;
}

function ClicksChart({ daily }) {
    const series = buildSeries(daily);
    const max = Math.max(1, ...series.map(s => s.clicks));
    const W = 600, H = 140, pad = 4;
    const bw = (W - pad * 2) / series.length;

    return (
        <div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-36" role="img" aria-label="Clicks per day, last 30 days">
                {series.map((s, i) => {
                    const h = (s.clicks / max) * (H - 20);
                    return (
                        <rect
                            key={s.day}
                            x={pad + i * bw + 1}
                            y={H - h - 2}
                            width={Math.max(bw - 2, 1)}
                            height={Math.max(h, s.clicks ? 2 : 0)}
                            rx="2"
                            fill="#7B1113"
                            opacity={s.clicks ? 1 : 0}
                        >
                            <title>{`${s.day}: ${s.clicks} click${s.clicks === 1 ? '' : 's'}`}</title>
                        </rect>
                    );
                })}
                <line x1="0" x2={W} y1={H - 1} y2={H - 1} stroke="#e7e5e4" />
            </svg>
            <div className="flex justify-between text-xs text-stone-400 mt-1">
                <span>{series[0].day}</span>
                <span>Peak: {max} / day</span>
                <span>{series[series.length - 1].day}</span>
            </div>
        </div>
    );
}

function Stat({ label, value }) {
    return (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm px-5 py-4">
            <p className="text-2xl font-bold text-stone-800">{value}</p>
            <p className="text-xs text-stone-500 mt-0.5">{label}</p>
        </div>
    );
}

// Light parse so the raw UA string isn't shown. Swap for jenssegers/agent later if you want more detail.
function describeAgent(ua) {
    if (!ua) return '—';
    const browser =
        /Edg\//.test(ua) ? 'Edge' :
        /OPR\//.test(ua) ? 'Opera' :
        /Chrome\//.test(ua) ? 'Chrome' :
        /Firefox\//.test(ua) ? 'Firefox' :
        /Safari\//.test(ua) ? 'Safari' : 'Other browser';
    const os =
        /Android/.test(ua) ? 'Android' :
        /iPhone|iPad/.test(ua) ? 'iOS' :
        /Windows/.test(ua) ? 'Windows' :
        /Mac OS X/.test(ua) ? 'macOS' :
        /Linux/.test(ua) ? 'Linux' : 'Unknown OS';
    return `${browser} on ${os}`;
}

function toLocalInput(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
}

function EditPanel({ link }) {
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        title: link.title ?? '',
        expires_at: toLocalInput(link.expires_at),
        password: '',
        remove_password: false,
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('links.update', link.id), {
            preserveScroll: true,
            onSuccess: () => { setData('password', ''); setData('remove_password', false); },
        });
    };

    const input = 'w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1113]/30 focus:border-[#7B1113] transition';

    return (
        <form onSubmit={submit} className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-stone-800">Edit link</h2>

            <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
                <input className={input} value={data.title} onChange={e => setData('title', e.target.value)} />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Expires</label>
                <div className="flex gap-2">
                    <input type="datetime-local" className={input} value={data.expires_at}
                           onChange={e => setData('expires_at', e.target.value)} />
                    {data.expires_at && (
                        <button type="button" onClick={() => setData('expires_at', '')}
                                className="shrink-0 px-3 text-sm text-stone-600 border border-stone-200 rounded-lg hover:bg-stone-50">
                            Never expire
                        </button>
                    )}
                </div>
                {errors.expires_at && <p className="text-xs text-red-500 mt-1">{errors.expires_at}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                    {link.has_password ? 'Change password' : 'Add password'}
                </label>
                <input type="password" autoComplete="new-password" className={input} value={data.password}
                       placeholder={link.has_password ? 'Leave blank to keep the current password' : 'Leave blank for a public link'}
                       onChange={e => setData('password', e.target.value)} />
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                {link.has_password && (
                    <label className="flex items-center gap-2 mt-2 text-sm text-stone-600">
                        <input type="checkbox" className="accent-[#7B1113]" checked={data.remove_password}
                               onChange={e => setData('remove_password', e.target.checked)} />
                        Remove password
                    </label>
                )}
            </div>

            <div className="flex items-center gap-3">
                <button type="submit" disabled={processing}
                        className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                        style={{ background: 'linear-gradient(90deg, #7B1113, #9B1517)' }}>
                    {processing ? 'Saving…' : 'Save changes'}
                </button>
                {recentlySuccessful && <span className="text-sm text-green-600">Saved</span>}
            </div>
        </form>
    );
}

export default function Show({ auth, link, stats, daily, visits, isAdmin }) {
    const expired = link.expires_at && new Date(link.expires_at) <= new Date();
    const backRoute = isAdmin && auth.user.id !== link.user_id ? route('admin.links') : route('links.index');
    const cols = isAdmin ? 5 : 4;

    return (
        <AuthenticatedLayout user={auth.user}>
            <div className="bg-stone-50 min-h-screen">
                <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">

                    <Link href={backRoute} className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-[#7B1113]">
                        <ArrowLeftIcon className="w-4 h-4" /> Back to links
                    </Link>

                    {/* Header */}
                    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-xl font-bold text-stone-800">{link.title || link.short_code}</h1>
                            {link.has_password && <LockClosedIcon className="w-4 h-4 text-[#7B1113]" title="Password protected" />}
                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                                expired ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
                            }`}>
                                {expired ? 'Expired' : 'Active'}
                            </span>
                        </div>
                        <a href={`${window.location.origin}/${link.short_code}`} target="_blank" rel="noopener noreferrer"
                           className="text-sm text-[#7B1113] hover:underline">
                            lit.upm.edu.ph/{link.short_code}
                        </a>
                        <p className="text-xs text-stone-400 break-all mt-1">{link.original_url}</p>
                        {link.qr_code_path && (
                            <a href={`/storage/${link.qr_code_path}`} download className="text-xs text-[#7B1113] hover:underline mt-2 inline-block">
                                Download QR code ↓
                            </a>
                        )}
                    </div>

                     {auth.user.id === link.user_id && <EditPanel link={link} />}

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <Stat label="Total clicks" value={stats.total.toLocaleString()} />
                        <Stat label="Unique visitors" value={stats.unique.toLocaleString()} />
                        <Stat
                            label="Expires"
                            value={link.expires_at
                                ? new Date(link.expires_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
                                : 'Never'}
                        />
                    </div>

                    {/* Chart */}
                    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
                        <h2 className="text-base font-bold text-stone-800 mb-3">Clicks, last 30 days</h2>
                        <ClicksChart daily={daily} />
                    </div>

                    {/* Visits */}
                    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-stone-100">
                            <h2 className="text-base font-bold text-stone-800">Recent clicks</h2>
                            {!isAdmin && (
                                <p className="text-xs text-stone-400 mt-0.5">
                                    Visitors who weren't signed in appear as Anonymous.
                                </p>
                            )}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs text-stone-500 bg-stone-50">
                                        <th className="px-6 py-2.5 font-medium">When</th>
                                        <th className="px-6 py-2.5 font-medium">Visitor</th>
                                        <th className="px-6 py-2.5 font-medium">Device</th>
                                        <th className="px-6 py-2.5 font-medium">Came from</th>
                                        {isAdmin && <th className="px-6 py-2.5 font-medium">IP address</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {visits.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={cols} className="px-6 py-10 text-center text-stone-400">
                                                No clicks yet. They'll appear here once someone opens this link.
                                            </td>
                                        </tr>
                                    ) : visits.data.map(v => (
                                        <tr key={v.id}>
                                            <td className="px-6 py-3 whitespace-nowrap text-stone-700">
                                                {new Date(v.visited_at).toLocaleString('en-PH', {
                                                    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                                                })}
                                            </td>
                                            <td className="px-6 py-3 text-stone-700">
                                                {v.visitor ?? <span className="text-stone-400">Anonymous</span>}
                                            </td>
                                            <td className="px-6 py-3 text-stone-600 whitespace-nowrap">{describeAgent(v.user_agent)}</td>
                                            <td className="px-6 py-3 text-stone-500 max-w-[220px] truncate" title={v.referer ?? ''}>
                                                {v.referer || 'Direct'}
                                            </td>
                                            {isAdmin && <td className="px-6 py-3 font-mono text-xs text-stone-600">{v.ip}</td>}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <Pagination links={visits.links} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}