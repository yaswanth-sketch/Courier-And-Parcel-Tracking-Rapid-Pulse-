import React, { useEffect, useState } from 'react';
import { FiShield, FiUserPlus, FiClock, FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function AdminManagementPage() {
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const setAdminField = (key, value) => setAdminForm((current) => ({ ...current, [key]: value }));

  const loadData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/admins');
      setAdmins(data.admins);
      setAuditLogs(data.auditLogs);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(adminForm.email.trim())) return toast.error('Admin email must be a valid Gmail address');
    setCreatingAdmin(true);
    try {
      await api.post('/admin/create-admin', adminForm);
      toast.success('New admin account created');
      setAdminForm({ name: '', email: '', password: '', phone: '', address: '' });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create admin');
    } finally {
      setCreatingAdmin(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-white mb-1">Admin Management</h1>
        <p className="text-slate-400">Create new admin accounts and review recent admin creation history.</p>
      </div>

      <div className="card-glass">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <FiUserPlus className="text-violet-300 text-lg" />
          </div>
          <div>
            <h3 className="text-lg font-display font-semibold text-white">Create Another Admin</h3>
            <p className="text-slate-400 text-sm">This action is available only to signed-in admins.</p>
          </div>
        </div>

        <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">Full Name</label>
            <input className="input-dark" value={adminForm.name} onChange={(e) => setAdminField('name', e.target.value)} required />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">Email</label>
            <input type="email" className="input-dark" placeholder="admin@gmail.com" pattern="^[a-zA-Z0-9._%+-]+@gmail\.com$" title="Please use a valid Gmail address" value={adminForm.email} onChange={(e) => setAdminField('email', e.target.value)} required />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">Temporary Password</label>
            <input type="password" minLength={6} className="input-dark" value={adminForm.password} onChange={(e) => setAdminField('password', e.target.value)} required />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">Phone</label>
            <div className="relative">
              <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input className="input-dark pl-11" value={adminForm.phone} onChange={(e) => setAdminField('phone', e.target.value)} />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-slate-400 text-sm mb-1.5">Address</label>
            <div className="relative">
              <FiMapPin className="absolute left-4 top-3.5 text-slate-500" />
              <textarea className="input-dark pl-11 resize-none" rows={3} value={adminForm.address} onChange={(e) => setAdminField('address', e.target.value)} />
            </div>
          </div>
          <div className="md:col-span-2">
            <button type="submit" disabled={creatingAdmin} className="btn-premium flex items-center gap-2">
              {creatingAdmin ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiShield />}
              Create Admin Account
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card-glass">
          <div className="flex items-center gap-3 mb-6">
            <FiShield className="text-violet-300 text-lg" />
            <h3 className="text-lg font-display font-semibold text-white">Current Admins</h3>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : admins.length === 0 ? (
            <p className="text-slate-400">No admin accounts found.</p>
          ) : (
            <div className="space-y-3">
              {admins.map((admin) => (
                <div key={admin._id} className="glass rounded-xl p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-white font-medium">{admin.name}</div>
                      <div className="text-slate-400 text-sm flex items-center gap-1.5 mt-1">
                        <FiMail className="text-xs" />
                        {admin.email}
                      </div>
                    </div>
                    <div className="text-xs text-violet-300 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1">
                      Admin
                    </div>
                  </div>
                  <div className="text-slate-500 text-xs mt-3">
                    Created {format(new Date(admin.createdAt), 'MMM d, yyyy')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-glass">
          <div className="flex items-center gap-3 mb-6">
            <FiClock className="text-violet-300 text-lg" />
            <h3 className="text-lg font-display font-semibold text-white">Recent Admin Creation History</h3>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : auditLogs.length === 0 ? (
            <p className="text-slate-400">No admin creation history yet.</p>
          ) : (
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log._id} className="glass rounded-xl p-4">
                  <div className="text-white text-sm font-medium">{log.targetName || 'Admin'} account created</div>
                  <div className="text-slate-400 text-sm mt-1">
                    {log.actorName || 'An admin'} created {log.targetEmail}
                  </div>
                  <div className="text-slate-500 text-xs mt-3">
                    {format(new Date(log.createdAt), 'MMM d, yyyy, h:mm a')}
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
