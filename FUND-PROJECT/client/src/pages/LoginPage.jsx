import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Eye, EyeOff, Landmark, LogIn, Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Left - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #6366f1)' }}>
        <div className="absolute inset-0 opacity-10" style={{ background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="text-center text-white z-10 p-12">
          <Landmark className="w-20 h-20 mx-auto mb-6 opacity-90" />
          <h2 className="text-4xl font-display font-bold mb-4">Fund Transfer System</h2>
          <p className="text-lg opacity-80 max-w-md">Secure, fast, and reliable digital banking platform for all your fund transfer needs.</p>
          <div className="mt-10 grid grid-cols-3 gap-6 max-w-sm mx-auto">
            {['NEFT', 'RTGS', 'IMPS'].map(m => (
              <div key={m} className="p-3 rounded-xl bg-white/10 backdrop-blur text-sm font-semibold">{m}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>Welcome Back</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Login to your bank account</p>
            </div>
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)]">
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500 pr-12"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                <input type="checkbox" className="w-4 h-4 rounded accent-indigo-500" /> Remember me
              </label>
              <Link to="/forgot-password" className="text-sm text-indigo-500 hover:underline font-medium">Forgot password?</Link>
            </div>
            <button type="submit" disabled={loading} className="gradient-btn w-full !py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><LogIn className="w-5 h-5" /> Sign In</>}
            </button>
          </form>

          <div className="mt-8 p-4 rounded-xl text-sm" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <p className="font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Demo Credentials:</p>
            <div className="space-y-1" style={{ color: 'var(--text-muted)' }}>
              <p><strong>Admin:</strong> admin@fundtransfer.com / Admin@123</p>
              <p><strong>User:</strong> rahul@example.com / User@123</p>
            </div>
          </div>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
            Don't have an account? <span className="text-indigo-500 font-medium">Contact your bank administrator</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
