import { Sun, Moon, Bell, Menu, Search, X, Check, CheckCheck, ArrowDownRight, ArrowUpRight, AlertTriangle, Info, Trash2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const iconMap = {
  transfer: ArrowUpRight,
  alert: AlertTriangle,
  system: Info,
  welcome: Info,
};

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function Navbar({ onMenuClick }) {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropRef = useRef(null);

  const fetchNotifications = () => {
    setLoading(true);
    api.get('/notifications')
      .then(res => {
        setNotifications(res.data.data.notifications);
        setUnread(res.data.data.unreadCount);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30s for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleToggle = () => {
    if (!open) fetchNotifications();
    setOpen(!open);
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnread(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnread(0);
    } catch {}
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-6 shrink-0" style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="flex items-center gap-3">
        <button className="lg:hidden p-2 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors" onClick={onMenuClick}>
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <Search className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm w-48" style={{ color: 'var(--text-primary)' }} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors" title="Toggle theme">
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
        </button>

        {/* Notification Bell + Popup */}
        <div className="relative" ref={dropRef}>
          <button onClick={handleToggle} className={`p-2.5 rounded-xl transition-colors relative ${open ? 'bg-[var(--bg-tertiary)]' : 'hover:bg-[var(--bg-tertiary)]'}`}>
            <Bell className={`w-5 h-5 ${open ? 'text-indigo-500' : ''}`} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">{unread > 9 ? '9+' : unread}</span>
            )}
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-14 w-[380px] max-h-[480px] rounded-2xl shadow-2xl overflow-hidden z-50"
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base">Notifications</h3>
                    {unread > 0 && <span className="px-2 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-bold">{unread}</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    {unread > 0 && (
                      <button onClick={markAllRead} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors" title="Mark all as read">
                        <CheckCheck className="w-4 h-4 text-indigo-500" />
                      </button>
                    )}
                    <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors">
                      <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    </button>
                  </div>
                </div>

                {/* Notification List */}
                <div className="overflow-y-auto max-h-[380px] scrollbar-thin">
                  {loading ? (
                    <div className="p-5 space-y-3">
                      {[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-10 text-center">
                      <Bell className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                      <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>No notifications yet</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>You'll see transfer alerts and updates here</p>
                    </div>
                  ) : (
                    notifications.map((n, idx) => {
                      const Icon = iconMap[n.type] || Info;
                      const isReceived = n.title?.toLowerCase().includes('received');
                      const iconColor = isReceived ? 'text-emerald-500' : n.type === 'alert' ? 'text-amber-500' : 'text-indigo-500';
                      const iconBg = isReceived ? 'bg-emerald-500/10' : n.type === 'alert' ? 'bg-amber-500/10' : 'bg-indigo-500/10';

                      return (
                        <motion.div
                          key={n._id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          onClick={() => !n.isRead && markAsRead(n._id)}
                          className={`flex items-start gap-3 px-5 py-3.5 cursor-pointer transition-colors hover:bg-[var(--bg-tertiary)] ${!n.isRead ? '' : 'opacity-60'}`}
                          style={{ borderBottom: '1px solid var(--border-color)' }}
                        >
                          <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                            {isReceived ? <ArrowDownRight className={`w-4 h-4 ${iconColor}`} /> : <Icon className={`w-4 h-4 ${iconColor}`} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`text-sm ${!n.isRead ? 'font-semibold' : 'font-medium'}`}>{n.title}</p>
                              {!n.isRead && <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />}
                            </div>
                            <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{n.message}</p>
                            <p className="text-[10px] mt-1 font-medium" style={{ color: 'var(--text-muted)' }}>{timeAgo(n.createdAt)}</p>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="px-5 py-3 text-center" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <button onClick={markAllRead} className="text-xs text-indigo-500 font-semibold hover:underline">
                      Mark all as read
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm ml-1">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
      </div>
    </header>
  );
}
