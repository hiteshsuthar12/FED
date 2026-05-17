import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, ArrowLeftRight, Users, History, UserCircle, LogOut, Menu, X, Landmark } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Navbar from './Navbar';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/transfer', label: 'Fund Transfer', icon: ArrowLeftRight },
  { path: '/beneficiaries', label: 'Beneficiaries', icon: Users },
  { path: '/transactions', label: 'Transactions', icon: History },
  { path: '/profile', label: 'Profile', icon: UserCircle },
];

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 flex flex-col`}
        style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border-color)' }}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Landmark className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg gradient-text">FundTransfer</span>
          <button className="lg:hidden ml-auto" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-500' : 'hover:bg-[var(--bg-tertiary)]'}`}
                style={{ color: isActive ? '#6366f1' : 'var(--text-secondary)' }}>
                <item.icon className="w-5 h-5" />
                {item.label}
                {isActive && <motion.div layoutId="activeTab" className="absolute left-0 w-1 h-8 bg-indigo-500 rounded-r-full" />}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-4" style={{ borderTop: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.accountNumber}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
