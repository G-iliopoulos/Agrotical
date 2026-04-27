import React, { useState } from 'react';
import { users as allUsers, User, UserRole } from '../../data/mockData';
import { Search, Plus, Edit2, Trash2, X, Save, CheckCircle2, UserCheck, MapPin, Phone, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const roleConfig: Record<UserRole, { label: string; color: string; bg: string; icon: string }> = {
  admin:      { label: 'Διαχειριστής', color: '#7c3aed', bg: '#ede9fe', icon: '⚙️' },
  farmer:     { label: 'Αγρότης',      color: '#2d6a4f', bg: '#d1fae5', icon: '👨‍🌾' },
  agronomist: { label: 'Γεωπόνος',     color: '#0284c7', bg: '#dbeafe', icon: '🔬' },
};

const emptyUser = {
  name: '', email: '', password: 'temp123', role: 'farmer' as UserRole,
  phone: '', location: '', joinDate: new Date().toISOString().split('T')[0], active: true,
};

export default function AdminUsers() {
  const [localUsers, setLocalUsers]             = useState<User[]>(allUsers);
  const [search, setSearch]                     = useState('');
  const [filterRole, setFilterRole]             = useState('all');
  const [showModal, setShowModal]               = useState(false);
  const [editingUser, setEditingUser]           = useState<User | null>(null);
  const [form, setForm]                         = useState(emptyUser);
  const [confirmPassword, setConfirmPassword]   = useState('');
  const [deleteConfirm, setDeleteConfirm]       = useState<string | null>(null);
  const [deactivateConfirm, setDeactivateConfirm] = useState<string | null>(null);

  // Form errors
  const [emailError, setEmailError]       = useState('');
  const [passwordError, setPasswordError] = useState('');

  const filtered = localUsers.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const openAdd = () => {
    setEditingUser(null); setForm(emptyUser); setConfirmPassword('');
    setEmailError(''); setPasswordError(''); setShowModal(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    const { id, ...rest } = user;
    setForm({ ...emptyUser, ...rest }); setConfirmPassword(rest.password);
    setEmailError(''); setPasswordError(''); setShowModal(true);
  };

  const validateForm = (): boolean => {
    let valid = true;

    // Duplicate email check (UC4 Alt Flow 3)
    const duplicate = localUsers.find(u =>
      u.email.toLowerCase() === form.email.toLowerCase() &&
      (!editingUser || u.id !== editingUser.id)
    );
    if (duplicate) { setEmailError('Το email χρησιμοποιείται ήδη από άλλον χρήστη'); valid = false; }
    else setEmailError('');

    // Password match check (UC4 Alt Flow 2) - only for new users
    if (!editingUser && form.password !== confirmPassword) {
      setPasswordError('Οι κωδικοί δεν ταιριάζουν'); valid = false;
    } else setPasswordError('');

    return valid;
  };

  const handleSave = () => {
    if (!form.name || !form.email) return;
    if (!validateForm()) return;

    if (editingUser) {
      setLocalUsers(prev => prev.map(u => u.id === editingUser.id ? { ...editingUser, ...form } : u));
      toast.success('Τα στοιχεία του χρήστη ενημερώθηκαν επιτυχώς');
    } else {
      const newUser: User = { id: `user_${Date.now()}`, ...form };
      setLocalUsers(prev => [...prev, newUser]);
      toast.success(`Ο χρήστης ${form.name} δημιουργήθηκε επιτυχώς`);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setLocalUsers(prev => prev.filter(u => u.id !== id));
    setDeleteConfirm(null);
    toast.success('Ο χρήστης διαγράφηκε');
  };

  // UC5 Alt Flow 1: Show confirmation when deactivating
  const handleToggleActiveRequest = (user: User) => {
    if (user.active) {
      // Going from active to inactive → show confirmation
      setDeactivateConfirm(user.id);
    } else {
      // Re-activating → direct
      setLocalUsers(prev => prev.map(u => u.id === user.id ? { ...u, active: true } : u));
      toast.success(`Ο χρήστης ${user.name} ενεργοποιήθηκε`);
    }
  };

  const confirmDeactivate = (id: string) => {
    const user = localUsers.find(u => u.id === id);
    setLocalUsers(prev => prev.map(u => u.id === id ? { ...u, active: false } : u));
    setDeactivateConfirm(null);
    toast.warning(`Ο χρήστης ${user?.name} απενεργοποιήθηκε`);
  };

  const counts = {
    all:        localUsers.length,
    admin:      localUsers.filter(u => u.role === 'admin').length,
    farmer:     localUsers.filter(u => u.role === 'farmer').length,
    agronomist: localUsers.filter(u => u.role === 'agronomist').length,
  };

  const passwordsMatch = editingUser ? true : form.password === confirmPassword;
  const canSubmit = !!form.name && !!form.email && passwordsMatch;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl" style={{ fontWeight: 700, color: '#111827' }}>Διαχείριση Χρηστών</h1>
          <p className="text-sm text-gray-500 mt-1">{localUsers.length} συνολικά · {localUsers.filter(u => u.active).length} ενεργοί</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm"
          style={{ background: 'linear-gradient(135deg, #3b0764, #7c3aed)', fontWeight: 600 }}>
          <Plus className="w-4 h-4" /> Νέος Χρήστης
        </button>
      </div>

      {/* Role Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[{ key: 'all', label: 'Όλοι' }, { key: 'farmer', label: '👨‍🌾 Αγρότες' }, { key: 'agronomist', label: '🔬 Γεωπόνοι' }, { key: 'admin', label: '⚙️ Admins' }].map(r => (
          <button key={r.key} onClick={() => setFilterRole(r.key)}
            className={`px-4 py-2 rounded-xl text-sm transition-colors ${filterRole === r.key ? 'text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
            style={filterRole === r.key ? { background: '#7c3aed', fontWeight: 600 } : { fontWeight: 500 }}>
            {r.label} <span className="ml-1 opacity-70">({counts[r.key as keyof typeof counts] ?? 0})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Αναζήτηση χρήστη..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none text-sm" />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Χρήστης', 'Ρόλος', 'Τοποθεσία', 'Τηλέφωνο', 'Εγγραφή', 'Κατάσταση', 'Ενέργειες'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 whitespace-nowrap" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(user => {
                const rc = roleConfig[user.role];
                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0" style={{ background: rc.bg }}>
                          {rc.icon}
                        </div>
                        <div>
                          <div className="text-sm" style={{ fontWeight: 600, color: '#111827' }}>{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full" style={{ background: rc.bg, color: rc.color, fontWeight: 600 }}>{rc.label}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{user.location}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{user.phone}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(user.joinDate).toLocaleDateString('el-GR')}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggleActiveRequest(user)}
                        className={`text-xs px-2 py-1 rounded-full transition-colors ${user.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                        style={{ fontWeight: 600 }}>
                        {user.active ? '● Ενεργός' : '○ Ανενεργός'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(user)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteConfirm(user.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Δεν βρέθηκαν χρήστες με αυτά τα κριτήρια</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg" style={{ fontWeight: 700 }}>{editingUser ? 'Επεξεργασία Χρήστη' : 'Νέος Χρήστης'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Ονοματεπώνυμο *</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm" placeholder="π.χ. Γιώργης Κωστόπουλος" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Email *</label>
                  <input type="email" value={form.email}
                    onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setEmailError(''); }}
                    className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none text-sm ${emailError ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    placeholder="user@agrotical.gr" />
                  {emailError && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {emailError}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Ρόλος</label>
                  <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as UserRole }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm">
                    <option value="farmer">👨‍🌾 Αγρότης</option>
                    <option value="agronomist">🔬 Γεωπόνος</option>
                    <option value="admin">⚙️ Διαχειριστής</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Τηλέφωνο</label>
                  <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm" placeholder="69xxxxxxxx" />
                </div>

                {/* Password fields — UC4 Steps 5 & 6 */}
                <div>
                  <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>
                    {editingUser ? 'Κωδικός' : 'Κωδικός *'}
                  </label>
                  <input type="password" value={form.password}
                    onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setPasswordError(''); }}
                    className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none text-sm ${passwordError ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    placeholder="••••••••" />
                </div>
                {!editingUser && (
                  <div>
                    <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Επιβεβαίωση Κωδικού *</label>
                    <input type="password" value={confirmPassword}
                      onChange={e => { setConfirmPassword(e.target.value); setPasswordError(''); }}
                      className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none text-sm ${passwordError ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                      placeholder="••••••••" />
                    {passwordError && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1 col-span-2">
                        <AlertTriangle className="w-3 h-3" /> {passwordError}
                      </p>
                    )}
                  </div>
                )}

                <div className={editingUser ? '' : 'col-span-2'}>
                  <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Τοποθεσία</label>
                  <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm" placeholder="π.χ. Λάρισα" />
                </div>
                <div className="col-span-2 flex items-center gap-3">
                  <label className="text-sm" style={{ fontWeight: 500 }}>Ενεργός Λογαριασμός</label>
                  <button onClick={() => setForm(p => ({ ...p, active: !p.active }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${form.active ? '' : 'bg-gray-200'}`}
                    style={{ background: form.active ? '#40916c' : undefined }}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm" style={{ fontWeight: 500 }}>Ακύρωση</button>
              <button onClick={handleSave} disabled={!canSubmit}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #3b0764, #7c3aed)', fontWeight: 600 }}>
                <Save className="w-4 h-4" /> {editingUser ? 'Αποθήκευση' : 'Δημιουργία'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation — UC5 Alt Flow 1 */}
      {deactivateConfirm && (() => {
        const user = localUsers.find(u => u.id === deactivateConfirm);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setDeactivateConfirm(null)} />
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="text-lg mb-2" style={{ fontWeight: 700 }}>Απενεργοποίηση Χρήστη;</h3>
              <p className="text-sm text-gray-500 mb-2">Είστε σίγουροι ότι θέλετε να απενεργοποιήσετε τον χρήστη <strong>{user?.name}</strong>;</p>
              <p className="text-xs text-gray-400 mb-6">Ο χρήστης δεν θα μπορεί να συνδεθεί στην εφαρμογή.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeactivateConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm" style={{ fontWeight: 500 }}>Άκυρο</button>
                <button onClick={() => confirmDeactivate(deactivateConfirm)} className="flex-1 py-2.5 rounded-xl bg-amber-600 text-white text-sm" style={{ fontWeight: 600 }}>Απενεργοποίηση</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-lg mb-2" style={{ fontWeight: 700 }}>Διαγραφή Χρήστη;</h3>
            <p className="text-sm text-gray-500 mb-6">Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm" style={{ fontWeight: 500 }}>Ακύρωση</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm" style={{ fontWeight: 600 }}>Διαγραφή</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
