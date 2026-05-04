import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { FiPackage, FiHome, FiList, FiBarChart2, FiRefreshCw, FiLogOut, FiMenu, FiX, FiUsers, FiMessageSquare } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const adminNav = [
  { to: '/admin', icon: FiHome, label: 'Control Center', end: true },
  { to: '/admin/admins', icon: FiUsers, label: 'Admin Management' },
  { to: '/admin/feedback', icon: FiMessageSquare, label: 'User Messages' },
  { to: '/admin/parcels', icon: FiList, label: 'Logistics Hub' },
  { to: '/admin/analytics', icon: FiBarChart2, label: 'Operations Analytics' },
  { to: '/admin/update-status', icon: FiRefreshCw, label: 'Update Transport Status' },
];

const SidebarContent = ({ user, logout, setSidebarOpen }) => {
  const handleLogout = () => { logout(); toast.success('Logged out'); };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/8">
        <img src="/logo.png" alt="Rapid Pulse Logo" className="w-9 h-9 rounded-xl flex-shrink-0 shadow-lg shadow-purple-500/25" />
        <div>
          <div className="text-white font-display font-bold text-base">Admin Panel</div>
          <div className="text-purple-400 text-xs">Rapid Pulse</div>
        </div>
      </div>

      <div className="mx-4 mt-4 p-3 glass rounded-xl border-purple-500/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="text-white text-sm font-semibold">{user?.name}</div>
            <div className="text-purple-400 text-xs">Administrator</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 mt-3 space-y-1">
        {adminNav.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end} onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `sidebar-link ${isActive ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/10 text-violet-300 border border-violet-500/20' : ''}`}>
            <Icon className="text-lg" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/8">
        <NavLink to="/dashboard" className="sidebar-link text-slate-400 mb-2 block">
          <FiPackage className="text-lg" />
          <span>User View</span>
        </NavLink>
        <button onClick={handleLogout} className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <FiLogOut className="text-lg" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="relative flex h-screen overflow-hidden bg-slate-950 scrollbar-gutter-stable">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(/remaining.png)` }} />
      <div className="absolute inset-0 bg-slate-950/45" />
      <div className="relative z-10 flex h-full w-full overflow-hidden">
        <aside className="hidden lg:flex w-64 flex-col bg-gradient-to-b from-slate-900 to-slate-800 border-r border-white/8 flex-shrink-0">
          <SidebarContent user={user} logout={logout} setSidebarOpen={setSidebarOpen} />
        </aside>

        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <aside className="relative w-72 bg-slate-900 border-r border-white/10 flex flex-col z-10">
              <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"><FiX className="text-xl" /></button>
              <SidebarContent user={user} logout={logout} setSidebarOpen={setSidebarOpen} />
            </aside>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="flex items-center justify-between px-6 py-4 border-b border-white/8 bg-slate-900/60 backdrop-blur-sm">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white"><FiMenu className="text-xl" /></button>
            <div className="hidden lg:flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-violet-500/20 border border-violet-500/30 rounded-full px-3 py-1 text-violet-300 text-xs font-medium">
                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" /> Admin Mode
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-6 min-h-0"><Outlet /></main>
        </div>
      </div>
    </div>
  );
}
