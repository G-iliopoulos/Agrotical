import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { recommendations as allRecs, Recommendation, users, fields, getUserById } from '../../data/mockData';
import { Plus, Send, X, CheckCircle2, Clock, Save, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const typeLabels: Record<string, string> = {
  fertilizer: '🌱 Λίπανση', pesticide: '🧪 Φυτοπροστασία', irrigation: '💧 Άρδευση',
  harvest: '🌾 Συγκομιδή', disease: '🔬 Ασθένεια', general: '📋 Γενική',
};
const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  low:    { label: 'Χαμηλή',  color: '#6b7280', bg: '#f3f4f6' },
  medium: { label: 'Μέτρια',  color: '#2563eb', bg: '#dbeafe' },
  high:   { label: 'Υψηλή',   color: '#d97706', bg: '#fef3c7' },
  urgent: { label: 'Επείγον', color: '#dc2626', bg: '#fee2e2' },
};
const statusConfig: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Εκκρεμεί',      color: '#2563eb' },
  read:      { label: 'Αναγνώσθηκε',   color: '#7c3aed' },
  applied:   { label: 'Εφαρμόστηκε',   color: '#059669' },
  dismissed: { label: 'Απορρίφθηκε',   color: '#dc2626' },
};

export default function AgronomistRecommendations() {
  const { currentUser } = useAuth();
  const [localRecs, setLocalRecs] = useState<Recommendation[]>(
    currentUser ? allRecs.filter(r => r.agronomistId === currentUser.id) : []
  );
  const [showModal, setShowModal]               = useState(false);
  const [sent, setSent]                         = useState(false);
  const [filter, setFilter]                     = useState('all');
  const [showUrgentWarning, setShowUrgentWarning] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const myFarmerIds = (currentUser as any)?.assignedFarmers ?? [];
  const myFarmers   = users.filter(u => myFarmerIds.includes(u.id));
  const myFields    = fields.filter(f => myFarmerIds.includes(f.farmerId));

  const [form, setForm] = useState({
    title: '', content: '', type: 'general' as Recommendation['type'],
    priority: 'medium' as Recommendation['priority'],
    farmerId: myFarmers[0]?.id ?? '',
    fieldId: '',
  });

  if (!currentUser) return null;

  const filtered = localRecs.filter(r =>
    filter === 'all' || r.status === filter || r.type === filter || r.priority === filter
  );

  // UC19 Alt Flow 2: Warn when urgent priority selected
  const handlePriorityChange = (priority: string) => {
    if (priority === 'urgent' && form.priority !== 'urgent') {
      setShowUrgentWarning(true);
    }
    setForm(p => ({ ...p, priority: priority as Recommendation['priority'] }));
  };

  // UC19 Alt Flow 3: Show confirmation if form has content
  const handleCancelRequest = () => {
    const hasContent = form.title || form.content || form.fieldId;
    if (hasContent) {
      setShowCancelConfirm(true);
    } else {
      closeModal();
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setShowUrgentWarning(false);
    setShowCancelConfirm(false);
    setSent(false);
    setForm({ title: '', content: '', type: 'general', priority: 'medium', farmerId: myFarmers[0]?.id ?? '', fieldId: '' });
  };

  const handleSend = () => {
    if (!form.title || !form.content || !form.farmerId) return;

    // UC19 Alt Flow 4: Check if farmer is assigned to this agronomist
    if (!myFarmerIds.includes(form.farmerId)) {
      toast.error('Δεν μπορείτε να δημιουργήσετε σύσταση για αυτόν τον αγρότη');
      return;
    }

    const newRec: Recommendation = {
      id: `rec_${Date.now()}`,
      agronomistId: currentUser.id,
      farmerId:     form.farmerId,
      fieldId:      form.fieldId || undefined,
      title:        form.title,
      content:      form.content,
      date:         new Date().toISOString().split('T')[0],
      status:       'pending',
      priority:     form.priority,
      type:         form.type,
    };
    setLocalRecs(prev => [newRec, ...prev]);
    setSent(true);

    // UC19 Step 10: toast — urgent vs normal
    if (form.priority === 'urgent') {
      toast.error('🚨 Επείγουσα σύσταση στάλθηκε στον αγρότη - ειδοποίηση υψηλής προτεραιότητας');
    } else {
      toast.success(`Η σύσταση "${form.title}" εστάλη επιτυχώς`);
    }

    setTimeout(() => { closeModal(); }, 1200);
  };

  const stats = {
    total:   localRecs.length,
    pending: localRecs.filter(r => r.status === 'pending').length,
    applied: localRecs.filter(r => r.status === 'applied').length,
    urgent:  localRecs.filter(r => r.priority === 'urgent').length,
  };

  return (
    <div className="p-6 space-y-5">

      {/* Header + New button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl" style={{ fontWeight: 700, color: '#111827' }}>Συστάσεις</h1>
          <p className="text-sm text-gray-500 mt-1">{stats.total} συνολικά · {stats.pending} εκκρεμείς</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm"
          style={{ background: 'linear-gradient(135deg, #0c4a6e, #0284c7)', fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" /> Νέα Σύσταση
        </button>
      </div>

      {/* 4 stat tiles */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Συνολικές',    value: stats.total,   c: '#7c3aed', bg: '#ede9fe' },
          { label: 'Εκκρεμείς',   value: stats.pending, c: '#2563eb', bg: '#dbeafe' },
          { label: 'Εφαρμόστηκαν', value: stats.applied, c: '#059669', bg: '#d1fae5' },
          { label: 'Επείγουσες',  value: stats.urgent,  c: '#dc2626', bg: '#fee2e2' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-3 border border-gray-100 text-center">
            <div className="text-2xl" style={{ fontWeight: 700, color: s.c }}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter pill bar */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all',        label: 'Όλες' },
          { key: 'pending',    label: '🔵 Εκκρεμείς' },
          { key: 'applied',    label: '✅ Εφαρμοσμένες' },
          { key: 'urgent',     label: '🔴 Επείγουσες' },
          { key: 'fertilizer', label: '🌱 Λίπανση' },
          { key: 'pesticide',  label: '🧪 Φυτοπροστασία' },
          { key: 'irrigation', label: '💧 Άρδευση' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${filter === f.key ? 'text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
            style={filter === f.key ? { background: '#0c4a6e', fontWeight: 600 } : { fontWeight: 500 }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Recommendations list */}
      <div className="space-y-3">
        {filtered.map(rec => {
          const pc     = priorityConfig[rec.priority];
          const sc     = statusConfig[rec.status];
          const farmer = getUserById(rec.farmerId);
          const field  = rec.fieldId ? fields.find(f => f.id === rec.fieldId) : null;
          return (
            <div key={rec.id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="text-sm" style={{ fontWeight: 600, color: '#111827' }}>{rec.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: pc.bg, color: pc.color, fontWeight: 600 }}>{pc.label}</span>
                    <span className="text-xs text-gray-500">{typeLabels[rec.type]}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{rec.content}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 flex-wrap">
                    <span>👨‍🌾 {farmer?.name}</span>
                    {field && <span>📍 {field.name}</span>}
                    <span>📅 {new Date(rec.date).toLocaleDateString('el-GR')}</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs px-2 py-1 rounded-full whitespace-nowrap" style={{
                    background: rec.status === 'applied' ? '#d1fae5' : rec.status === 'dismissed' ? '#fee2e2' : rec.status === 'read' ? '#ede9fe' : '#dbeafe',
                    color: sc.color,
                    fontWeight: 600,
                  }}>
                    {sc.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Send className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Δεν βρέθηκαν συστάσεις με αυτά τα κριτήρια</p>
          </div>
        )}
      </div>

      {/* ── Send Modal ─────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCancelRequest} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg" style={{ fontWeight: 700 }}>Νέα Σύσταση</h2>
              <button onClick={handleCancelRequest} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">

              {/* UC19 Alt Flow 2: Urgent warning banner */}
              {showUrgentWarning && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-red-800" style={{ fontWeight: 600 }}>Ειδοποίηση Επείγουσας Σύστασης</p>
                    <p className="text-xs text-red-700 mt-0.5">Η σύσταση θα αποσταλεί με ειδοποίηση υψηλής προτεραιότητας στον αγρότη.</p>
                  </div>
                  <button onClick={() => setShowUrgentWarning(false)} className="ml-auto flex-shrink-0 text-red-400 hover:text-red-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div>
                <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Τίτλος *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm"
                  placeholder="π.χ. Πρόσθετη λίπανση αζώτου" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  {/* UC19 Step 4: Only assigned farmers */}
                  <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Αγρότης *</label>
                  <select value={form.farmerId} onChange={e => setForm(p => ({ ...p, farmerId: e.target.value, fieldId: '' }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm">
                    {myFarmers.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div>
                  {/* UC19 Step 5: Only fields of selected farmer */}
                  <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Χωράφι (προαιρετικό)</label>
                  <select value={form.fieldId} onChange={e => setForm(p => ({ ...p, fieldId: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm">
                    <option value="">Γενική (χωρίς χωράφι)</option>
                    {myFields.filter(f => f.farmerId === form.farmerId).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Τύπος</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as any }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm">
                    {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Προτεραιότητα</label>
                  <select
                    value={form.priority}
                    onChange={e => handlePriorityChange(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none text-sm ${form.priority === 'urgent' ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                  >
                    {Object.entries(priorityConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Περιεχόμενο Σύστασης *</label>
                <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                  rows={4} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm resize-none"
                  placeholder="Γράψτε τη σύστασή σας αναλυτικά..." />
              </div>

              {(!form.title || !form.content || !form.farmerId) && (
                <p className="text-xs text-gray-400">* Τα πεδία Τίτλος, Αγρότης και Περιεχόμενο είναι υποχρεωτικά</p>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={handleCancelRequest} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm" style={{ fontWeight: 500 }}>
                Ακύρωση
              </button>
              <button
                onClick={handleSend}
                disabled={!form.title || !form.content || !form.farmerId}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: sent ? '#059669' : form.priority === 'urgent' ? '#dc2626' : 'linear-gradient(135deg, #0c4a6e, #0284c7)', fontWeight: 600 }}>
                {sent
                  ? <><CheckCircle2 className="w-4 h-4" /> Εστάλη!</>
                  : <><Send className="w-4 h-4" /> {form.priority === 'urgent' ? 'Αποστολή Επείγουσας' : 'Αποστολή'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel Confirmation Dialog (UC19 Alt Flow 3) ─────────── */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-amber-600" />
            </div>
            <h3 className="text-lg mb-2" style={{ fontWeight: 700 }}>Ακύρωση Σύστασης;</h3>
            <p className="text-sm text-gray-500 mb-6">Εάν ακυρώσετε, οι αλλαγές δεν θα αποθηκευτούν.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelConfirm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm" style={{ fontWeight: 500 }}>
                Συνέχεια
              </button>
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl bg-amber-600 text-white text-sm" style={{ fontWeight: 600 }}>
                Ακύρωση
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
