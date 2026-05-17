import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Search, Shield, ShieldOff, Trash2, X, Eye, Users, DollarSign } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceType, setBalanceType] = useState('credit');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', balance: '50000' });
  const [creating, setCreating] = useState(false);

  const fetchUsers = (page = 1) => {
    setLoading(true);
    api.get(`/admin/users?page=${page}&limit=10&search=${search}`)
      .then(res => { setUsers(res.data.data.users); setPagination(res.data.data.pagination); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [search]);

  // ★ ADMIN CREATES USER ACCOUNT (like a bank)
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password) return toast.error('All fields are required');
    setCreating(true);
    try {
      const res = await api.post('/admin/users', { ...form, balance: parseFloat(form.balance) || 50000 });
      toast.success(`Account created! A/C: ${res.data.data.user.accountNumber}`);
      setShowCreateForm(false);
      setForm({ name: '', email: '', phone: '', password: '', balance: '50000' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create account');
    } finally { setCreating(false); }
  };

  const handleToggleBlock = async (id) => {
    try {
      const res = await api.put(`/admin/users/${id}/block`);
      toast.success(res.data.message);
      fetchUsers();
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user permanently?')) return;
    try { await api.delete(`/admin/users/${id}`); toast.success('User deleted'); fetchUsers(); } catch { toast.error('Failed'); }
  };

  const handleUpdateBalance = async (e) => {
    e.preventDefault();
    if (!balanceAmount) return toast.error('Enter amount');
    try {
      await api.put(`/admin/users/${showBalanceModal}/balance`, { amount: parseFloat(balanceAmount), type: balanceType });
      toast.success(`Balance ${balanceType}ed successfully`);
      setShowBalanceModal(null); setBalanceAmount(''); fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-display font-bold">Manage Users</h1><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Create and manage bank accounts</p></div>
        <button onClick={() => setShowCreateForm(true)} className="gradient-btn flex items-center gap-2 text-sm !bg-gradient-to-r !from-red-500 !to-orange-600" style={{ boxShadow: '0 4px 14px rgba(239,68,68,0.35)' }}>
          <UserPlus className="w-4 h-4" />Create New Account
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <Search className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, account, phone..." className="bg-transparent border-none outline-none text-sm flex-1" style={{ color: 'var(--text-primary)' }} />
      </div>

      {/* Users List */}
      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
      ) : users.length === 0 ? (
        <div className="text-center py-16"><Users className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} /><p style={{ color: 'var(--text-muted)' }}>No users found</p></div>
      ) : (
        <div className="space-y-3">
          {users.map(u => (
            <motion.div key={u._id} layout className="glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${u.isBlocked ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}>{u.name[0]}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{u.name}</p>
                    {u.isBlocked && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 font-semibold">Blocked</span>}
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email} • {u.phone}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>A/C: {u.accountNumber} • Balance: ₹{u.balance?.toLocaleString('en-IN')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <button onClick={() => setShowBalanceModal(u._id)} className="p-2 rounded-lg hover:bg-emerald-500/10" title="Update Balance"><DollarSign className="w-4 h-4 text-emerald-500" /></button>
                <button onClick={() => handleToggleBlock(u._id)} className="p-2 rounded-lg hover:bg-amber-500/10" title={u.isBlocked ? 'Unblock' : 'Block'}>
                  {u.isBlocked ? <Shield className="w-4 h-4 text-emerald-500" /> : <ShieldOff className="w-4 h-4 text-amber-500" />}
                </button>
                <button onClick={() => handleDelete(u._id)} className="p-2 rounded-lg hover:bg-red-500/10" title="Delete"><Trash2 className="w-4 h-4 text-red-500" /></button>
              </div>
            </motion.div>
          ))}
          {/* Pagination */}
          <div className="flex justify-center gap-2 pt-2">
            {Array.from({ length: pagination.pages }, (_, i) => (
              <button key={i} onClick={() => fetchUsers(i + 1)} className={`w-8 h-8 rounded-lg text-sm font-medium ${pagination.page === i + 1 ? 'bg-indigo-500 text-white' : 'hover:bg-[var(--bg-tertiary)]'}`}>{i + 1}</button>
            ))}
          </div>
        </div>
      )}

      {/* ★ CREATE ACCOUNT MODAL */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateForm(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-lg rounded-2xl p-6" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2"><UserPlus className="w-5 h-5 text-red-500" />Create Bank Account</h2>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Create a new user account like a bank creates for customers</p>
                </div>
                <button onClick={() => setShowCreateForm(false)}><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full Name *</label>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Customer full name" required
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email *</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="customer@email.com" required
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Phone Number *</label>
                    <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="10-digit number" maxLength={10} required
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Initial Password *</label>
                    <input type="text" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Temporary password" required
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Initial Balance (₹)</label>
                  <input type="number" value={form.balance} onChange={e => setForm({ ...form, balance: e.target.value })} placeholder="50000"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                </div>
                <div className="p-3 rounded-xl text-xs" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--text-secondary)' }}>
                  <p>💡 An account number will be auto-generated. The customer can login with email & password and change their password on first login.</p>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowCreateForm(false)} className="flex-1 py-3 rounded-xl text-sm font-medium" style={{ border: '1px solid var(--border-color)' }}>Cancel</button>
                  <button type="submit" disabled={creating} className="gradient-btn flex-1 !py-3 !bg-gradient-to-r !from-red-500 !to-orange-600 flex items-center justify-center gap-2 disabled:opacity-50" style={{ boxShadow: '0 4px 14px rgba(239,68,68,0.35)' }}>
                    {creating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><UserPlus className="w-4 h-4" />Create Account</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Balance Modal */}
      <AnimatePresence>
        {showBalanceModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowBalanceModal(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="w-full max-w-sm rounded-2xl p-6" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }} onClick={e => e.stopPropagation()}>
              <h2 className="text-lg font-bold mb-4">Update Balance</h2>
              <form onSubmit={handleUpdateBalance} className="space-y-4">
                <div className="flex gap-3">
                  <button type="button" onClick={() => setBalanceType('credit')} className={`flex-1 py-3 rounded-xl text-sm font-semibold ${balanceType === 'credit' ? 'bg-emerald-500 text-white' : ''}`} style={balanceType !== 'credit' ? { border: '1px solid var(--border-color)' } : {}}>Credit</button>
                  <button type="button" onClick={() => setBalanceType('debit')} className={`flex-1 py-3 rounded-xl text-sm font-semibold ${balanceType === 'debit' ? 'bg-red-500 text-white' : ''}`} style={balanceType !== 'debit' ? { border: '1px solid var(--border-color)' } : {}}>Debit</button>
                </div>
                <input type="number" value={balanceAmount} onChange={e => setBalanceAmount(e.target.value)} placeholder="Amount" className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                <button type="submit" className="gradient-btn w-full !py-3">Update Balance</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
