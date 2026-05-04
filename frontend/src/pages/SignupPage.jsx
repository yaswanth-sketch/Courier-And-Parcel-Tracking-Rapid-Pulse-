import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const COLORS = ['#6366f1', '#10b981', '#8b5cf6', '#06b6d4', '#f43f5e', '#ec4899', '#94a3b8'];
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(form.email.trim())) return toast.error('Please use a valid Gmail address');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name: form.name, email: form.email, password: form.password });
      login(data, data.token);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 bg-mesh flex items-center justify-center p-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/8 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Rapid Pulse Logo" className="inline-block w-14 h-14 rounded-2xl shadow-lg mb-4" />
          <h2 className="text-4xl font-display font-bold text-white mb-2">Create Account</h2>
          <p className="text-slate-400">Join Rapid Pulse today</p>
        </div>

        <div className="card-glass">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  className="input-dark pl-11"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  className="input-dark pl-11"
                  placeholder="you@gmail.com"
                  pattern="^[a-zA-Z0-9._%+-]+@gmail\.com$"
                  title="Please use a valid Gmail address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input-dark pl-11 pr-11"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPwd ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  className="input-dark pl-11"
                  placeholder="Repeat password"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  required
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-premium w-full flex items-center justify-center gap-2 text-base mt-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create Account <FiArrowRight /></>}
            </button>
          </form>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
            Admin accounts can only be created by an existing admin from the admin dashboard.
          </div>

          <p className="text-center text-slate-400 mt-6 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
