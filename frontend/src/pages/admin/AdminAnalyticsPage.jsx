import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import api from '../../services/api';

const COLORS = ['#6366f1', '#10b981', '#8b5cf6', '#06b6d4', '#f43f5e', '#ec4899', '#94a3b8'];

const CustomTooltip = ({ active, payload, label }) => active && payload?.length ? (
  <div className="glass rounded-xl px-4 py-3 border border-white/10">
    <p className="text-slate-300 text-sm mb-1">{label}</p>
    {payload.map((p, i) => <p key={i} style={{ color: p.color }} className="font-bold text-sm">{p.value} {p.name}</p>)}
  </div>
) : null;

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => { setStats(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!stats) return <div className="text-slate-400">Unable to load analytics.</div>;

  const deliveryRate = stats.total ? Math.round((stats.delivered / stats.total) * 100) : 0;

  const typeData = stats.byType.map(t => ({ name: t._id, value: t.count }));
  const statusData = stats.byStatus.map(s => ({ name: s._id, count: s.count }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-white mb-1">Operations Analytics</h1>
        <p className="text-slate-400">Network-wide logistics and transport performance insights</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Delivery Rate', value: `${deliveryRate}%`, color: 'text-emerald-400', sub: 'successfully delivered' },
          { label: 'In Progress', value: stats.inTransit + stats.pending + stats.outForDelivery, color: 'text-blue-400', sub: 'active shipments' },
          { label: 'Cancelled', value: stats.cancelled, color: 'text-red-400', sub: 'total cancelled' },
          { label: 'Registered Users', value: stats.totalUsers, color: 'text-violet-400', sub: 'active accounts' },
        ].map(k => (
          <div key={k.label} className="card-glass text-center">
            <div className={`text-3xl font-display font-bold mb-1 ${k.color}`}>{k.value}</div>
            <div className="text-white text-sm font-medium">{k.label}</div>
            <div className="text-slate-500 text-xs mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Daily trend */}
      <div className="card-glass">
        <h3 className="text-lg font-display font-semibold text-white mb-6">New Parcels - Last 7 Days</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={stats.last7Days}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="count" name="parcels" stroke="#6366f1" strokeWidth={2} fill="url(#areaGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parcel types pie */}
        <div className="card-glass">
          <h3 className="text-lg font-display font-semibold text-white mb-6">Parcel Types</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={typeData} cx="50%" cy="50%" outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f1f5f9' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Status bar */}
        <div className="card-glass">
          <h3 className="text-lg font-display font-semibold text-white mb-6">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={statusData} layout="vertical">
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="parcels" radius={[0, 6, 6, 0]}>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
