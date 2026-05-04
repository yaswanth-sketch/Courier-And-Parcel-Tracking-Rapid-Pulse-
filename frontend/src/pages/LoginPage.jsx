import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiPackage, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(form.email.trim())) return toast.error('Please use a valid Gmail address');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email: form.email, password: form.password });
      login(data, data.token);
      toast.success(`Welcome back, ${data.name}!`);
      if (data.role === 'admin') navigate('/admin');
      else if (data.role === 'carrier') navigate('/carrier');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="mx-auto grid min-h-screen max-w-full lg:grid-cols-[3fr_1.2fr]">
        <div className="relative hidden overflow-hidden lg:block">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(/login-bg.jpg)` }} />
          <div className="absolute inset-0 bg-slate-950/25" />
          <div className="relative z-10 flex h-full flex-col justify-between p-16 text-white">
            <div className="max-w-xl">
              <p className="text-sm uppercase tracking-[0.4em] text-indigo-400 font-bold mb-4">Rapid Pulse Global</p>
              <h1 className="text-6xl font-display font-bold leading-tight mb-6">Global Logistics for the <span className="gradient-text">modern era.</span></h1>
              <p className="text-slate-200 max-w-lg leading-relaxed">
                Connect your supply chain with real-time tracking across trains, trucks, ships, and last-mile partners.
              </p>
            </div>
            <div className="space-y-3 text-slate-300 text-sm">
              <p className="inline-flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />Realtime precision</p>
              <p className="inline-flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.8)]" />Military-grade security</p>
              <p className="inline-flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-teal-500 shadow-[0_0_10px_rgba(45,212,191,0.8)]" />Universal management</p>
            </div>
          </div>
        </div>

        <div className="flex items-stretch justify-start">
          <div className="w-full h-full rounded-[36px] border border-white/10 bg-white/10 p-10 backdrop-blur-3xl shadow-2xl shadow-slate-950/20">
            <div className="mb-8 text-center">
              <h2 className="text-4xl font-display font-bold text-white mb-2">Login</h2>
              <p className="text-slate-300">Access your account and manage your shipments.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    className="w-full rounded-2xl bg-white/[0.03] border border-white/10 py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-300"
                    placeholder="you@gmail.com"
                    pattern="^[a-zA-Z0-9._%+-]+@gmail\.com$"
                    title="Please use a valid Gmail address"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    className="w-full rounded-2xl bg-white/[0.03] border border-white/10 py-4 pl-12 pr-12 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-300"
                    placeholder="Password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPwd ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-sm">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded-lg accent-indigo-500 bg-slate-800 border border-white/10"
                    checked={form.remember}
                    onChange={e => setForm({ ...form, remember: e.target.checked })}
                  />
                  Remember me
                </label>
                <button type="button" className="text-indigo-400 text-sm hover:text-indigo-300 transition-colors font-medium">Forgot password?</button>
              </div>

              <button type="submit" disabled={loading} className="btn-premium w-full flex items-center justify-center gap-2 py-4 text-lg">
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Sign In <FiArrowRight /></>
                )}
              </button>
            </form>


            <p className="text-center text-slate-400 mt-8 text-sm">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">Create account</Link>
            </p>
            <p className="text-center text-slate-400 mt-4 text-sm">
              Just tracking a parcel?{' '}
              <Link to="/track-parcel" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">Track without login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

