import React, { useEffect, useState } from 'react';
import { FiRefreshCw, FiSend } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../services/api';

const FEEDBACK_STATUSES = ['Open', 'In Review', 'Resolved'];

export default function AdminFeedbackPage() {
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ status: 'Open', adminResponse: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/feedback');
      setFeedbackItems(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load user messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const startEditing = (item) => {
    setEditingId(item._id);
    setDraft({ status: item.status, adminResponse: item.adminResponse || '' });
  };

  const handleUpdate = async (id) => {
    try {
      await api.put(`/admin/feedback/${id}`, draft);
      toast.success('User message updated');
      setEditingId(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user message');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-white mb-1">User Messages</h1>
        <p className="text-slate-400">Review user account messages, reply privately, and notify users inside the app.</p>
      </div>

      <div className="card-glass">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : feedbackItems.length === 0 ? (
          <p className="text-slate-400">No user messages submitted yet.</p>
        ) : (
          <div className="space-y-4">
            {feedbackItems.map((item) => {
              const isEditing = editingId === item._id;
              return (
                <div key={item._id} className="glass rounded-xl p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div>
                      <div className="text-white font-medium">{item.subject}</div>
                      <div className="text-slate-400 text-sm mt-1">
                        {item.userName} - {item.userEmail}
                        {item.trackingId ? ` - ${item.trackingId}` : ''}
                      </div>
                      <div className="text-slate-500 text-xs mt-2">
                        {item.issueType} - {format(new Date(item.createdAt), 'MMM d, yyyy, h:mm a')}
                      </div>
                    </div>
                    <div className="text-xs text-violet-300 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1 self-start">
                      Account message
                    </div>
                  </div>

                  <div className="text-slate-300 text-sm mt-4">{item.message}</div>

                  {item.adminResponse && !isEditing && (
                    <div className="mt-4 rounded-xl bg-white/5 border border-white/10 p-3">
                      <div className="text-white text-sm font-medium">Current Admin Response</div>
                      <div className="text-slate-400 text-sm mt-1">{item.adminResponse}</div>
                    </div>
                  )}

                  {isEditing ? (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-slate-400 text-sm mb-1.5">Status</label>
                        <select className="input-dark" value={draft.status} onChange={(e) => setDraft((current) => ({ ...current, status: e.target.value }))}>
                          {FEEDBACK_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 text-sm mb-1.5">Admin Response</label>
                        <textarea className="input-dark resize-none" rows={4} value={draft.adminResponse} onChange={(e) => setDraft((current) => ({ ...current, adminResponse: e.target.value }))} placeholder="Share the investigation result or next step for the user." />
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => handleUpdate(item._id)} className="btn-premium flex items-center gap-2" type="button">
                          <FiSend /> Save Reply
                        </button>
                        <button onClick={() => setEditingId(null)} className="btn-ghost" type="button">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="text-slate-500 text-xs">
                        {item.respondedAt ? `Last updated ${format(new Date(item.respondedAt), 'MMM d, yyyy, h:mm a')} by ${item.respondedByName || 'admin'}` : 'No admin response yet'}
                      </div>
                      <button onClick={() => startEditing(item)} className="btn-ghost text-sm py-2 px-4 inline-flex items-center gap-2" type="button">
                        <FiRefreshCw /> Review / Respond
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
