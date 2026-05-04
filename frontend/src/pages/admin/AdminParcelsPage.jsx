import React, { useEffect, useState } from 'react';
import { FiFilter, FiPackage, FiRefreshCw, FiSearch } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

const STATUSES = ['all', 'Booked', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'];
const UPDATE_STATUSES = STATUSES.filter((s) => s !== 'all');

export default function AdminParcelsPage() {
  const [parcels, setParcels] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [updating, setUpdating] = useState(null);
  const [updateDraft, setUpdateDraft] = useState({ status: '', location: '', description: '' });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/parcels?status=${status}&search=${search}&page=${page}&limit=15`);
      setParcels(data.parcels);
      setTotal(data.total);
      setPages(data.pages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const startUpdate = (parcel) => {
    setUpdating(parcel._id);
    setUpdateDraft({ status: parcel.status, location: '', description: '' });
  };

  const setDraftField = (key, value) => {
    setUpdateDraft((current) => ({ ...current, [key]: value }));
  };

  const quickUpdate = async (id) => {
    if (!updateDraft.status) return toast.error('Select a status');
    if (!updateDraft.location.trim()) return toast.error('Enter the current location');

    try {
      await api.put(`/admin/update-status/${id}`, {
        ...updateDraft,
        description: updateDraft.description.trim() || `Status updated to ${updateDraft.status}`
      });
      toast.success('Status updated');
      setUpdating(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-white mb-1">Logistics Hub</h1>
        <p className="text-slate-400">{total} total shipments tracked</p>
      </div>

      <div className="card-glass mb-6 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input className="input-dark pl-11" placeholder="Search tracking ID, sender, receiver..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button type="submit" className="btn-ghost px-6 flex items-center gap-2"><FiSearch /> Search</button>
        </form>
        <div className="flex items-center gap-2 flex-wrap">
          <FiFilter className="text-slate-500" />
          {STATUSES.map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${status === s ? 'bg-violet-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="card-glass overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : parcels.length === 0 ? (
          <div className="text-center py-16"><FiPackage className="text-5xl text-slate-600 mx-auto mb-4" /><p className="text-slate-400">No parcels found</p></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8">
                    {['Tracking ID', 'Sender', 'Receiver', 'Type', 'Status', 'User', 'Date', 'Actions'].map(h => (
                      <th key={h} className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {parcels.map(p => (
                    <tr key={p._id} className="hover:bg-white/3 transition-colors align-top">
                      <td className="px-4 py-4 font-mono text-indigo-400 text-sm">{p.trackingId}</td>
                      <td className="px-4 py-4">
                        <div className="text-white font-semibold text-sm">{p.senderName}</div>
                        <div className="text-slate-500 text-[10px] truncate max-w-[150px]">{p.senderPhone}</div>
                        <div className="text-slate-500 text-[10px] truncate max-w-[150px]">{p.senderAddress}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-white font-semibold text-sm">{p.receiverName}</div>
                        <div className="text-slate-500 text-[10px] truncate max-w-[150px]">{p.receiverPhone}</div>
                        <div className="text-slate-500 text-[10px] truncate max-w-[150px]">{p.receiverAddress}</div>
                      </td>
                      <td className="px-4 py-4 text-slate-400 text-sm">{p.parcelType}</td>
                      <td className="px-4 py-4"><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-4 text-slate-400 text-sm">{p.userId?.name || '-'}</td>
                      <td className="px-4 py-4 text-slate-400 text-sm whitespace-nowrap">{format(new Date(p.createdAt), 'MMM d, yyyy')}</td>
                      <td className="px-4 py-4 min-w-[340px]">
                        {updating === p._id ? (
                          <div className="space-y-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <select className="input-dark text-xs py-2 px-2" value={updateDraft.status} onChange={e => setDraftField('status', e.target.value)}>
                                <option value="">Select status...</option>
                                {UPDATE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                              <input className="input-dark text-xs py-2 px-2" value={updateDraft.location} onChange={e => setDraftField('location', e.target.value)} placeholder="Current location *" />
                            </div>
                            <input className="input-dark text-xs py-2 px-2" value={updateDraft.description} onChange={e => setDraftField('description', e.target.value)} placeholder="Update note (optional)" />
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => quickUpdate(p._id)} className="bg-violet-500 hover:bg-violet-600 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">Save</button>
                              <button type="button" onClick={() => setUpdating(null)} className="text-slate-400 hover:text-white text-xs px-2 py-1.5">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => startUpdate(p)}
                            className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 text-xs bg-violet-500/10 hover:bg-violet-500/20 px-3 py-1.5 rounded-lg transition-all">
                            <FiRefreshCw className="text-xs" /> Update
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/8">
              <span className="text-slate-500 text-sm">Page {page} of {pages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="btn-ghost py-1.5 px-4 text-sm disabled:opacity-40">Previous</button>
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                  className="btn-ghost py-1.5 px-4 text-sm disabled:opacity-40">Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
