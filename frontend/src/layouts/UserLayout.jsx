import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { FiPackage, FiHome, FiPlusCircle, FiSearch, FiClock, FiUser, FiBell, FiLogOut, FiMenu, FiX, FiChevronRight, FiMessageSquare } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
  { to: '/book', icon: FiPlusCircle, label: 'Book Parcel' },
  { to: '/track', icon: FiSearch, label: 'Track Parcel' },
  { to: '/history', icon: FiClock, label: 'Shipment History' },
  { to: '/notifications', icon: FiBell, label: 'Notifications' },
  { to: '/feedback', icon: FiMessageSquare, label: 'Support Messages' },
  { to: '/profile', icon: FiUser, label: 'Profile' },
];

const SidebarContent = ({ user, logout, setSidebarOpen }) => {
  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/8">
        <img src="/logo.png" alt="Rapid Pulse Logo" className="w-9 h-9 rounded-xl flex-shrink-0" />
        <div>
          <div className="text-white font-display font-bold text-base leading-none">Rapid Pulse</div>
          <div className="text-slate-500 text-xs mt-0.5">Premium Courier Services</div>
        </div>
      </div>

      {/* User badge */}
      <div className="mx-4 mt-4 p-3 glass rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-white text-sm font-semibold truncate">{user?.name}</div>
            <div className="text-slate-400 text-xs truncate">{user?.email}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 mt-4 space-y-1">
        <div className="text-slate-600 text-xs font-semibold uppercase tracking-wider px-4 mb-2">Menu</div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Icon className="text-lg flex-shrink-0" />
            <span className="flex-1">{label}</span>
            <FiChevronRight className="text-xs opacity-0 group-hover:opacity-100" />
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/8">
        <button onClick={handleLogout}
          className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <FiLogOut className="text-lg" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default function UserLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="relative flex h-screen overflow-hidden bg-slate-950 scrollbar-gutter-stable">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(/remaining.png)` }} />
      <div className="absolute inset-0 bg-slate-950/45" />

      <div className="relative z-10 flex h-full w-full bg-slate-900/10 bg-mesh overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col bg-gradient-to-b from-slate-900 to-slate-800 border-r border-white/8 flex-shrink-0">
          <SidebarContent user={user} logout={logout} setSidebarOpen={setSidebarOpen} />
        </aside>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <aside className="relative w-72 bg-slate-900 border-r border-white/10 flex flex-col z-10">
              <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1">
                <FiX className="text-xl" />
              </button>
              <SidebarContent user={user} logout={logout} setSidebarOpen={setSidebarOpen} />
            </aside>
          </div>
        )}

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <header className="flex items-center justify-between px-6 py-4 border-b border-white/8 bg-slate-900/60 backdrop-blur-sm flex-shrink-0">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white p-1">
              <FiMenu className="text-xl" />
            </button>
            <div className="hidden lg:block" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-white text-sm font-medium">{user?.name}</div>
                <div className="text-slate-500 text-xs capitalize">Account Holder</div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-6 min-h-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
