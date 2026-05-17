import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, History, LogOut, Menu, X, Shield, Landmark } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const adminNavItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/users', label: 'Manage Users', icon: Users },
  { path: '/admin/transactions', label: 'Transactions', icon: History },
];

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <AnimatePresence>
        {sidebarOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      </AnimatePresence>

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 flex flex-col`}
        style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border-color)' }}>
        <div className="h-16 flex items-center gap-3 px-6" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg" style={{ background: 'linear-gradient(135deg,#ef4444,#f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Admin Panel</span>
          <button className="lg:hidden ml-auto" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {adminNavItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-gradient-to-r from-red-500/10 to-orange-500/10' : 'hover:bg-[var(--bg-tertiary)]'}`}
                style={{ color: isActive ? '#ef4444' : 'var(--text-secondary)' }}>
                <item.icon className="w-5 h-5" />{item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 space-y-2" style={{ borderTop: '1px solid var(--border-color)' }}>
          <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[var(--bg-tertiary)] transition-colors" style={{ color: 'var(--text-secondary)' }}>
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}{isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors">
            <LogOut className="w-4 h-4" />Logout
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center px-4 lg:px-6 shrink-0" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <button className="lg:hidden p-2 rounded-xl hover:bg-[var(--bg-tertiary)]" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></button>
          <h1 className="text-lg font-bold ml-2">Admin Panel</h1>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>{children}</motion.div>
        </main>
      </div>
    </div>
  );
}
