import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Download, Eye, X, ChevronLeft, ChevronRight, History } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selected, setSelected] = useState(null);

  const fetchTransactions = (page = 1) => {
    setLoading(true);
    api.get(`/transactions?page=${page}&limit=10&search=${search}&status=${statusFilter}&type=${typeFilter}`)
      .then(res => { setTransactions(res.data.data.transactions); setPagination(res.data.data.pagination); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchTransactions(); }, [search, statusFilter, typeFilter]);

  const downloadReceipt = async (txId) => {
    try {
      const res = await api.get(`/transactions/${txId}/receipt`);
      const r = res.data.data.receipt;
      const doc = new jsPDF();
      doc.setFontSize(20); doc.text('Transaction Receipt', 60, 25);
      doc.setDrawColor(99, 102, 241); doc.line(20, 32, 190, 32);
      doc.setFontSize(11);
      const rows = [['Reference', r.reference], ['Type', r.type], ['Amount', `Rs. ${r.amount.toLocaleString()}`], ['Sender', r.sender.name], ['Sender A/C', r.sender.account], ['Receiver', r.receiver.name], ['Receiver A/C', r.receiver.accountNumber], ['Status', r.status.toUpperCase()], ['Date', new Date(r.date).toLocaleString()], ['Remarks', r.remarks || '-']];
      let y = 42;
      rows.forEach(([k, v]) => { doc.setFont(undefined, 'bold'); doc.text(k, 25, y); doc.setFont(undefined, 'normal'); doc.text(String(v), 80, y); y += 10; });
      doc.save(`Receipt_${r.reference}.pdf`);
      toast.success('Receipt downloaded');
    } catch { toast.error('Failed to download'); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Transaction History</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <Search className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by reference, name..." className="bg-transparent border-none outline-none text-sm flex-1" style={{ color: 'var(--text-primary)' }} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-3 rounded-xl text-sm outline-none cursor-pointer" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="flagged">Flagged</option>
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-4 py-3 rounded-xl text-sm outline-none cursor-pointer" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
          <option value="">All Types</option>
          <option value="NEFT">NEFT</option>
          <option value="RTGS">RTGS</option>
          <option value="IMPS">IMPS</option>
          <option value="MOBILE">Mobile</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-16"><History className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} /><p className="font-medium" style={{ color: 'var(--text-muted)' }}>No transactions found</p></div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  {['Date', 'Reference', 'Direction', 'Party', 'Type', 'Amount', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx._id} className="hover:bg-[var(--bg-tertiary)] transition-colors" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td className="px-4 py-3 text-xs">{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-mono text-xs">{tx.reference}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${tx.direction === 'received' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>{tx.direction === 'received' ? '↓ Received' : '↑ Sent'}</span></td>
                    <td className="px-4 py-3 text-sm">{tx.direction === 'received' ? (tx.sender?.name || 'Unknown') : tx.receiver?.name}</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 rounded-lg text-xs font-semibold" style={{ background: 'var(--bg-tertiary)' }}>{tx.type}</span></td>
                    <td className={`px-4 py-3 font-bold ${tx.direction === 'received' ? 'text-emerald-500' : ''}`}>{tx.direction === 'received' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold status-${tx.status}`}>{tx.status}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setSelected(tx)} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)]"><Eye className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /></button>
                        <button onClick={() => downloadReceipt(tx._id)} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)]"><Download className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid var(--border-color)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Showing {transactions.length} of {pagination.total}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => fetchTransactions(pagination.page - 1)} disabled={pagination.page <= 1} className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-sm font-medium">{pagination.page} / {pagination.pages}</span>
              <button onClick={() => fetchTransactions(pagination.page + 1)} disabled={pagination.page >= pagination.pages} className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="w-full max-w-md rounded-2xl p-6" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Transaction Details</h2>
                <button onClick={() => setSelected(null)}><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                {[['Reference', selected.reference], ['Direction', selected.direction === 'received' ? '↓ Received' : '↑ Sent'], ['Type', selected.type], ['Amount', `${selected.direction === 'received' ? '+' : '-'}₹${selected.amount.toLocaleString()}`], ['From', selected.sender?.name || 'You'], ['To', selected.receiver?.name], ['Account', selected.receiver?.accountNumber || 'N/A'], ['Bank', selected.receiver?.bank], ['Status', selected.status], ['Date', new Date(selected.createdAt).toLocaleString()], ['Remarks', selected.remarks || '-']].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{k}</span>
                    <span className="text-sm font-medium">{v}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => { downloadReceipt(selected._id); setSelected(null); }} className="gradient-btn w-full !py-3 mt-6 flex items-center justify-center gap-2"><Download className="w-4 h-4" />Download Receipt</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
