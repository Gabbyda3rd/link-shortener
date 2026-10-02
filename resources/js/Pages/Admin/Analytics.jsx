import AdminLayout from '@/Layouts/AdminLayout';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

export default function Analytics({ dailyClicks, topLinks, newLinks, stats, filters }) {
    const [range, setRange] = useState(filters.range ?? '7');
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo]     = useState(filters.to ?? '');

    const apply = () => {
        router.get(route('admin.analytics'), { range, from, to }, { preserveState: true });
    };

    return (
        <AdminLayout title="Analytics">
            <div className="mb-6">
                <h1 className="text-xl font-bold text-stone-800">Analytics</h1>
                <p className="text-sm text-stone-400">Click trends and link activity</p>
            </div>

            {/* Range filter */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
                {[{ v: '7', l: 'Last 7 days' }, { v: '30', l: 'Last 30 days' }, { v: 'custom', l: 'Custom range' }].map(opt => (
                    <button key={opt.v} onClick={() => setRange(opt.v)}
                        className={`text-sm px-3 py-1.5 rounded-lg border transition font-medium ${
                            range === opt.v
                                ? 'bg-[#7B1113] text-white border-[#7B1113]'
                                : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}>
                        {opt.l}
                    </button>
                ))}
                {range === 'custom' && (
                    <>
                        <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                            className="text-sm border border-stone-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#7B1113]/30" />
                        <span className="text-stone-400 text-sm">to</span>
                        <input type="date" value={to} onChange={e => setTo(e.target.value)}
                            className="text-sm border border-stone-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#7B1113]/30" />
                    </>
                )}
                <button onClick={apply}
                    className="text-sm px-4 py-1.5 rounded-lg bg-[#7B1113] text-white font-medium hover:bg-[#9B1517] transition">
                    Apply
                </button>
            </div>

            {/* Stat row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Links',  value: stats.total_links },
                    { label: 'Total Clicks', value: stats.total_clicks },
                    { label: 'Links Today',  value: stats.links_today },
                    { label: 'Expired',      value: stats.expired_links },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl border border-stone-200 p-4">
                        <p className="text-2xl font-bold text-stone-800">{s.value.toLocaleString()}</p>
                        <p className="text-xs text-stone-400 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl border border-stone-200 p-5">
                    <h2 className="text-sm font-semibold text-stone-700 mb-4">Daily Clicks</h2>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={dailyClicks}>
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#7B1113" radius={[4,4,0,0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl border border-stone-200 p-5">
                    <h2 className="text-sm font-semibold text-stone-700 mb-4">New Links Created</h2>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={newLinks}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#FFD100" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Links */}
            <div className="bg-white rounded-xl border border-stone-200 p-5">
                <h2 className="text-sm font-semibold text-stone-700 mb-4">Top Links by Clicks</h2>
                <div className="space-y-2">
                    {topLinks.map((link, i) => (
                        <div key={link.short_code} className="flex items-center gap-3">
                            <span className="text-xs text-stone-400 w-5 text-right">{i + 1}</span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className="text-xs font-mono text-[#7B1113] font-semibold">{link.short_code}</span>
                                    <span className="text-xs text-stone-500 font-semibold">{link.visit_count.toLocaleString()} clicks</span>
                                </div>
                                <div className="w-full bg-stone-100 rounded-full h-1.5">
                                    <div
                                        className="h-1.5 rounded-full"
                                        style={{
                                            width: `${topLinks[0].visit_count > 0 ? (link.visit_count / topLinks[0].visit_count) * 100 : 0}%`,
                                            background: '#7B1113',
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    {topLinks.length === 0 && <p className="text-sm text-stone-400">No data yet.</p>}
                </div>
            </div>
        </AdminLayout>
    );
}