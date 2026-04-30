import React, { useState } from 'react';
import { systemNotifications as initNotifs, SystemNotification } from '../../data/mockData';
import { Bell, Plus, X, CheckCircle2, AlertTriangle, Info, Check, Send } from 'lucide-react';

const typeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; label: string }> = {
  info:    { icon: Info,          color: '#2563eb', bg: '#dbeafe', label: 'Πληροφορία'    },
  warning: { icon: AlertTriangle, color: '#d97706', bg: '#fef3c7', label: 'Προειδοποίηση' },
  success: { icon: CheckCircle2,  color: '#059669', bg: '#d1fae5', label: 'Επιτυχία'      },
  error:   { icon: AlertTriangle, color: '#dc2626', bg: '#fee2e2', label: 'Σφάλμα'        },
};

export default function AdminNotifications() {
  const [notifs, setNotifs] = useState<SystemNotification[]>(initNotifs);
  const [showModal, setShowModal] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', type: 'info' as SystemNotification['type'] });

  const markAllRead  = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const markRead     = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const deleteNotif  = (id: string) => setNotifs(prev => prev.filter(n => n.id !== id));

  const handleSend = () => {
    if (!form.title || !form.message) return;
    const newNotif: SystemNotification = {
      id: 'notif_' + Date.now(), title: form.title, message: form.message, type: form.type,
      date: new Date().toISOString().split('T')[0], read: false,
    };
    setNotifs(prev => [newNotif, ...prev]);
    setSent(true);
    setTimeout(() => { setSent(false); setShowModal(false); setForm({ title: '', message: '', type: 'info' }); }, 1500);
  };

  const unread = notifs.filter(n => !n.read).length;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl" style={{ fontWeight: 700, color: '#111827' }}>Κέντρο Ειδοποιήσεων</h1>
          <p className="text-sm text-gray-500 mt-1">{unread} αναγνωσμένες · {notifs.length} συνολικά</p>
        </div>
        <div className="flex gap-2">
          {unread > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm border border-gray-200 hover:bg-gray-50"
              style={{ fontWeight: 500, color: '#6b7280' }}>
              <Check className="w-4 h-4" /> Όλα Αναγνωσμένα
            </button>
          )}
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm"
            style={{ background: 'linear-gradient(135deg, #3b0764, #7c3aed)', fontWeight: 600 }}>
            <Plus className="w-4 h-4" /> Νέα Ειδοποίηση
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {Object.entries(typeConfig).map(([type, config]) => {
          const count = notifs.filter(n => n.type === type).length;
          return (
            <div key={type} className="bg-white rounded-xl p-3 border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: config.bg }}>
                  <config.icon className="w-3.5 h-3.5" style={{ color: config.color }} />
                </div>
                <div>
                  <div className="text-base" style={{ fontWeight: 700, color: '#111827' }}>{count}</div>
                  <div className="text-xs text-gray-500">{config.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        {notifs.map(notif => {
          const tc   = typeConfig[notif.type];
          const Icon = tc.icon;
          return (
            <div key={notif.id} className={'bg-white rounded-xl border p-4 flex items-start gap-3 transition-all ' + (notif.read ? 'opacity-70 border-gray-100' : 'border-l-4')}
              style={!notif.read ? { borderLeftColor: tc.color } : {}}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: tc.bg }}>
                <Icon className="w-4 h-4" style={{ color: tc.color }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm" style={{ fontWeight: 600, color: '#111827' }}>{notif.title}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: tc.bg, color: tc.color, fontWeight: 600 }}>{tc.label}</span>
                  {!notif.read && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                </div>
                <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                <span className="text-xs text-gray-400 mt-1 block">{new Date(notif.date).toLocaleDateString('el-GR')}</span>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {!notif.read && (
                  <button onClick={() => markRead(notif.id)} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={() => deleteNotif(notif.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
        {notifs.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Δεν υπάρχουν ειδοποιήσεις</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg" style={{ fontWeight: 700 }}>Αποστολή Ειδοποίησης</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Τύπος</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(typeConfig).map(([type, config]) => (
                    <button key={type} onClick={() => setForm(p => ({ ...p, type: type as any }))}
                      className="p-2 rounded-xl text-xs text-center transition-all border"
                      style={{
                        background:   form.type === type ? config.bg    : 'white',
                        borderColor:  form.type === type ? config.color : '#e5e7eb',
                        color:        form.type === type ? config.color : '#6b7280',
                        fontWeight:   form.type === type ? 600 : 400,
                      }}>
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Τίτλος *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm" placeholder="Τίτλος ειδοποίησης" />
              </div>
              <div>
                <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Μήνυμα *</label>
                <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  rows={3} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm resize-none" placeholder="Κείμενο ειδοποίησης..." />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm" style={{ fontWeight: 500 }}>Ακύρωση</button>
              <button onClick={handleSend} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm"
                style={{ background: sent ? '#059669' : 'linear-gradient(135deg, #3b0764, #7c3aed)', fontWeight: 600 }}>
                {sent ? <><CheckCircle2 className="w-4 h-4" /> Εστάλη!</> : <><Send className="w-4 h-4" /> Αποστολή</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
