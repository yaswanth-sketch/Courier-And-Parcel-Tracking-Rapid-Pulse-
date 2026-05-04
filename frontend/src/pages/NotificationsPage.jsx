import React, { useEffect, useState } from 'react';
import { FiBell, FiCheck, FiPackage } from 'react-icons/fi';
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/user/notifications').then(r => { setNotifications(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await api.put('/user/notifications/read');
    setNotifications(n => n.map(x => ({ ...x, read: true })));
    toast.success('All marked as read');
  };

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-white mb-1 flex items-center gap-3">
            Notifications
            {unread > 0 && <span className="text-sm bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold">{unread}</span>}
          </h1>
          <p className="text-slate-400">Stay updated on your parcel activity</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="btn-ghost flex items-center gap-2 text-sm py-2 px-4">
            <FiCheck /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : notifications.length === 0 ? (
        <div className="card-glass text-center py-16">
          <FiBell className="text-5xl text-slate-600 mx-auto mb-4" />
          <p className="text-slate-300 font-medium">No notifications yet</p>
          <p className="text-slate-500 text-sm mt-1">We'll notify you when your parcel status changes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n, i) => (
            <div key={i} className={`card-glass flex items-start gap-4 transition-all ${!n.read ? 'border-indigo-500/20 bg-indigo-500/5' : ''}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${!n.read ? 'bg-indigo-500/20' : 'bg-white/5'}`}>
                <FiPackage className={!n.read ? 'text-indigo-400' : 'text-slate-500'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!n.read ? 'text-white font-medium' : 'text-slate-400'}`}>{n.message}</p>
                <p className="text-slate-500 text-xs mt-1">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
              </div>
              {!n.read && <div className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0 mt-2" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
