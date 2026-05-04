import React, { useEffect, useState } from 'react';
import { FiAlertTriangle, FiClock, FiSend } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../services/api';

const ISSUE_TYPES = ['Delivery Issue', 'Tracking Mismatch', 'Damaged Parcel', 'Missing Parcel', 'Payment Issue', 'Other'];
const STATUS_STYLES = {
  Open: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20',
  'In Review': 'bg-blue-500/15 text-blue-300 border border-blue-500/20',
  Resolved: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
};

export default function FeedbackPage() {
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    trackingId: '',
    issueType: 'Delivery Issue',
    subject: '',
    message: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/user/feedback');
      setFeedbackItems(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/user/feedback', form);
      setFeedbackItems((current) => [data, ...current]);
      setForm({
        trackingId: '',
        issueType: 'Delivery Issue',
        subject: '',
        message: ''
      });
      toast.success('Your message has been sent to the admin team');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-white mb-1">Support Messages</h1>
        <p className="text-slate-400">Send private account messages to admins and track replies from your dashboard.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-6">
        <div className="card-glass">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <FiAlertTriangle className="text-indigo-300 text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-display font-semibold text-white">Send Account Message</h3>
              <p className="text-slate-400 text-sm">This stays inside your account and admin accounts.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1.5">Tracking ID</label>
                <input className="input-dark font-mono uppercase" value={form.trackingId} onChange={(e) => setForm((current) => ({ ...current, trackingId: e.target.value.toUpperCase() }))} placeholder="TRK0000000000" />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1.5">Issue Type</label>
                <select className="input-dark" value={form.issueType} onChange={(e) => setForm((current) => ({ ...current, issueType: e.target.value }))}>
                  {ISSUE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-1.5">Subject</label>
              <input className="input-dark" value={form.subject} onChange={(e) => setForm((current) => ({ ...current, subject: e.target.value }))} placeholder="Parcel shows delivered but I have not received it" required />
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-1.5">Message</label>
              <textarea className="input-dark resize-none" rows={5} value={form.message} onChange={(e) => setForm((current) => ({ ...current, message: e.target.value }))} placeholder="Explain the issue in detail so the admin can investigate quickly." required />
            </div>

            <button type="submit" disabled={submitting} className="btn-premium flex items-center gap-2">
              {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSend />}
              Send to Admin
            </button>
          </form>
        </div>

        <div className="card-glass">
          <div className="flex items-center gap-3 mb-6">
            <FiClock className="text-indigo-300 text-lg" />
            <div>
              <h3 className="text-lg font-display font-semibold text-white">My Messages</h3>
              <p className="text-slate-400 text-sm">Only your account and admin accounts can see these messages.</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : feedbackItems.length === 0 ? (
            <p className="text-slate-400">No messages submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {feedbackItems.map((item) => (
                <div key={item._id} className="glass rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-white font-medium">{item.subject}</div>
                      <div className="text-slate-400 text-sm mt-1">{item.issueType}{item.trackingId ? ` - ${item.trackingId}` : ''}</div>
                    </div>
                    <span className={`text-xs font-medium rounded-full px-3 py-1 ${STATUS_STYLES[item.status] || STATUS_STYLES.Open}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mt-3">{item.message}</p>
                  {item.adminResponse && (
                    <div className="mt-4 rounded-xl bg-white/5 border border-white/10 p-3">
                      <div className="text-white text-sm font-medium">Admin Response</div>
                      <div className="text-slate-400 text-sm mt-1">{item.adminResponse}</div>
                    </div>
                  )}
                  <div className="text-slate-500 text-xs mt-3">
                    Sent {format(new Date(item.createdAt), 'MMM d, yyyy, h:mm a')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
