import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiCheckCircle, FiClock, FiXCircle, FiPlusCircle, FiSearch, FiArrowRight, FiTruck } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { format } from 'date-fns';

const StatCard = ({ icon: Icon, label, value, color, gradient }) => (
  <div className={`card-glass relative overflow-hidden group hover:-translate-y-1 transition-all duration-300`}>
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${gradient}`} />
    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
        <p className="text-4xl font-display font-bold text-white">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="text-xl text-white" />
      </div>
    </div>
  </div>
);

const QuickAction = ({ to, icon: Icon, label, desc, color }) => (
  <Link to={to} className="card-glass group hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 cursor-pointer">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} flex-shrink-0`}>
      <Icon className="text-xl text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-white font-semibold group-hover:text-indigo-300 transition-colors">{label}</div>
      <div className="text-slate-400 text-sm">{desc}</div>
    </div>
    <FiArrowRight className="text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
  </Link>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, delivered: 0, pending: 0, cancelled: 0, recent: [], incoming: 0 });
  const [receivedParcels, setReceivedParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('outgoing');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, incomingRes] = await Promise.all([
          api.get('/parcels/dashboard'),
          api.get('/parcels/incoming')
        ]);
        setStats(statsRes.data);
        setReceivedParcels(incomingRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { icon: FiPackage, label: 'Sent Parcels', value: stats.total, color: 'bg-gradient-to-br from-indigo-500 to-violet-600', gradient: 'bg-gradient-to-br from-indigo-500/5 to-transparent' },
    { icon: FiTruck, label: 'Incoming', value: stats.incoming, color: 'bg-gradient-to-br from-blue-500 to-cyan-500', gradient: 'bg-gradient-to-br from-blue-500/5 to-transparent' },
    { icon: FiCheckCircle, label: 'Delivered', value: stats.delivered, color: 'bg-gradient-to-br from-emerald-500 to-teal-500', gradient: 'bg-gradient-to-br from-emerald-500/5 to-transparent' },
    { icon: FiXCircle, label: 'Cancelled', value: stats.cancelled, color: 'bg-gradient-to-br from-red-500 to-rose-500', gradient: 'bg-gradient-to-br from-red-500/5 to-transparent' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">👋</span>
          <h1 className="text-2xl font-display font-bold text-white">Welcome back, {user?.name?.split(' ')[0]}!</h1>
        </div>
        <p className="text-slate-400">Track your shipments and secure your handovers with PIN codes.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} value={loading ? '–' : card.value} />
        ))}
      </div>

      {/* Tab Switching */}
      <div className="flex border-b border-white/10 gap-8">
        <button 
          onClick={() => setActiveTab('outgoing')}
          className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'outgoing' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Outgoing Shipments
        </button>
        <button 
          onClick={() => setActiveTab('incoming')}
          className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'incoming' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Incoming Parcels
        </button>
      </div>

      {activeTab === 'outgoing' ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-white">Recent Sent</h2>
            <Link to="/history" className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1 transition-colors">View all <FiArrowRight /></Link>
          </div>
          <div className="card-glass overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : stats.recent.length === 0 ? (
              <div className="text-center py-12">
                <FiTruck className="text-4xl text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No sent shipments yet</p>
                <Link to="/book" className="btn-premium inline-flex items-center gap-2 mt-4 text-sm px-4 py-2">Book a parcel <FiArrowRight /></Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/8">
                      {['Tracking ID', 'Receiver', 'Status', 'Pickup PIN', 'Date'].map(h => (
                        <th key={h} className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wider px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {stats.recent.map(p => (
                      <tr key={p._id} className="hover:bg-white/3 transition-colors">
                        <td className="px-4 py-4 font-mono text-indigo-400 text-sm">
                          <Link to={`/track?id=${p.trackingId}`} className="hover:underline">{p.trackingId}</Link>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-white text-sm">{p.receiverName}</div>
                          <div className="text-slate-500 text-[10px]">{p.receiverAddress}</div>
                        </td>
                        <td className="px-4 py-4"><StatusBadge status={p.status} /></td>
                        <td className="px-4 py-4">
                          {p.status === 'Booked' ? (
                            <div className="bg-indigo-500/10 text-indigo-400 font-mono font-bold px-2 py-1 rounded text-center border border-indigo-500/20">
                              {p.pickupCode}
                            </div>
                          ) : <span className="text-slate-600 text-xs">—</span>}
                        </td>
                        <td className="px-4 py-4 text-slate-400 text-sm">{format(new Date(p.createdAt), 'MMM d')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-display font-semibold text-white mb-4">Incoming for You</h2>
          <div className="card-glass overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : receivedParcels.length === 0 ? (
              <div className="text-center py-12">
                <FiPackage className="text-4xl text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No incoming parcels found for your phone: {user?.phone}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/8">
                      {['Tracking ID', 'Sender', 'Status', 'Delivery PIN', 'Date'].map(h => (
                        <th key={h} className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wider px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {receivedParcels.map(p => (
                      <tr key={p._id} className="hover:bg-white/3 transition-colors">
                        <td className="px-4 py-4 font-mono text-emerald-400 text-sm">
                          <Link to={`/track?id=${p.trackingId}`} className="hover:underline">{p.trackingId}</Link>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-white text-sm">{p.senderName}</div>
                          <div className="text-slate-500 text-[10px]">{p.senderAddress}</div>
                        </td>
                        <td className="px-4 py-4"><StatusBadge status={p.status} /></td>
                        <td className="px-4 py-4">
                          {p.status === 'Out for Delivery' ? (
                            <div className="bg-emerald-500/10 text-emerald-400 font-mono font-bold px-2 py-1 rounded text-center border border-emerald-500/20">
                              {p.deliveryCode}
                            </div>
                          ) : <span className="text-slate-600 text-xs">—</span>}
                        </td>
                        <td className="px-4 py-4 text-slate-400 text-sm">{format(new Date(p.createdAt), 'MMM d')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-display font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAction to="/book" icon={FiPlusCircle} label="Book a Parcel" desc="Send a new package" color="bg-gradient-to-br from-indigo-500 to-violet-600" />
          <QuickAction to="/track" icon={FiSearch} label="Track Parcel" desc="Enter your tracking ID" color="bg-gradient-to-br from-blue-500 to-cyan-500" />
          <QuickAction to="/history" icon={FiClock} label="View History" desc="All your shipments" color="bg-gradient-to-br from-emerald-500 to-teal-500" />
        </div>
      </div>
    </div>
  );
}
