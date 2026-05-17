import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, ArrowUpRight, ArrowDownRight, TrendingUp, Users, Send, Clock, Bell } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b'];
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/dashboard').then(res => { setData(res.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="skeleton h-10 w-64 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[1,2,3].map(i => <div key={i} className="skeleton h-36 rounded-2xl" />)}</div>
      <div className="skeleton h-72 rounded-2xl" />
    </div>
  );

  const greeting = new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening';
  const chartData = (data?.monthlySpending || []).map(d => ({ name: months[d._id.month - 1], amount: d.total, count: d.count }));
  const pieData = (data?.typeBreakdown || []).map(d => ({ name: d._id, value: d.total }));

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold">{greeting}, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Here's your banking overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-bl-[3rem]" />
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-3"><Wallet className="w-5 h-5 text-indigo-500" /></div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Current Balance</p>
          <p className="text-2xl font-display font-bold mt-1">₹{(data?.user?.balance || 0).toLocaleString('en-IN')}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>A/C: {user?.accountNumber}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mb-3"><ArrowUpRight className="w-5 h-5 text-red-500" /></div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Total Sent</p>
          <p className="text-2xl font-display font-bold mt-1">₹{(data?.totalTransferred || 0).toLocaleString('en-IN')}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3"><ArrowDownRight className="w-5 h-5 text-emerald-500" /></div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Total Received</p>
          <p className="text-2xl font-display font-bold mt-1 text-emerald-500">₹{(data?.totalReceived || 0).toLocaleString('en-IN')}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3"><Users className="w-5 h-5 text-amber-500" /></div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Beneficiaries</p>
          <p className="text-2xl font-display font-bold mt-1">{data?.beneficiaries?.length || 0}</p>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-5">
        <h3 className="font-bold mb-4">Quick Transfer</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[{ l: 'NEFT', c: 'from-indigo-500 to-blue-600' }, { l: 'RTGS', c: 'from-purple-500 to-violet-600' }, { l: 'IMPS', c: 'from-emerald-500 to-teal-600' }, { l: 'Mobile Pay', c: 'from-amber-500 to-orange-600' }].map(t => (
            <Link key={t.l} to="/transfer" className={`p-4 rounded-xl bg-gradient-to-br ${t.c} text-white text-center font-semibold text-sm hover:scale-105 transition-transform shadow-lg`}>
              <Send className="w-5 h-5 mx-auto mb-2" />{t.l}
            </Link>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-5">
          <h3 className="font-bold mb-4">Monthly Transfer Volume</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <defs><linearGradient id="grad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '12px' }} formatter={v => [`₹${v.toLocaleString()}`, 'Amount']} />
                <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} fill="url(#grad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-center py-16" style={{ color: 'var(--text-muted)' }}>No transfer data yet</p>}
        </div>

        <div className="glass-card p-5">
          <h3 className="font-bold mb-4">Transfer Types</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie><Tooltip formatter={v => `₹${v.toLocaleString()}`} /></PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-center py-16" style={{ color: 'var(--text-muted)' }}>No data</p>}
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {pieData.map((d, i) => <span key={i} className="flex items-center gap-1.5 text-xs"><span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />{d.name}</span>)}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">Recent Transactions</h3>
          <Link to="/transactions" className="text-sm text-indigo-500 hover:underline font-medium">View All</Link>
        </div>
        {(data?.recentTransactions || []).length > 0 ? (
          <div className="space-y-3">
            {data.recentTransactions.map(tx => (
              <div key={tx._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.direction === 'received' ? 'bg-emerald-500/10' : tx.status === 'completed' ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
                    {tx.direction === 'received' ? <ArrowDownRight className="w-5 h-5 text-emerald-500" /> : tx.status === 'completed' ? <ArrowUpRight className="w-5 h-5 text-red-500" /> : <Clock className="w-5 h-5 text-amber-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tx.direction === 'received' ? (tx.sender?.name || 'Unknown Sender') : tx.receiver?.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{tx.direction === 'received' ? '↓ Received' : '↑ Sent'} • {tx.type} • {new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${tx.direction === 'received' ? 'text-emerald-500' : ''}`}>{tx.direction === 'received' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium status-${tx.status}`}>{tx.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No transactions yet. Start your first transfer!</p>}
      </div>
    </div>
  );
}
