import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { recommendations as allRecs, Recommendation, getUserById, fields } from '../../data/mockData';
import { MessageSquare, CheckCircle2, Clock, AlertTriangle, ChevronRight, X, Check, Bookmark } from 'lucide-react';
import { toast } from 'sonner';

const priorityConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  low:    { label: 'Χαμηλή',  color: '#6b7280', bg: '#f3f4f6', dot: '#9ca3af' },
  medium: { label: 'Μέτρια',  color: '#2563eb', bg: '#dbeafe', dot: '#3b82f6' },
  high:   { label: 'Υψηλή',   color: '#d97706', bg: '#fef3c7', dot: '#f59e0b' },
  urgent: { label: 'Επείγον', color: '#dc2626', bg: '#fee2e2', dot: '#ef4444' },
};
const typeLabels: Record<string, string> = {
  fertilizer: '🌱 Λίπανση', pesticide: '🧪 Φυτοπροστασία', irrigation: '💧 Άρδευση',
  harvest: '🌾 Συγκομιδή', disease: '🔬 Ασθένεια', general: '📋 Γενική',
};
const statusConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  pending:   { label: 'Νέα',             icon: Clock,        color: '#2563eb' },
  read:      { label: 'Αναγνωσμένη',    icon: CheckCircle2, color: '#6b7280' },
  applied:   { label: 'Εφαρμόστηκε',   icon: Check,        color: '#059669' },
  dismissed: { label: 'Απορρίφθηκε',   icon: X,            color: '#dc2626' },
};

export default function FarmerRecommendations() {
  const { currentUser } = useAuth();
  const [localRecs, setLocalRecs] = useState<Recommendation[]>(
    currentUser ? allRecs.filter(r => r.farmerId === currentUser.id) : []
  );
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [filter, setFilter]           = useState('all');

  if (!currentUser) return null;

  const filtered = localRecs.filter(r =>
    filter === 'all' || r.status === filter || r.type === filter || r.priority === filter
  );

  const updateStatus = (id: string, status: Recommendation['status']) => {
    setLocalRecs(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    if (selectedRec?.id === id) setSelectedRec(prev => prev ? { ...prev, status } : null);
  };

  // UC21 Main + Alt Flow 2: already-applied guard
  const handleApply = (rec: Recommendation) => {
    if (rec.status === 'applied') {
      toast.info('Η σύσταση έχει ήδη καταχωρηθεί ως εφαρμοσμένη');
      return;
    }
    updateStatus(rec.id, 'applied');
    toast.success('Η σύσταση επισημάνθηκε ως εφαρμοσμένη');
  };

  // UC14 Step 5: auto-mark as read on open
  const handleOpenRec = (rec: Recommendation) => {
    setSelectedRec(rec);
    if (rec.status === 'pending') {
      updateStatus(rec.id, 'read');
    }
  };

  const pending = localRecs.filter(r => r.status === 'pending').length;
  const urgent  = localRecs.filter(r => r.priority === 'urgent').length;

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl" style={{ fontWeight: 700, color: '#111827' }}>Συστάσεις Γεωπόνου</h1>
        <p className="text-sm text-gray-500 mt-1">{pending} νέες · {urgent} επείγουσες</p>
      </div>

      {/* UC14 Step 3: Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Νέες',          value: localRecs.filter(r => r.status === 'pending').length,  color: '#2563eb', bg: '#dbeafe' },
          { label: 'Επείγουσες',    value: localRecs.filter(r => r.priority === 'urgent').length, color: '#dc2626', bg: '#fee2e2' },
          { label: 'Εφαρμόστηκαν', value: localRecs.filter(r => r.status === 'applied').length,  color: '#059669', bg: '#d1fae5' },
          { label: 'Συνολικά',      value: localRecs.length,                                      color: '#7c3aed', bg: '#ede9fe' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-3 border border-gray-100 text-center">
            <div className="text-2xl" style={{ fontWeight: 700, color: s.color }}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* UC14 Step 2: Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all',        label: 'Όλες' },
          { key: 'pending',    label: '🔵 Νέες' },
          { key: 'urgent',     label: '🔴 Επείγουσες' },
          { key: 'applied',    label: '✅ Εφαρμοσμένες' },
          { key: 'fertilizer', label: '🌱 Λίπανση' },
          { key: 'pesticide',  label: '🧪 Φυτοπροστασία' },
          { key: 'irrigation', label: '💧 Άρδευση' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${filter === f.key ? 'text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
            style={filter === f.key ? { background: '#1b4332', fontWeight: 600 } : { fontWeight: 500 }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* UC14 Step 4: Recommendations list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Δεν βρέθηκαν συστάσεις</p>
          </div>
        )}
        {filtered.map(rec => {
          const pc         = priorityConfig[rec.priority];
          const sc         = statusConfig[rec.status];
          const StatusIcon = sc.icon;
          const agronomist = getUserById(rec.agronomistId);
          const field      = rec.fieldId ? fields.find(f => f.id === rec.fieldId) : null;

          return (
            <div
              key={rec.id}
              onClick={() => handleOpenRec(rec)}
              className={`bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all ${rec.status === 'pending' ? 'border-blue-200 bg-blue-50/20' : 'border-gray-100'}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: pc.dot }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm" style={{ fontWeight: 600, color: '#111827' }}>{rec.title}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: pc.bg, color: pc.color, fontWeight: 600 }}>
                          {pc.label}
                        </span>
                        <span className="text-xs text-gray-500">{typeLabels[rec.type]}</span>
                        {field && <span className="text-xs text-gray-500">📍 {field.name}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs flex-shrink-0" style={{ color: sc.color }}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span style={{ fontWeight: 500 }}>{sc.label}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{rec.content}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                    <span>🔬 {agronomist?.name}</span>
                    <span>·</span>
                    <span>{new Date(rec.date).toLocaleDateString('el-GR')}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
              </div>
            </div>
          );
        })}
      </div>

      {/* UC14 Step 5 / UC21: Detail Modal */}
      {selectedRec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedRec(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{
                    background: priorityConfig[selectedRec.priority].bg,
                    color: priorityConfig[selectedRec.priority].color,
                    fontWeight: 600
                  }}>
                    {priorityConfig[selectedRec.priority].label}
                  </span>
                  <span className="text-xs text-gray-500">{typeLabels[selectedRec.type]}</span>
                </div>
                <h2 className="text-base" style={{ fontWeight: 700 }}>{selectedRec.title}</h2>
              </div>
              <button onClick={() => setSelectedRec(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-700 leading-relaxed">{selectedRec.content}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Γεωπόνος',  value: getUserById(selectedRec.agronomistId)?.name ?? '—' },
                  { label: 'Ημερομηνία', value: new Date(selectedRec.date).toLocaleDateString('el-GR') },
                  { label: 'Χωράφι',    value: selectedRec.fieldId ? fields.find(f => f.id === selectedRec.fieldId)?.name ?? '—' : 'Γενική' },
                  { label: 'Κατάσταση', value: statusConfig[selectedRec.status].label },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500">{s.label}</div>
                    <div className="text-sm mt-0.5" style={{ fontWeight: 600 }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* UC21 Alt Flow 2: Already applied notice */}
              {selectedRec.status === 'applied' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <p className="text-xs text-green-800" style={{ fontWeight: 500 }}>Η σύσταση έχει ήδη καταχωρηθεί ως εφαρμοσμένη.</p>
                </div>
              )}
            </div>

            {/* UC21: Action buttons — hidden for applied/dismissed */}
            {selectedRec.status !== 'applied' && selectedRec.status !== 'dismissed' && (
              <div className="flex gap-3 p-6 border-t border-gray-100">
                <button
                  onClick={() => updateStatus(selectedRec.id, 'dismissed')}
                  className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm flex items-center justify-center gap-2"
                  style={{ fontWeight: 500 }}
                >
                  <X className="w-4 h-4" /> Απόρριψη
                </button>
                <button
                  onClick={() => handleApply(selectedRec)}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #2d6a4f, #40916c)', fontWeight: 600 }}
                >
                  <Check className="w-4 h-4" /> Εφαρμόστηκε
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
