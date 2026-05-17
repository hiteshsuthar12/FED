import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, XCircle, AlertTriangle, ChevronLeft, ChevronRight, History } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchTransactions = (page = 1) => {
    setLoading(true);
    api.get(`/admin/transactions?page=${page}&limit=15&search=${search}&status=${statusFilter}&type=${typeFilter}`)
      .then(res => { setTransactions(res.data.data.transactions); setPagination(res.data.data.pagination); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchTransactions(); }, [search, statusFilter, typeFilter]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/admin/transactions/${id}/status`, { status });
      toast.success(`Transaction ${status}`);
      fetchTransactions(pagination.page);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-display font-bold">Transaction Monitoring</h1><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Review and manage all transactions</p></div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <Search className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reference, receiver..." className="bg-transparent border-none outline-none text-sm flex-1" style={{ color: 'var(--text-primary)' }} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-3 rounded-xl text-sm outline-none cursor-pointer" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
          <option value="">All Status</option><option value="completed">Completed</option><option value="pending">Pending</option><option value="failed">Failed</option><option value="flagged">Flagged</option>
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-4 py-3 rounded-xl text-sm outline-none cursor-pointer" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
          <option value="">All Types</option><option value="NEFT">NEFT</option><option value="RTGS">RTGS</option><option value="IMPS">IMPS</option><option value="MOBILE">Mobile</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-16"><History className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} /><p style={{ color: 'var(--text-muted)' }}>No transactions found</p></div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  {['Date', 'Reference', 'Sender', 'Receiver', 'Type', 'Amount', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx._id} className="hover:bg-[var(--bg-tertiary)] transition-colors" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-mono text-xs">{tx.reference}</td>
                    <td className="px-4 py-3 text-xs">{tx.sender?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-xs">{tx.receiver?.name}</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 rounded-lg text-xs font-semibold" style={{ background: 'var(--bg-tertiary)' }}>{tx.type}</span></td>
                    <td className="px-4 py-3 font-bold">₹{tx.amount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold status-${tx.status}`}>{tx.status}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {(tx.status === 'pending' || tx.status === 'flagged') && (
                          <>
                            <button onClick={() => handleStatusUpdate(tx._id, 'completed')} className="p-1.5 rounded-lg hover:bg-emerald-500/10" title="Approve"><CheckCircle className="w-4 h-4 text-emerald-500" /></button>
                            <button onClick={() => handleStatusUpdate(tx._id, 'failed')} className="p-1.5 rounded-lg hover:bg-red-500/10" title="Reject"><XCircle className="w-4 h-4 text-red-500" /></button>
                          </>
                        )}
                        {tx.status === 'completed' && (
                          <button onClick={() => handleStatusUpdate(tx._id, 'flagged')} className="p-1.5 rounded-lg hover:bg-amber-500/10" title="Flag"><AlertTriangle className="w-4 h-4 text-amber-500" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid var(--border-color)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{pagination.total} total transactions</p>
            <div className="flex items-center gap-2">
              <button onClick={() => fetchTransactions(pagination.page - 1)} disabled={pagination.page <= 1} className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-sm font-medium">{pagination.page}/{pagination.pages}</span>
              <button onClick={() => fetchTransactions(pagination.page + 1)} disabled={pagination.page >= pagination.pages} className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
