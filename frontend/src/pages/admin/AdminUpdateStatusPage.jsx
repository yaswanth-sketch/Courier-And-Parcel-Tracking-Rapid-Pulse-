import React, { useState, useEffect } from 'react';
import { FiSearch, FiRefreshCw, FiMapPin, FiCheckCircle, FiPackage, FiTruck, FiUser, FiSend } from 'react-icons/fi';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUSES = ['Booked', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'];

export default function AdminUpdateStatusPage() {
  const [trackingId, setTrackingId] = useState('');
  const [parcel, setParcel] = useState(null);
  const [carriers, setCarriers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [form, setForm] = useState({ status: '', location: '', description: '' });
  const [updating, setUpdating] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState('');

  useEffect(() => {
    api.get('/admin/carriers').then(r => setCarriers(r.data)).catch(() => {});
  }, []);

  const searchParcel = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return toast.error('Enter a tracking ID');
    setSearching(true);
    try {
      const { data } = await api.get(`/parcels/${trackingId.trim().toUpperCase()}`);
      setParcel(data);
      setForm({ status: data.status, location: '', description: '' });
      setSelectedCarrier(data.carrierId?._id || '');
    } catch {
      toast.error('Parcel not found');
      setParcel(null);
    } finally { setSearching(false); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!form.status) return toast.error('Select a status');
    if (!form.location.trim()) return toast.error('Enter the current location');
    setUpdating(true);
    try {
      const { data } = await api.put(`/admin/update-status/${parcel._id}`, form);
      setParcel(data);
      toast.success('Status updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setUpdating(false); }
  };

  const assignCarrier = async () => {
    if (!selectedCarrier) return toast.error('Select a carrier');
    try {
      await api.put(`/admin/assign-carrier/${parcel._id}`, { carrierId: selectedCarrier });
      toast.success('Carrier assigned!');
      searchParcel({ preventDefault: () => {} }); // Refresh
    } catch (err) {
      toast.error('Assignment failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-white mb-1">Logistics Management</h1>
        <p className="text-slate-400">Search, update status, and assign transport units/partners</p>
      </div>

      <form onSubmit={searchParcel} className="card-glass mb-8 flex gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="input-dark pl-11 font-mono uppercase tracking-widest text-lg"
            placeholder="TRK0000000000"
            value={trackingId}
            onChange={e => setTrackingId(e.target.value.toUpperCase())}
            maxLength={13}
          />
        </div>
        <button type="submit" disabled={searching} className="btn-premium px-8">
          {searching ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Search'}
        </button>
      </form>

      {parcel && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
          <div className="lg:col-span-2 space-y-6">
            <div className="card-glass">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Tracking ID</p>
                  <p className="text-2xl font-mono font-bold text-indigo-400">{parcel.trackingId}</p>
                </div>
                <StatusBadge status={parcel.status} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  ['From', parcel.senderName],
                  ['To', parcel.receiverName],
                  ['Type', parcel.parcelType],
                  ['Priority', parcel.priority],
                ].map(([label, val]) => (
                  <div key={label} className="glass rounded-xl p-3">
                    <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">{label}</div>
                    <div className="text-white text-sm font-medium truncate">{val}</div>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleUpdate} className="card-glass space-y-6">
              <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
                <FiRefreshCw className="text-indigo-400" /> Update Status & History
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STATUSES.map(s => (
                  <button key={s} type="button" onClick={() => setForm(f => ({ ...f, status: s }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${form.status === s ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'}`}>
                    {s}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Location</label>
                  <input className="input-dark text-sm" placeholder="e.g. Mumbai Hub" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Note</label>
                  <input className="input-dark text-sm" placeholder="e.g. Processing for dispatch" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
              </div>

              <button type="submit" disabled={updating || !form.status || !form.location.trim()} className="btn-premium w-full flex items-center justify-center gap-2">
                {updating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiCheckCircle /> Apply Status Update</>}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            {/* Transport Assignment */}
            <div className="card-glass border-indigo-500/10">
              <h3 className="text-lg font-display font-semibold text-white mb-5 flex items-center gap-2">
                <FiTruck className="text-indigo-400" /> Assign Transport/Partner
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-500 text-[10px] font-bold uppercase mb-2">Logistics Partner (Vehicle/Train/Person)</label>
                  <select className="input-dark text-sm" value={selectedCarrier} onChange={e => setSelectedCarrier(e.target.value)}>
                    <option value="">Select Partner</option>
                    {carriers.map(c => <option key={c._id} value={c._id}>{c.name} ({c.email})</option>)}
                  </select>
                </div>
                <button onClick={assignCarrier} className="btn-premium w-full flex items-center justify-center gap-2 text-sm py-3 bg-indigo-600/20 border border-indigo-500/50">
                  <FiUser /> Assign Transport
                </button>
              </div>

              {parcel.carrierId && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="text-slate-500 text-[10px] font-bold uppercase mb-3">Currently Assigned</div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                      {parcel.carrierId.name?.[0]}
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">{parcel.carrierId.name}</div>
                      <div className="text-slate-400 text-xs">{parcel.carrierId.phone}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* History */}
            <div className="card-glass">
              <h3 className="text-lg font-display font-semibold text-white mb-6">Recent Updates</h3>
              <div className="space-y-4">
                {[...parcel.trackingHistory].reverse().slice(0, 5).map((h, i) => (
                  <div key={i} className="flex gap-3 relative">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${i === 0 ? 'bg-indigo-400' : 'bg-slate-600'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-bold ${i === 0 ? 'text-white' : 'text-slate-500'}`}>{h.status}</span>
                        <span className="text-slate-600 text-[10px]">{format(new Date(h.updatedAt), 'HH:mm')}</span>
                      </div>
                      <div className="text-slate-500 text-[10px] truncate">{h.location}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
