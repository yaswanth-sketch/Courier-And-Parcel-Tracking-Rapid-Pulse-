import React, { useEffect, useState } from 'react';
import { FiSearch, FiFilter, FiPackage, FiEye } from 'react-icons/fi';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const STATUSES = ['All', 'Booked', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function ShipmentHistoryPage() {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/parcels/my').then(r => { setParcels(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = parcels.filter(p => {
    const matchStatus = filter === 'All' || p.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || p.trackingId.toLowerCase().includes(q) || p.receiverName.toLowerCase().includes(q) || p.receiverAddress.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-white mb-1">Shipment History</h1>
        <p className="text-slate-400">All your past and active shipments</p>
      </div>

      {/* Filters */}
      <div className="card-glass mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input-dark pl-11" placeholder="Search by tracking ID, receiver..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <FiFilter className="text-slate-500 flex-shrink-0" />
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === s ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card-glass overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FiPackage className="text-5xl text-slate-600 mx-auto mb-4" />
            <p className="text-slate-300 font-medium mb-1">No parcels found</p>
            <p className="text-slate-500 text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  {['Tracking ID', 'Receiver', 'Destination', 'Type', 'Priority', 'Status', 'Date', ''].map(h => (
                    <th key={h} className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(p => (
                  <tr key={p._id} className="hover:bg-white/3 transition-colors group">
                    <td className="px-4 py-4 font-mono text-indigo-400 text-sm font-medium">{p.trackingId}</td>
                    <td className="px-4 py-4 group">
                      <div className="text-slate-200 text-sm font-medium">{p.receiverName}</div>
                      <div className="text-slate-500 text-[10px]">{p.receiverPhone || 'No contact'}</div>
                    </td>
                    <td className="px-4 py-4 text-slate-400 text-xs max-w-[200px] leading-relaxed">{p.receiverAddress}</td>
                    <td className="px-4 py-4 text-slate-400 text-sm">{p.parcelType}</td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-lg ${p.priority === 'Overnight' ? 'bg-indigo-500/20 text-indigo-300' : p.priority === 'Express' ? 'bg-blue-500/20 text-blue-300' : 'bg-white/5 text-slate-400'}`}>
                        {p.priority}
                      </span>
                    </td>
                    <td className="px-4 py-4"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-4 text-slate-400 text-sm whitespace-nowrap">{format(new Date(p.createdAt), 'MMM d, yyyy')}</td>
                    <td className="px-4 py-4">
                      <button onClick={() => navigate(`/track?id=${p.trackingId}`)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-400 transition-all p-1.5 hover:bg-indigo-500/10 rounded-lg">
                        <FiEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-white/8 text-slate-500 text-sm">
              Showing {filtered.length} of {parcels.length} shipments
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
