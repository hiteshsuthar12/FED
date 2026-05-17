import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserCircle, Mail, Phone, CreditCard, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [showChangePass, setShowChangePass] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/users/profile', { name, phone });
      updateUser(res.data.data.user);
      toast.success('Profile updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error('Min 6 characters');
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed');
      setShowChangePass(false); setCurrentPassword(''); setNewPassword('');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-display font-bold">Profile</h1>

      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
            <CreditCard className="w-5 h-5 text-indigo-500" /><div><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Account</p><p className="text-sm font-semibold">{user?.accountNumber}</p></div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
            <Mail className="w-5 h-5 text-indigo-500" /><div><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Email</p><p className="text-sm font-semibold">{user?.email}</p></div>
          </div>
        </div>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
          </div>
          <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
          </div>
          <button type="submit" disabled={loading} className="gradient-btn !py-3 w-full disabled:opacity-50">{loading ? 'Saving...' : 'Update Profile'}</button>
        </form>
      </motion.div>

      {/* Change Password */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2"><KeyRound className="w-5 h-5" />Change Password</h3>
          <button onClick={() => setShowChangePass(!showChangePass)} className="text-sm text-indigo-500 font-medium">{showChangePass ? 'Cancel' : 'Change'}</button>
        </div>
        {showChangePass && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Current Password</label>
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
            </div>
            <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
            </div>
            <button type="submit" className="gradient-btn !py-3 w-full">Change Password</button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
