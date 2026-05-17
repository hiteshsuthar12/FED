import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Shield, ArrowLeftRight, Smartphone, Zap, Lock, Users, ChevronRight, Sun, Moon, Landmark, Star, HelpCircle, ChevronDown, Mail, Phone, MapPin } from 'lucide-react';
import { useState } from 'react';

const features = [
  { icon: ArrowLeftRight, title: 'NEFT / RTGS / IMPS', desc: 'Multiple transfer modes for every need' },
  { icon: Smartphone, title: 'Mobile Pay', desc: 'Send money using just a mobile number' },
  { icon: Zap, title: 'Instant Transfers', desc: 'IMPS transfers processed in seconds' },
  { icon: Lock, title: 'OTP Secured', desc: 'Every transaction verified with OTP' },
  { icon: Shield, title: 'Bank-Grade Security', desc: 'JWT authentication & encrypted data' },
  { icon: Users, title: 'Beneficiary Management', desc: 'Save and manage your frequent payees' },
];

const faqs = [
  { q: 'How do I create an account?', a: 'Accounts are created by the bank administrator. Visit your nearest branch or contact support to open an account.' },
  { q: 'What are the transfer limits?', a: 'NEFT: up to ₹10L, RTGS: ₹2L - ₹1Cr, IMPS: up to ₹5L, Mobile Pay: up to ₹1L per transaction.' },
  { q: 'How long do transfers take?', a: 'IMPS is instant, NEFT settles in 2 hours, and RTGS is processed in real-time during banking hours.' },
  { q: 'Is my money safe?', a: 'Absolutely. We use bank-grade encryption, JWT tokens, OTP verification, and real-time fraud detection.' },
];

export default function LandingPage() {
  const { theme, toggleTheme, isDark } = useTheme();
  const [openFaq, setOpenFaq] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg" style={{ background: isDark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.85)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"><Landmark className="w-5 h-5 text-white" /></div>
            <span className="font-display font-bold text-xl gradient-text">FundTransfer</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium hover:text-indigo-500 transition-colors" style={{ color: 'var(--text-secondary)' }}>Features</a>
            <a href="#security" className="text-sm font-medium hover:text-indigo-500 transition-colors" style={{ color: 'var(--text-secondary)' }}>Security</a>
            <a href="#faq" className="text-sm font-medium hover:text-indigo-500 transition-colors" style={{ color: 'var(--text-secondary)' }}>FAQ</a>
            <a href="#contact" className="text-sm font-medium hover:text-indigo-500 transition-colors" style={{ color: 'var(--text-secondary)' }}>Contact</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)]">{isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}</button>
            <Link to="/login" className="gradient-btn text-sm !py-2 !px-5">Login</Link>
            <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden px-4 pb-4 space-y-2" style={{ borderTop: '1px solid var(--border-color)' }}>
            <a href="#features" className="block py-2 text-sm" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#security" className="block py-2 text-sm" onClick={() => setMenuOpen(false)}>Security</a>
            <a href="#faq" className="block py-2 text-sm" onClick={() => setMenuOpen(false)}>FAQ</a>
            <a href="#contact" className="block py-2 text-sm" onClick={() => setMenuOpen(false)}>Contact</a>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(99,102,241,0.15), transparent 70%), radial-gradient(ellipse at 70% 50%, rgba(139,92,246,0.1), transparent 70%)' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <Shield className="w-4 h-4 text-indigo-500" /> Bank-Grade Security
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold mb-6 leading-tight">
              Modern Banking<br /><span className="gradient-text">Made Simple</span>
            </h1>
            <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10" style={{ color: 'var(--text-secondary)' }}>
              Transfer funds securely via NEFT, RTGS, IMPS or Mobile Pay. Experience banking designed for the digital age.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login" className="gradient-btn text-base !py-3.5 !px-8 inline-flex items-center justify-center gap-2">Get Started <ChevronRight className="w-5 h-5" /></Link>
              <a href="#features" className="px-8 py-3.5 rounded-xl text-base font-semibold transition-all hover:scale-105" style={{ border: '2px solid var(--border-color)', color: 'var(--text-primary)' }}>Learn More</a>
            </div>
          </motion.div>
          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto">
            {[{ n: '50K+', l: 'Users' }, { n: '₹100Cr+', l: 'Transferred' }, { n: '99.9%', l: 'Uptime' }, { n: '4.8★', l: 'Rating' }].map((s, i) => (
              <div key={i} className="glass-card p-6 text-center">
                <div className="text-2xl sm:text-3xl font-display font-bold gradient-text">{s.n}</div>
                <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{s.l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">Powerful <span className="gradient-text">Features</span></h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>Everything you need for seamless digital banking</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass-card p-6 hover:scale-[1.02] transition-transform cursor-default group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-indigo-500" />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="glass-card p-8 lg:p-12" style={{ background: isDark ? 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))' : 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(139,92,246,0.05))' }}>
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-display font-bold mb-6">Bank-Grade <span className="gradient-text">Security</span></h2>
                <div className="space-y-4">
                  {['256-bit AES Encryption', 'JWT Token Authentication', 'OTP Verification for Transfers', 'Real-time Fraud Detection', 'Rate Limiting & DDoS Protection'].map((s, i) => (
                    <div key={i} className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center"><Shield className="w-3.5 h-3.5 text-emerald-500" /></div><span className="text-sm font-medium">{s}</span></div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center">
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center"><Lock className="w-20 h-20 text-indigo-500/60" /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">Frequently Asked <span className="gradient-text">Questions</span></h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="glass-card overflow-hidden">
                <button className="w-full flex items-center justify-between p-5 text-left font-medium" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="flex items-center gap-3"><HelpCircle className="w-5 h-5 text-indigo-500 shrink-0" />{f.q}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} />
                </button>
                {openFaq === i && <div className="px-5 pb-5 text-sm" style={{ color: 'var(--text-secondary)' }}>{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">Get In <span className="gradient-text">Touch</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[{ icon: Mail, t: 'Email', d: 'support@fundtransfer.com' }, { icon: Phone, t: 'Phone', d: '+91 1800-FTS-HELP' }, { icon: MapPin, t: 'Address', d: 'Mumbai, India' }].map((c, i) => (
              <div key={i} className="glass-card p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-3"><c.icon className="w-6 h-6 text-indigo-500" /></div>
                <h3 className="font-bold mb-1">{c.t}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2"><Landmark className="w-5 h-5 text-indigo-500" /><span className="font-display font-bold gradient-text">FundTransfer</span></div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>© 2024 Fund Transfer System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
