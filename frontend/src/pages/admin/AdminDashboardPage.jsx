import React, { useEffect, useState } from 'react';
import { FiCheckCircle, FiClock, FiMapPin, FiPackage, FiRotateCcw, FiTruck, FiUsers, FiXCircle } from 'react-icons/fi';
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../../services/api';

const COLORS = ['#6366f1', '#10b981', '#8b5cf6', '#06b6d4', '#f43f5e', '#ec4899', '#94a3b8'];

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card-glass flex items-center gap-4 hover:-translate-y-1 transition-all duration-300">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="text-xl text-white" />
    </div>
    <div>
      <p className="text-slate-400 text-sm">{label}</p>
      <p className="text-3xl font-display font-bold text-white">{value}</p>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => active && payload?.length ? (
  <div className="glass rounded-xl px-4 py-3 border border-white/10">
    <p className="text-slate-300 text-sm mb-1">{label}</p>
    <p className="text-indigo-400 font-bold">{payload[0].value} parcels</p>
  </div>
) : null;

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then((response) => {
        setStats(response.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!stats) {
    return <div className="text-slate-400">Unable to load dashboard statistics.</div>;
  }

  const statCards = [
    { icon: FiPackage, label: 'Total Parcels', value: stats.total, color: 'bg-gradient-to-br from-indigo-500 to-violet-600' },
    { icon: FiCheckCircle, label: 'Delivered', value: stats.delivered, color: 'bg-gradient-to-br from-emerald-500 to-teal-500' },
    { icon: FiTruck, label: 'In Transit', value: stats.inTransit, color: 'bg-gradient-to-br from-blue-500 to-cyan-500' },
    { icon: FiClock, label: 'Pending', value: stats.pending, color: 'bg-gradient-to-br from-amber-500 to-yellow-500' },
    { icon: FiMapPin, label: 'Out for Delivery', value: stats.outForDelivery, color: 'bg-gradient-to-br from-sky-500 to-indigo-500' },
    { icon: FiXCircle, label: 'Cancelled', value: stats.cancelled, color: 'bg-gradient-to-br from-rose-500 to-red-500' },
    { icon: FiRotateCcw, label: 'Returned', value: stats.returned, color: 'bg-gradient-to-br from-slate-500 to-slate-700' },
    { icon: FiUsers, label: 'Total Users', value: stats.totalUsers, color: 'bg-gradient-to-br from-pink-500 to-rose-500' },
  ];

  const pieData = stats.byStatus.map((status) => ({ name: status._id, value: status.count }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-white mb-1">Admin Dashboard</h1>
        <p className="text-slate-400">Overview of all delivery operations</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => <StatCard key={card.label} {...card} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-glass">
          <h3 className="text-lg font-display font-semibold text-white mb-6">New Parcels - Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.last7Days}>
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="url(#indigoGrad)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card-glass">
          <h3 className="text-lg font-display font-semibold text-white mb-6">Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-glass">
        <h3 className="text-lg font-display font-semibold text-white mb-6">Parcel Types Distribution</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {stats.byType.map((type, index) => (
            <div key={type._id} className="glass rounded-xl p-4 text-center hover:bg-white/10 transition-colors">
              <div className="text-2xl font-display font-bold mb-1" style={{ color: COLORS[index % COLORS.length] }}>{type.count}</div>
              <div className="text-slate-400 text-xs">{type._id}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
