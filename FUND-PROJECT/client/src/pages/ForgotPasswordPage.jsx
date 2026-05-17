import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Enter your email');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('OTP sent! Check server console for OTP.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-indigo-500 mb-8 hover:underline"><ArrowLeft className="w-4 h-4" />Back to Login</Link>
        <h1 className="text-3xl font-display font-bold mb-2">Forgot Password</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Enter your email to receive a reset OTP</p>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
            </div>
            <button type="submit" disabled={loading} className="gradient-btn w-full !py-3 flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Mail className="w-5 h-5" />Send OTP</>}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4"><Mail className="w-8 h-8 text-emerald-500" /></div>
            <p className="mb-4">OTP sent to <strong>{email}</strong></p>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Check the server console for the OTP code</p>
            <Link to="/reset-password" state={{ email }} className="gradient-btn inline-block">Continue to Reset</Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
