import React, { useState } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiSave, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
  const [pwd, setPwd] = useState({ current: '', newPwd: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setPw = (k, v) => setPwd(p => ({ ...p, [k]: v }));

  const saveProfile = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const { data } = await api.put('/user/profile', form);
      updateUser(data); toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwd.newPwd !== pwd.confirm) return toast.error('New passwords do not match');
    if (pwd.newPwd.length < 6) return toast.error('Password must be 6+ characters');
    setChangingPwd(true);
    try {
      await api.put('/user/profile', { password: pwd.current, newPassword: pwd.newPwd });
      toast.success('Password changed!');
      setPwd({ current: '', newPwd: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setChangingPwd(false); }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-display font-bold text-white mb-1">Profile Settings</h1>
        <p className="text-slate-400">Manage your account information</p>
      </div>

      {/* Avatar card */}
      <div className="card-glass flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-display font-bold text-3xl flex-shrink-0 shadow-lg shadow-indigo-500/25">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-white">{user?.name}</h2>
          <p className="text-slate-400 text-sm">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${user?.role === 'admin' ? 'bg-violet-500/20 text-violet-300' : 'bg-indigo-500/20 text-indigo-300'}`}>
              <FiShield className="text-xs" />
              {user?.role === 'admin' ? 'Administrator' : 'User'}
            </span>
          </div>
        </div>
      </div>

      {/* Personal info */}
      <form onSubmit={saveProfile} className="card-glass space-y-5">
        <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
          <FiUser className="text-indigo-400" /> Personal Information
        </h3>
        <div>
          <label className="block text-slate-400 text-sm mb-1.5">Full Name</label>
          <div className="relative"><FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input className="input-dark pl-11" value={form.name} onChange={e => set('name', e.target.value)} /></div>
        </div>
        <div>
          <label className="block text-slate-400 text-sm mb-1.5">Email (cannot change)</label>
          <div className="relative"><FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input className="input-dark pl-11 opacity-50 cursor-not-allowed" value={user?.email} disabled /></div>
        </div>
        <div>
          <label className="block text-slate-400 text-sm mb-1.5">Phone Number</label>
          <div className="relative"><FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input className="input-dark pl-11" placeholder="Your phone" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
        </div>
        <div>
          <label className="block text-slate-400 text-sm mb-1.5">Address</label>
          <div className="relative"><FiMapPin className="absolute left-4 top-3.5 text-slate-500" />
            <textarea className="input-dark pl-11 resize-none" rows={2} placeholder="Your address" value={form.address} onChange={e => set('address', e.target.value)} /></div>
        </div>
        <button type="submit" disabled={saving} className="btn-premium flex items-center gap-2">
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSave />}
          Save Changes
        </button>
      </form>

      {/* Change password */}
      <form onSubmit={changePassword} className="card-glass space-y-5">
        <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
          <FiLock className="text-indigo-400" /> Change Password
        </h3>
        {[['current', 'Current Password'], ['newPwd', 'New Password'], ['confirm', 'Confirm New Password']].map(([k, label]) => (
          <div key={k}>
            <label className="block text-slate-400 text-sm mb-1.5">{label}</label>
            <div className="relative"><FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="password" className="input-dark pl-11" placeholder="••••••••" value={pwd[k]} onChange={e => setPw(k, e.target.value)} required /></div>
          </div>
        ))}
        <button type="submit" disabled={changingPwd} className="btn-ghost flex items-center gap-2">
          {changingPwd ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiLock />}
          Update Password
        </button>
      </form>
    </div>
  );
}
