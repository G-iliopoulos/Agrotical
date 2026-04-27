import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { users } from '../data/mockData';
import { Sprout, Eye, EyeOff, Leaf, ChevronDown, X } from 'lucide-react';

const demoAccounts = [
  { id: 'admin1',  role: 'admin'      as const, label: 'Διαχειριστής', email: 'admin@agrotical.gr',   password: 'admin123',  icon: '⚙️',    desc: 'Πλήρης διαχείριση συστήματος',      color: '#7c3aed', bg: '#ede9fe', border: '#c4b5fd' },
  { id: 'farmer1', role: 'farmer'     as const, label: 'Αγρότης',      email: 'farmer1@agrotical.gr', password: 'farmer123', icon: '👨‍🌾', desc: 'Διαχείριση χωραφιών & εκτιμήσεις', color: '#2d6a4f', bg: '#d1fae5', border: '#6ee7b7' },
  { id: 'agro1',   role: 'agronomist' as const, label: 'Γεωπόνος',     email: 'agro1@agrotical.gr',   password: 'agro123',   icon: '🔬',    desc: 'Παρακολούθηση & συστάσεις',         color: '#0284c7', bg: '#dbeafe', border: '#93c5fd' },
];

export default function LoginPage() {
  const { login, loginAs } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRoles, setShowRoles] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowRoles(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const result = login(email, password);
      setLoading(false);
      if (result.success) {
        const user = users.find(u => u.email === email);
        redirectByRole(user?.role);
      } else {
        setError(result.message);
      }
    }, 600);
  };

  const handleRoleSelect = (acc: typeof demoAccounts[0]) => {
    setShowRoles(false);
    loginAs(acc.id);
    redirectByRole(acc.role);
  };

  const redirectByRole = (role?: string) => {
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'farmer') navigate('/farmer/dashboard');
    else if (role === 'agronomist') navigate('/agronomist/dashboard');
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 text-white overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 40%, #40916c 100%)' }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full opacity-10" style={{ background: 'white' }} />
          <div className="absolute top-20 -left-10 w-64 h-64 rounded-full opacity-5" style={{ background: 'white' }} />
          <div className="absolute top-1/2 left-1/3 opacity-5 text-[200px] select-none">🌾</div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Sprout className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-2xl text-white" style={{ fontWeight: 700, lineHeight: 1.2 }}>Agrotical</div>
              <p className="text-green-200 text-sm">Έξυπνη Αγροτική Διαχείριση</p>
            </div>
          </div>
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl text-white mb-4" style={{ fontWeight: 700, lineHeight: 1.2 }}>
                Οργανώστε την αγροτική σας χρονιά
              </h2>
              <p className="text-green-200 text-lg leading-relaxed">
                Καταχωρίστε τα χωράφια σας, εκτιμήστε παραγωγή και κέρδη, και λάβετε εξειδικευμένες συστάσεις από γεωπόνο.
              </p>
            </div>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-2 text-green-300 text-sm">
          <Leaf className="w-4 h-4" />
          <span>Agrotical © 2026 — Αγροτική Ψηφιακή Πλατφόρμα</span>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2d6a4f, #40916c)' }}>
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl" style={{ fontWeight: 700, color: '#1b4332' }}>Agrotical</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="mb-7">
              <h2 className="text-2xl mb-1" style={{ fontWeight: 700, color: '#1b4332' }}>Καλώς ήρθατε</h2>
              <p className="text-gray-500 text-sm">Συνδεθείτε στον λογαριασμό σας για να συνεχίσετε</p>
            </div>

            <div className="mb-6" ref={dropdownRef}>
              <div className="relative">
                <button type="button" onClick={() => setShowRoles(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-dashed text-sm transition-all hover:bg-gray-50"
                  style={{ borderColor: showRoles ? '#40916c' : '#d1d5db', color: showRoles ? '#2d6a4f' : '#6b7280', fontWeight: 500 }}>
                  <span className="flex items-center gap-2"><span className="text-base">🔑</span>Επιλογή Ρόλου</span>
                  <ChevronDown className="w-4 h-4 transition-transform" style={{ transform: showRoles ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </button>
                {showRoles && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-20">
                    <div className="px-4 py-2.5 border-b border-gray-50 flex items-center justify-between">
                      <span className="text-xs text-gray-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>Επιλέξτε ρόλο για είσοδο</span>
                      <button onClick={() => setShowRoles(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    </div>
                    <div className="p-2 space-y-1">
                      {demoAccounts.map(acc => (
                        <button key={acc.id} onClick={() => handleRoleSelect(acc)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all text-left group">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                            style={{ background: acc.bg, border: `1px solid ${acc.border}` }}>{acc.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm" style={{ fontWeight: 600, color: acc.color }}>{acc.label}</div>
                            <div className="text-xs text-gray-400 truncate">{acc.desc}</div>
                          </div>
                          <div className="w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                            style={{ background: acc.bg }}><span className="text-xs" style={{ color: acc.color }}>→</span></div>
                        </button>
                      ))}
                    </div>
                    <div className="px-4 py-2 border-t border-gray-50">
                      <p className="text-xs text-gray-400">Για δοκιμαστικούς σκοπούς — χωρίς εγγραφή</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="bg-white px-3 text-gray-400" style={{ fontWeight: 600 }}>Ή με στοιχεία λογαριασμού</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1.5" style={{ color: '#374151', fontWeight: 500 }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@agrotical.gr"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-green-400 text-sm transition-colors" required />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm" style={{ color: '#374151', fontWeight: 500 }}>Κωδικός</label>
                  <button type="button" className="text-xs" style={{ color: '#40916c', fontWeight: 500 }}>Ξεχάσατε τον κωδικό;</button>
                </div>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-green-400 text-sm transition-colors pr-10" required />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-white text-sm transition-all hover:shadow-lg hover:opacity-95 active:scale-95 disabled:opacity-60 mt-1"
                style={{ background: 'linear-gradient(135deg, #2d6a4f, #40916c)', fontWeight: 600 }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Σύνδεση...
                  </span>
                ) : 'Σύνδεση'}
              </button>
            </form>
          </div>
          <p className="text-center text-xs text-gray-400 mt-5">Agrotical v1.0 · Ελληνική Αγροτική Πλατφόρμα</p>
        </div>
      </div>
    </div>
  );
}
