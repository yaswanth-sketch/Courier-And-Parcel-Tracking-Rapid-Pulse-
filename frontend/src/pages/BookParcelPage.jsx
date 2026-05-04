import React, { useState } from 'react';
import { FiPackage, FiUser, FiMapPin, FiPhone, FiArrowRight, FiCheckCircle, FiCopy, FiMail } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';

const parcelTypes = ['Document', 'Electronics', 'Clothing', 'Food', 'Fragile', 'Medicine', 'Other'];
const priorities = [
  { value: 'Standard', label: 'Standard', desc: '5–7 days', color: 'from-slate-500 to-slate-600' },
  { value: 'Express', label: 'Express', desc: '2–3 days', color: 'from-blue-500 to-cyan-500' },
  { value: 'Overnight', label: 'Overnight', desc: 'Next day', color: 'from-indigo-600 to-violet-600' },
];

export default function BookParcelPage() {
  const [form, setForm] = useState({
    senderName: '', senderEmail: '', senderPhone: '', senderAddress: '',
    receiverName: '', receiverEmail: '', receiverPhone: '', receiverAddress: '',
    parcelType: 'Document', weight: 1, description: '', priority: 'Standard'
  });
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/parcels', form);
      setBooked(data);
      toast.success('Parcel booked successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const copyId = () => { navigator.clipboard.writeText(booked.trackingId); toast.success('Copied!'); };

  if (booked) return (
    <div className="max-w-lg mx-auto animate-slide-up">
      <div className="card-glass text-center py-10 px-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
          <FiCheckCircle className="text-4xl text-white" />
        </div>
        <h2 className="text-2xl font-display font-bold text-white mb-2">Shipment Registered!</h2>
        <p className="text-slate-400 mb-8">Your logistics unit has been registered. Use the tracking ID below to track its progress across the network.</p>
        <div className="glass rounded-2xl p-6 mb-6">
          <p className="text-slate-400 text-sm mb-2">Tracking ID</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl font-mono font-bold text-indigo-400">{booked.trackingId}</span>
            <button onClick={copyId} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg">
              <FiCopy />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-8 text-left">
          <div className="glass rounded-xl p-3">
            <div className="text-slate-500 text-xs mb-1">Security PIN</div>
            <div className="text-indigo-400 text-sm font-mono font-bold tracking-wider">{booked.securityCode}</div>
          </div>
          <div className="glass rounded-xl p-3">
            <div className="text-slate-500 text-xs mb-1">Priority</div>
            <div className="text-white text-sm font-medium">{booked.priority}</div>
          </div>
          <div className="glass rounded-xl p-3">
            <div className="text-slate-500 text-xs mb-1">Est. Delivery</div>
            <div className="text-white text-sm font-medium">{new Date(booked.estimatedDelivery).toLocaleDateString()}</div>
          </div>
          <div className="glass rounded-xl p-3">
            <div className="text-slate-500 text-xs mb-1">To</div>
            <div className="text-white text-sm font-medium">{booked.receiverName}</div>
          </div>
          <div className="glass rounded-xl p-3">
            <div className="text-slate-500 text-xs mb-1">Type</div>
            <div className="text-white text-sm font-medium">{booked.parcelType}</div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setBooked(null)} className="btn-ghost flex-1">Book Another</button>
          <a href="/track" className="btn-premium flex-1 flex items-center justify-center gap-2">Track <FiArrowRight /></a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-white mb-1">Create Shipment</h1>
        <p className="text-slate-400">Fill in origin and destination details to register a new logistics unit</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sender */}
        <div className="card-glass">
          <h2 className="text-lg font-display font-semibold text-white mb-5 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center"><FiUser className="text-indigo-400 text-sm" /></div>
            Sender Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-sm mb-1.5">Full Name *</label>
              <div className="relative"><FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input className="input-dark pl-10" placeholder="Sender name" value={form.senderName} onChange={e => set('senderName', e.target.value)} required /></div>
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1.5">Email</label>
              <div className="relative"><FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input type="email" className="input-dark pl-10" placeholder="sender@example.com" value={form.senderEmail} onChange={e => set('senderEmail', e.target.value)} /></div>
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1.5">Phone</label>
              <div className="relative"><FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input className="input-dark pl-10" placeholder="Phone number" value={form.senderPhone} onChange={e => set('senderPhone', e.target.value)} /></div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-slate-400 text-sm mb-1.5">Address *</label>
              <div className="relative"><FiMapPin className="absolute left-3.5 top-3.5 text-slate-500 text-sm" />
                <textarea className="input-dark pl-10 resize-none" rows={2} placeholder="Sender's full address" value={form.senderAddress} onChange={e => set('senderAddress', e.target.value)} required /></div>
            </div>
          </div>
        </div>

        {/* Receiver */}
        <div className="card-glass">
          <h2 className="text-lg font-display font-semibold text-white mb-5 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center"><FiMapPin className="text-blue-400 text-sm" /></div>
            Receiver Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-sm mb-1.5">Full Name *</label>
              <div className="relative"><FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input className="input-dark pl-10" placeholder="Receiver name" value={form.receiverName} onChange={e => set('receiverName', e.target.value)} required /></div>
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1.5">Email</label>
              <div className="relative"><FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input type="email" className="input-dark pl-10" placeholder="receiver@example.com" value={form.receiverEmail} onChange={e => set('receiverEmail', e.target.value)} /></div>
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1.5">Phone</label>
              <div className="relative"><FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input className="input-dark pl-10" placeholder="Phone number" value={form.receiverPhone} onChange={e => set('receiverPhone', e.target.value)} /></div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-slate-400 text-sm mb-1.5">Address *</label>
              <div className="relative"><FiMapPin className="absolute left-3.5 top-3.5 text-slate-500 text-sm" />
                <textarea className="input-dark pl-10 resize-none" rows={2} placeholder="Receiver's full address" value={form.receiverAddress} onChange={e => set('receiverAddress', e.target.value)} required /></div>
            </div>
          </div>
        </div>

        {/* Item Details */}
        <div className="card-glass">
          <h2 className="text-lg font-display font-semibold text-white mb-5 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center"><FiPackage className="text-emerald-400 text-sm" /></div>
            Shipment / Item Details
          </h2>
          <div className="space-y-5">
            <div>
              <label className="block text-slate-400 text-sm mb-2">Parcel Type *</label>
              <div className="flex flex-wrap gap-2">
                {parcelTypes.map(t => (
                  <button key={t} type="button" onClick={() => set('parcelType', t)}
                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${form.parcelType === t ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2">Delivery Priority</label>
              <div className="grid grid-cols-3 gap-3">
                {priorities.map(p => (
                  <button key={p.value} type="button" onClick={() => set('priority', p.value)}
                    className={`p-3 rounded-xl border text-center transition-all ${form.priority === p.value ? `bg-gradient-to-br ${p.color} border-transparent text-white` : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'}`}>
                    <div className="font-semibold text-sm">{p.label}</div>
                    <div className="text-xs opacity-75">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1.5">Weight (kg)</label>
                <input type="number" min="0.1" step="0.1" className="input-dark" value={form.weight} onChange={e => set('weight', e.target.value)} />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1.5">Description</label>
                <input className="input-dark" placeholder="Optional note" value={form.description} onChange={e => set('description', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-premium w-full flex items-center justify-center gap-2 text-base py-4">
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiPackage /> Book Parcel &amp; Generate Tracking ID <FiArrowRight /></>}
        </button>
      </form>
    </div>
  );
}
