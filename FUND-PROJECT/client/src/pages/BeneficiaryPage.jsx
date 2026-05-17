import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Star, Edit3, Trash2, X, Users, Send } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function BeneficiaryPage() {
  const navigate = useNavigate();
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', bank: '', accountNumber: '', ifsc: '', mobile: '', nickname: '' });

  const fetchBeneficiaries = () => {
    api.get(`/beneficiaries?search=${search}`).then(res => { setBeneficiaries(res.data.data.beneficiaries); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchBeneficiaries(); }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/beneficiaries/${editing}`, form);
        toast.success('Beneficiary updated');
      } else {
        await api.post('/beneficiaries', form);
        toast.success('Beneficiary added');
      }
      setShowForm(false); setEditing(null); setForm({ name: '', bank: '', accountNumber: '', ifsc: '', mobile: '', nickname: '' });
      fetchBeneficiaries();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this beneficiary?')) return;
    try { await api.delete(`/beneficiaries/${id}`); toast.success('Deleted'); fetchBeneficiaries(); } catch { toast.error('Failed'); }
  };

  const handleFavorite = async (id) => {
    try { await api.put(`/beneficiaries/${id}/favorite`); fetchBeneficiaries(); } catch { toast.error('Failed'); }
  };

  const startEdit = (b) => { setForm({ name: b.name, bank: b.bank, accountNumber: b.accountNumber, ifsc: b.ifsc, mobile: b.mobile || '', nickname: b.nickname || '' }); setEditing(b._id); setShowForm(true); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-display font-bold">Beneficiaries</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', bank: '', accountNumber: '', ifsc: '', mobile: '', nickname: '' }); }} className="gradient-btn flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />Add Beneficiary
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <Search className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, bank, account..." className="bg-transparent border-none outline-none text-sm flex-1" style={{ color: 'var(--text-primary)' }} />
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
      ) : beneficiaries.length === 0 ? (
        <div className="text-center py-16"><Users className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} /><p className="text-lg font-medium" style={{ color: 'var(--text-muted)' }}>No beneficiaries yet</p></div>
      ) : (
        <div className="grid gap-3">
          {beneficiaries.map(b => (
            <motion.div key={b._id} layout className="glass-card p-4 flex items-center justify-between hover:scale-[1.01] transition-transform">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-indigo-500 font-bold text-lg">{b.name[0]}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{b.name}</p>
                    {b.nickname && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>{b.nickname}</span>}
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{b.bank} • {b.accountNumber}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>IFSC: {b.ifsc}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => navigate('/transfer', { state: { beneficiary: b } })} className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold flex items-center gap-1.5 hover:scale-105 transition-transform shadow-md" title="Pay this beneficiary"><Send className="w-3.5 h-3.5" />Pay</button>
                <button onClick={() => handleFavorite(b._id)} className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)]"><Star className={`w-4 h-4 ${b.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} style={!b.isFavorite ? { color: 'var(--text-muted)' } : {}} /></button>
                <button onClick={() => startEdit(b)} className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)]"><Edit3 className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /></button>
                <button onClick={() => handleDelete(b._id)} className="p-2 rounded-lg hover:bg-red-500/10"><Trash2 className="w-4 h-4 text-red-500" /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-auto" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">{editing ? 'Edit' : 'Add'} Beneficiary</h2>
                <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)]"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {[{ n: 'name', l: 'Full Name *', p: 'Enter name' }, { n: 'bank', l: 'Bank Name *', p: 'e.g. HDFC Bank' }, { n: 'accountNumber', l: 'Account Number *', p: 'Enter account number' }, { n: 'ifsc', l: 'IFSC Code *', p: 'e.g. HDFC0001234' }, { n: 'mobile', l: 'Mobile Number', p: '10-digit number' }, { n: 'nickname', l: 'Nickname', p: 'Optional alias' }].map(f => (
                  <div key={f.n}>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{f.l}</label>
                    <input name={f.n} value={form[f.n]} onChange={e => setForm({ ...form, [e.target.name]: e.target.value })} placeholder={f.p}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                  </div>
                ))}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl text-sm font-medium" style={{ border: '1px solid var(--border-color)' }}>Cancel</button>
                  <button type="submit" className="gradient-btn flex-1 !py-3">{editing ? 'Update' : 'Add'} Beneficiary</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
