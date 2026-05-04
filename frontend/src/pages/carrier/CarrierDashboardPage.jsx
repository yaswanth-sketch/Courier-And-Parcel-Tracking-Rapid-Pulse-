import React, { useEffect, useState } from 'react';
import { FiPackage, FiTruck, FiMapPin, FiCheckCircle, FiRefreshCw, FiNavigation } from 'react-icons/fi';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';

export default function CarrierDashboardPage() {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchAssigned = async () => {
    try {
      const { data } = await api.get('/carrier/assigned');
      setParcels(data);
    } catch (err) {
      toast.error('Failed to load assigned parcels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssigned();
    
    // Simulate periodic location updates to the server
    const interval = setInterval(() => {
      if (navigator.geolocation) {
        // In a real app, we'd use actual GPS. Here we simulate small movements.
        api.post('/carrier/update-location', {
          lat: 17.3850 + (Math.random() - 0.5) * 0.01,
          lng: 78.4867 + (Math.random() - 0.5) * 0.01
        }).catch(() => {});
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const [pinInput, setPinInput] = useState({});

  const updateStatus = async (parcelId, status) => {
    const code = pinInput[parcelId];
    if ((status === 'Picked Up' || status === 'Delivered') && !code) {
      return toast.error(`Please enter the ${status === 'Picked Up' ? 'Pickup' : 'Delivery'} PIN provided by the ${status === 'Picked Up' ? 'Sender' : 'Receiver'}`);
    }

    setUpdatingId(parcelId);
    try {
      await api.put(`/carrier/update-status/${parcelId}`, { status, code });
      toast.success(`Parcel marked as ${status}`);
      setPinInput(prev => ({ ...prev, [parcelId]: '' }));
      fetchAssigned();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Logistics Dashboard</h1>
          <p className="text-slate-400">Manage your assigned shipments and live location</p>
        </div>
        <div className="glass px-4 py-3 rounded-2xl flex items-center gap-3 border-indigo-500/20">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-emerald-400 text-sm font-bold uppercase tracking-wider">GPS Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {parcels.length === 0 ? (
          <div className="card-glass text-center py-20">
            <FiPackage className="text-6xl text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-display font-semibold text-white">No Assigned Parcels</h3>
            <p className="text-slate-500 mt-2">Wait for the admin to assign new shipments to you.</p>
          </div>
        ) : (
          parcels.map(parcel => (
            <div key={parcel._id} className="card-glass group">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl font-mono font-bold text-indigo-400">{parcel.trackingId}</span>
                    <StatusBadge status={parcel.status} />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center mt-1"><FiMapPin className="text-indigo-400 text-sm" /></div>
                        <div>
                          <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">From</div>
                          <div className="text-white text-sm font-medium">{parcel.senderAddress}</div>
                          <div className="text-slate-400 text-xs mt-1">{parcel.senderName} • {parcel.senderPhone}</div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mt-1"><FiCheckCircle className="text-emerald-400 text-sm" /></div>
                        <div>
                          <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">To (Destination)</div>
                          <div className="text-white text-sm font-medium">{parcel.receiverAddress}</div>
                          <div className="text-slate-400 text-xs mt-1">{parcel.receiverName} • {parcel.receiverPhone}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:w-64 flex flex-col gap-3 justify-center border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-6">
                  <div className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Update Status</div>
                  
                  {parcel.status === 'Booked' && (
                    <div className="space-y-2 mb-2">
                      <label className="text-slate-500 text-[10px] font-bold uppercase">Pickup PIN (from Sender)</label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Enter 6-digit PIN"
                        className="input-dark text-center font-mono tracking-[0.5em] text-lg py-2"
                        value={pinInput[parcel._id] || ''}
                        onChange={e => setPinInput({ ...pinInput, [parcel._id]: e.target.value })}
                      />
                      <button onClick={() => updateStatus(parcel._id, 'Picked Up')} disabled={updatingId === parcel._id}
                        className="btn-premium w-full flex items-center justify-center gap-2 py-3 text-sm">
                        <FiPackage /> Mark Picked Up
                      </button>
                    </div>
                  )}
                  
                  {(parcel.status === 'Picked Up' || parcel.status === 'In Transit') && (
                    <button onClick={() => updateStatus(parcel._id, 'Out for Delivery')} disabled={updatingId === parcel._id}
                      className="btn-premium w-full flex items-center justify-center gap-2 py-3 text-sm bg-gradient-to-r from-blue-600 to-indigo-600">
                      <FiNavigation /> Out for Delivery
                    </button>
                  )}
                  
                  {parcel.status === 'Out for Delivery' && (
                    <div className="space-y-2 mb-2">
                      <label className="text-slate-500 text-[10px] font-bold uppercase">Delivery PIN (from Receiver)</label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Enter 6-digit PIN"
                        className="input-dark text-center font-mono tracking-[0.5em] text-lg py-2"
                        value={pinInput[parcel._id] || ''}
                        onChange={e => setPinInput({ ...pinInput, [parcel._id]: e.target.value })}
                      />
                      <button onClick={() => updateStatus(parcel._id, 'Delivered')} disabled={updatingId === parcel._id}
                        className="btn-premium w-full flex items-center justify-center gap-2 py-3 text-sm bg-gradient-to-r from-emerald-600 to-teal-600">
                        <FiCheckCircle /> Confirm Delivery
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
