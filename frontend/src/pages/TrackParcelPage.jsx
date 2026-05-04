import React, { useState, useEffect, useCallback } from 'react';
import { FiBox, FiCheckCircle, FiMapPin, FiPackage, FiSearch, FiTruck, FiShield, FiPhone, FiNavigation } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const STAGES = ['Booked', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered'];
const STAGE_ICONS = {
  Booked: FiBox,
  'Picked Up': FiPackage,
  'In Transit': FiTruck,
  'Out for Delivery': FiMapPin,
  Delivered: FiCheckCircle
};

// Component to handle map center updates
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function TrackParcelPage({ publicMode = false }) {
  const [trackingId, setTrackingId] = useState('');
  const [parcel, setParcel] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchParcel = useCallback(async (id) => {
    if (!id) return;
    try {
      const { data } = await api.get(`/parcels/${id.trim().toUpperCase()}`);
      setParcel(data);
    } catch {
      toast.error('Parcel not found');
      setParcel(null);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      setTrackingId(id);
      fetchParcel(id);
    }
  }, [fetchParcel]);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return toast.error('Enter a tracking ID');
    setLoading(true);
    await fetchParcel(trackingId);
    setLoading(false);
  };

  // Poll for updates if parcel is in motion
  useEffect(() => {
    let interval;
    if (parcel && (parcel.status === 'In Transit' || parcel.status === 'Out for Delivery')) {
      interval = setInterval(() => {
        fetchParcel(parcel.trackingId);
      }, 5000); 
    }
    return () => clearInterval(interval);
  }, [parcel, fetchParcel]);

  const currentStageIdx = parcel ? STAGES.indexOf(parcel.status) : -1;
  const isLive = parcel && (parcel.status === 'In Transit' || parcel.status === 'Out for Delivery');

  return (
    <div className={publicMode ? 'min-h-screen bg-slate-950 p-6' : ''}>
      <div className="max-w-4xl mx-auto animate-fade-in">
        {publicMode && (
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Rapid Pulse Logo" className="w-10 h-10 rounded-xl" />
              <div className="text-left">
                <div className="text-white font-display font-bold">Rapid Pulse</div>
                <div className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Global Logistics</div>
              </div>
            </div>
            <a href="/login" className="btn-ghost py-2 px-4 text-sm">Login</a>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-2xl font-display font-bold text-white mb-1">Track Your Parcel</h1>
          <p className="text-slate-400">Enter your tracking ID to get real-time delivery updates</p>
        </div>

        <form onSubmit={handleTrack} className="card-glass mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                className="input-dark pl-11 font-mono uppercase text-lg tracking-widest"
                placeholder="TRK0000000000"
                value={trackingId}
                onChange={e => setTrackingId(e.target.value.toUpperCase())}
                maxLength={13}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-premium px-8 flex items-center justify-center gap-2 flex-shrink-0">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiSearch /> Track</>}
            </button>
          </div>
        </form>

        {parcel && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
            <div className="lg:col-span-2 space-y-6">
              {/* Main Info */}
              <div className="card-glass">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Tracking ID</p>
                    <p className="text-2xl font-mono font-bold text-indigo-400">{parcel.trackingId}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={parcel.status} />
                    {isLive && (
                      <div className="flex items-center gap-1.5 justify-end mt-2 text-xs text-indigo-400 font-medium">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                        LIVE TRACKING
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Map */}
                {isLive && parcel.deliveryAgent?.currentLocation && (
                  <div className="relative h-72 rounded-2xl overflow-hidden mb-6 border border-white/10 shadow-2xl">
                    <MapContainer 
                      center={[parcel.deliveryAgent.currentLocation.lat, parcel.deliveryAgent.currentLocation.lng]} 
                      zoom={14} 
                      scrollWheelZoom={false}
                      className="h-full w-full z-0"
                    >
                      <ChangeView center={[parcel.deliveryAgent.currentLocation.lat, parcel.deliveryAgent.currentLocation.lng]} zoom={14} />
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap contributors'
                      />
                      <Marker position={[parcel.deliveryAgent.currentLocation.lat, parcel.deliveryAgent.currentLocation.lng]}>
                        <Popup>
                          <div className="font-sans p-1">
                            <p className="font-bold text-indigo-600">{parcel.deliveryAgent.name}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Out for delivery</p>
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>
                    <div className="absolute bottom-4 left-4 z-10 glass px-3 py-1.5 rounded-full text-[10px] text-white flex items-center gap-2 border border-white/10 shadow-lg">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                      <span className="font-bold tracking-widest">LIVE GPS: {parcel.deliveryAgent.currentLocation.lat.toFixed(4)}, {parcel.deliveryAgent.currentLocation.lng.toFixed(4)}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  {/* Sender Details */}
                  <div className="glass rounded-2xl p-5 border border-white/5 bg-white/2 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3 mb-4 text-indigo-400">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                        <FiPackage className="text-sm" />
                      </div>
                      <h4 className="text-sm font-display font-bold uppercase tracking-wider">Sender Details</h4>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">Name</div>
                        <div className="text-white font-medium">{parcel.senderName}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">Contact</div>
                        <div className="text-white text-sm flex items-center gap-2"><FiPhone className="text-xs text-indigo-400" /> {parcel.senderPhone || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">Address</div>
                        <div className="text-white text-sm flex items-start gap-2"><FiMapPin className="text-xs text-indigo-400 mt-1 flex-shrink-0" /> {parcel.senderAddress}</div>
                      </div>
                    </div>
                  </div>

                  {/* Receiver Details */}
                  <div className="glass rounded-2xl p-5 border border-white/5 bg-white/2 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3 mb-4 text-emerald-400">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <FiMapPin className="text-sm" />
                      </div>
                      <h4 className="text-sm font-display font-bold uppercase tracking-wider">Receiver Details</h4>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">Name</div>
                        <div className="text-white font-medium">{parcel.receiverName}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">Contact</div>
                        <div className="text-white text-sm flex items-center gap-2"><FiPhone className="text-xs text-emerald-400" /> {parcel.receiverPhone || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">Address</div>
                        <div className="text-white text-sm flex items-start gap-2"><FiMapPin className="text-xs text-emerald-400 mt-1 flex-shrink-0" /> {parcel.receiverAddress}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    ['Parcel Type', parcel.parcelType],
                    ['Service Level', parcel.priority],
                  ].map(([label, val]) => (
                    <div key={label} className="glass rounded-xl p-3 border border-white/5">
                      <div className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">{label}</div>
                      <div className="text-white text-sm font-semibold">{val}</div>
                    </div>
                  ))}
                </div>

              </div>

              {/* Progress */}
              <div className="card-glass">
                <h3 className="text-lg font-display font-semibold text-white mb-8">Delivery Progress</h3>
                <div className="relative pt-2">
                  <div className="absolute top-7 left-[10%] right-[10%] h-0.5 bg-white/10" />
                  <div
                    className="absolute top-7 left-[10%] h-0.5 bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-1000"
                    style={{ width: parcel.status === 'Cancelled' ? '0%' : `${Math.max(0, (currentStageIdx / (STAGES.length - 1)) * 80)}%` }}
                  />
                  <div className="relative flex justify-between">
                    {STAGES.map((stage, idx) => {
                      const Icon = STAGE_ICONS[stage];
                      const done = idx <= currentStageIdx && parcel.status !== 'Cancelled';
                      const active = idx === currentStageIdx && parcel.status !== 'Cancelled';
                      return (
                        <div key={stage} className="flex flex-col items-center gap-3" style={{ width: `${100 / STAGES.length}%` }}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-500 border-2 ${
                            done ? 'bg-gradient-to-br from-indigo-500 to-violet-600 border-indigo-400 shadow-lg shadow-indigo-500/30' :
                            'bg-slate-800 border-white/10'
                          } ${active ? 'scale-110' : ''}`}>
                            <Icon className={`text-base ${done ? 'text-white' : 'text-slate-500'}`} />
                          </div>
                          <span className={`text-[10px] text-center font-bold uppercase tracking-wider ${done ? 'text-indigo-400' : 'text-slate-500'}`}>
                            {stage}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Security PIN */}
              <div className="card-glass bg-gradient-to-br from-indigo-500/10 to-violet-500/5">
                <div className="flex items-center gap-3 mb-4">
                  <FiShield className="text-indigo-400 text-xl" />
                  <h3 className="text-lg font-display font-semibold text-white">Security PIN</h3>
                </div>
                <p className="text-slate-400 text-sm mb-4">Provide this code to the agent to verify your delivery.</p>
                <div className="bg-slate-950/50 rounded-2xl p-4 text-center border border-indigo-500/20">
                  <span className="text-3xl font-mono font-bold tracking-[0.5em] text-white pl-[0.5em]">
                    {parcel.securityCode || '******'}
                  </span>
                </div>
              </div>

              {/* Logistics Partner */}
              {isLive && parcel.carrierId && (
                <div className="card-glass">
                  <h3 className="text-lg font-display font-semibold text-white mb-5">Logistics Partner</h3>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                      {parcel.carrierId.name[0]}
                    </div>
                    <div>
                      <div className="text-white font-medium">{parcel.carrierId.name}</div>
                      <div className="text-slate-400 text-xs">Official Partner</div>
                    </div>
                  </div>
                  <a href={`tel:${parcel.carrierId.phone}`} className="btn-premium w-full flex items-center justify-center gap-2 text-sm py-3">
                    <FiPhone /> Call Agent
                  </a>
                </div>
              )}

              {/* History */}
              <div className="card-glass">
                <h3 className="text-lg font-display font-semibold text-white mb-6">Tracking History</h3>
                <div className="relative space-y-0">
                  {[...parcel.trackingHistory].reverse().map((entry, i) => (
                    <div key={i} className="flex gap-4 pb-6 last:pb-0 relative">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${i === 0 ? 'bg-indigo-400' : 'bg-slate-600'}`} />
                        {i < parcel.trackingHistory.length - 1 && <div className="w-px flex-1 bg-white/10 mt-1" />}
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className={`font-semibold text-sm ${i === 0 ? 'text-white' : 'text-slate-400'}`}>{entry.status}</div>
                            {entry.description && <div className="text-slate-500 text-xs mt-0.5">{entry.description}</div>}
                            {entry.location && <div className="text-slate-500 text-xs mt-0.5 flex items-center gap-1"><FiMapPin className="text-xs" />{entry.location}</div>}
                          </div>
                          <div className="text-slate-500 text-[10px] flex-shrink-0">{format(new Date(entry.updatedAt), 'HH:mm')}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
