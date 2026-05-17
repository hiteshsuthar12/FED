import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, ArrowLeftRight, TrendingUp, AlertTriangle, DollarSign, UserPlus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b'];
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics').then(res => { setData(res.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-6">{[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}</div>;

  const chartData = (data?.monthlyData || []).map(d => ({ name: months[d._id.month - 1], transactions: d.count, volume: d.volume }));
  const pieData = (data?.typeBreakdown || []).map(d => ({ name: d._id, value: d.count }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-display font-bold">Admin Dashboard</h1><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>System overview and analytics</p></div>
        <Link to="/admin/users" className="gradient-btn flex items-center gap-2 text-sm !bg-gradient-to-r !from-red-500 !to-orange-600" style={{ boxShadow: '0 4px 14px rgba(239,68,68,0.35)' }}>
          <UserPlus className="w-4 h-4" />Create Account
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: data?.users?.total || 0, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'Total Transactions', value: data?.transactions?.total || 0, icon: ArrowLeftRight, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Total Volume', value: `₹${((data?.transactions?.totalVolume || 0) / 100000).toFixed(1)}L`, icon: DollarSign, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Flagged', value: data?.transactions?.flagged || 0, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-5">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            <p className="text-2xl font-display font-bold mt-1">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Sub-stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { l: 'Active Users', v: data?.users?.active, c: 'text-emerald-500' },
          { l: 'Blocked Users', v: data?.users?.blocked, c: 'text-red-500' },
          { l: 'Pending Txns', v: data?.transactions?.pending, c: 'text-amber-500' },
          { l: 'Completed Txns', v: data?.transactions?.completed, c: 'text-emerald-500' },
        ].map((s, i) => (
          <div key={i} className="glass-card p-4 text-center">
            <p className={`text-xl font-bold ${s.c}`}>{s.v}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-5">
          <h3 className="font-bold mb-4">Monthly Transactions</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px' }} />
                <Bar dataKey="transactions" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center py-16 text-sm" style={{ color: 'var(--text-muted)' }}>No data</p>}
        </div>
        <div className="glass-card p-5">
          <h3 className="font-bold mb-4">Transfer Types</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie><Tooltip /></PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-2 justify-center">
                {pieData.map((d, i) => <span key={i} className="flex items-center gap-1.5 text-xs"><span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />{d.name} ({d.value})</span>)}
              </div>
            </>
          ) : <p className="text-center py-16 text-sm" style={{ color: 'var(--text-muted)' }}>No data</p>}
        </div>
      </div>
    </div>
  );
}
