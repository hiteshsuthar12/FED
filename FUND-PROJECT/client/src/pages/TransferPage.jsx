import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle, XCircle, Smartphone, ArrowLeftRight, Zap, Building2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';

const tabs = [
  { id: 'NEFT', label: 'NEFT', icon: ArrowLeftRight, color: 'from-indigo-500 to-blue-600' },
  { id: 'RTGS', label: 'RTGS', icon: Building2, color: 'from-purple-500 to-violet-600' },
  { id: 'IMPS', label: 'IMPS', icon: Zap, color: 'from-emerald-500 to-teal-600' },
  { id: 'MOBILE', label: 'Mobile Pay', icon: Smartphone, color: 'from-amber-500 to-orange-600' },
];

export default function TransferPage() {
  const { updateUser } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('NEFT');
  const [form, setForm] = useState({ accountNumber: '', ifsc: '', amount: '', remarks: '', receiverName: '', bank: '', mobile: '' });
  const [step, setStep] = useState('form'); // form, otp, result
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Pre-fill form when navigating from Beneficiary page "Pay" button
  useEffect(() => {
    const b = location.state?.beneficiary;
    if (b) {
      setForm({
        accountNumber: b.accountNumber || '',
        ifsc: b.ifsc || '',
        amount: '',
        remarks: '',
        receiverName: b.name || '',
        bank: b.bank || '',
        mobile: b.mobile || ''
      });
      setActiveTab('NEFT');
    }
  }, [location.state]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) return toast.error('Enter a valid amount');
    if (activeTab === 'MOBILE') {
      if (!form.mobile) return toast.error('Enter mobile number');
    } else {
      if (!form.accountNumber || !form.ifsc) return toast.error('Enter account number and IFSC');
    }

    setLoading(true);
    try {
      const endpoint = activeTab === 'MOBILE' ? '/transfer/mobile' : `/transfer/${activeTab.toLowerCase()}`;
      await api.post(endpoint, { ...form, amount: parseFloat(form.amount) });
      toast.success('OTP sent! Check server console.');
      setStep('otp');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transfer initiation failed');
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return toast.error('Enter 6-digit OTP');
    setLoading(true);
    try {
      const res = await api.post('/transfer/verify-otp', { otp });
      setResult(res.data.data);
      updateUser({ balance: res.data.data.newBalance });
      setStep('result');
      toast.success('Transfer successful!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP verification failed');
    } finally { setLoading(false); }
  };

  const downloadReceipt = () => {
    if (!result?.transaction) return;
    const tx = result.transaction;
    const doc = new jsPDF();
    doc.setFontSize(20); doc.text('Fund Transfer Receipt', 60, 25);
    doc.setFontSize(11); doc.setDrawColor(99, 102, 241); doc.line(20, 32, 190, 32);
    const rows = [['Reference', tx.reference], ['Type', tx.type], ['Amount', `Rs. ${tx.amount.toLocaleString()}`], ['Receiver', tx.receiver?.name], ['Account', tx.receiver?.accountNumber || 'N/A'], ['Bank', tx.receiver?.bank || 'N/A'], ['Status', tx.status?.toUpperCase()], ['Date', new Date(tx.createdAt).toLocaleString()], ['Remarks', tx.remarks || '-']];
    let y = 42;
    rows.forEach(([k, v]) => { doc.setFont(undefined, 'bold'); doc.text(k, 25, y); doc.setFont(undefined, 'normal'); doc.text(String(v), 80, y); y += 10; });
    doc.setFontSize(9); doc.text('This is a computer-generated receipt.', 60, y + 15);
    doc.save(`Receipt_${tx.reference}.pdf`);
    toast.success('Receipt downloaded!');
  };

  const resetForm = () => { setForm({ accountNumber: '', ifsc: '', amount: '', remarks: '', receiverName: '', bank: '', mobile: '' }); setOtp(''); setStep('form'); setResult(null); };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-display font-bold">Fund Transfer</h1>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); resetForm(); }}
            className={`p-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === tab.id ? `bg-gradient-to-r ${tab.color} text-white shadow-lg` : 'hover:bg-[var(--bg-tertiary)]'}`}
            style={activeTab !== tab.id ? { border: '1px solid var(--border-color)', color: 'var(--text-secondary)' } : {}}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 'form' && (
          <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
              <h2 className="text-lg font-bold">{activeTab} Transfer</h2>
              {activeTab !== 'MOBILE' ? (
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Receiver Name</label>
                      <input name="receiverName" value={form.receiverName} onChange={handleChange} placeholder="Full name" className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Bank Name</label>
                      <input name="bank" value={form.bank} onChange={handleChange} placeholder="e.g. HDFC Bank" className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Account Number *</label>
                      <input name="accountNumber" value={form.accountNumber} onChange={handleChange} placeholder="Enter account number" required className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>IFSC Code *</label>
                      <input name="ifsc" value={form.ifsc} onChange={handleChange} placeholder="e.g. HDFC0001234" required className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 uppercase" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Receiver Name</label>
                    <input name="receiverName" value={form.receiverName} onChange={handleChange} placeholder="Full name" className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Mobile Number *</label>
                    <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="10-digit number" maxLength={10} required className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                  </div>
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Amount (₹) *</label>
                  <input name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="Enter amount" required className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Remarks</label>
                  <input name="remarks" value={form.remarks} onChange={handleChange} placeholder="Optional" className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <button type="submit" disabled={loading} className="gradient-btn w-full !py-3.5 flex items-center justify-center gap-2 text-base disabled:opacity-50">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send className="w-5 h-5" />Proceed to Verify</>}
              </button>
            </form>
          </motion.div>
        )}

        {step === 'otp' && (
          <motion.div key="otp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <form onSubmit={handleVerifyOTP} className="glass-card p-6 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto"><Send className="w-8 h-8 text-indigo-500" /></div>
              <div>
                <h2 className="text-xl font-bold mb-2">Verify OTP</h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Enter the 6-digit OTP (check server console)</p>
              </div>
              <input value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} placeholder="000000"
                className="w-48 mx-auto block px-4 py-4 rounded-xl text-center text-2xl font-mono tracking-[0.5em] outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
              <div className="flex gap-3 justify-center">
                <button type="button" onClick={resetForm} className="px-6 py-3 rounded-xl text-sm font-medium" style={{ border: '1px solid var(--border-color)' }}>Cancel</button>
                <button type="submit" disabled={loading} className="gradient-btn !py-3 flex items-center gap-2 disabled:opacity-50">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Verify & Transfer'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {step === 'result' && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="glass-card p-8 text-center space-y-4">
              {result?.transaction?.status === 'failed' ? (
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto"><XCircle className="w-10 h-10 text-red-500" /></div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto"><CheckCircle className="w-10 h-10 text-emerald-500" /></div>
              )}
              <h2 className="text-2xl font-display font-bold">Transfer {result?.transaction?.status === 'completed' ? 'Successful' : 'Initiated'}!</h2>
              <p className="text-3xl font-bold gradient-text">₹{result?.transaction?.amount?.toLocaleString('en-IN')}</p>
              <div className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                <p>To: {result?.transaction?.receiver?.name}</p>
                <p>Ref: {result?.transaction?.reference}</p>
                <p>Type: {result?.transaction?.type}</p>
              </div>
              <div className="flex gap-3 justify-center pt-4">
                <button onClick={downloadReceipt} className="px-6 py-3 rounded-xl text-sm font-semibold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors">Download Receipt</button>
                <button onClick={resetForm} className="gradient-btn !py-3">New Transfer</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
