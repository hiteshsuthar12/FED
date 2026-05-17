import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, KeyRound } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !otp || !newPassword) return toast.error('All fields required');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      toast.success('Password reset! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-indigo-500 mb-8 hover:underline"><ArrowLeft className="w-4 h-4" />Back to Login</Link>
        <h1 className="text-3xl font-display font-bold mb-2">Reset Password</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Enter the OTP and your new password</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>OTP Code</label>
            <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter 6-digit OTP" maxLength={6}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 tracking-widest text-center text-lg font-mono"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
          </div>
          <button type="submit" disabled={loading} className="gradient-btn w-full !py-3 flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><KeyRound className="w-5 h-5" />Reset Password</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
