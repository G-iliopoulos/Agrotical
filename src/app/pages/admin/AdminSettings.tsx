import React, { useState } from 'react';
import { Settings, Bell, Shield, Database, Palette, Globe, Save, CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function AdminSettings() {
  const [saved, setSaved]               = useState(false);
  const [dangerAction, setDangerAction] = useState<string | null>(null);
  const [dangerDone, setDangerDone]     = useState<string | null>(null);
  const [settings, setSettings] = useState({
    appName: 'Agrotical',
    defaultLanguage: 'el',
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
    allowRegistration: true,
    defaultCurrency: 'EUR',
    weatherApiEnabled: true,
    backupFrequency: 'daily',
    maxFieldsPerFarmer: 20,
    sessionTimeout: 60,
  });

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const handleDangerConfirm = (action: string) => {
    setDangerAction(null);
    setDangerDone(action);
    setTimeout(() => setDangerDone(null), 3000);
  };

  const ToggleSwitch = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)}
      className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
      style={{ background: value ? '#40916c' : '#d1d5db' }}>
      <div className={'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ' + (value ? 'translate-x-5' : 'translate-x-0.5')} />
    </button>
  );

  const sections = [
    {
      title: 'Γενικά', icon: Globe, color: '#7c3aed', items: [
        { label: 'Όνομα Εφαρμογής',        type: 'text',   key: 'appName' },
        { label: 'Προεπιλεγμένη Γλώσσα',   type: 'select', key: 'defaultLanguage', options: [{ value: 'el', label: 'Ελληνικά' }, { value: 'en', label: 'English' }] },
        { label: 'Νόμισμα',                type: 'select', key: 'defaultCurrency',  options: [{ value: 'EUR', label: 'Euro (€)' }, { value: 'USD', label: 'Dollar ($)' }] },
      ],
    },
    {
      title: 'Ειδοποιήσεις', icon: Bell, color: '#2563eb', items: [
        { label: 'Email Ειδοποιήσεις',          type: 'toggle', key: 'emailNotifications' },
        { label: 'SMS Ειδοποιήσεις',            type: 'toggle', key: 'smsNotifications' },
        { label: 'Καιρική API Ενεργοποιημένη',  type: 'toggle', key: 'weatherApiEnabled' },
      ],
    },
    {
      title: 'Ασφάλεια & Πρόσβαση', icon: Shield, color: '#dc2626', items: [
        { label: 'Επιτρεπόμενες Νέες Εγγραφές', type: 'toggle', key: 'allowRegistration' },
        { label: 'Λειτουργία Συντήρησης',        type: 'toggle', key: 'maintenanceMode' },
        { label: 'Timeout Συνόδου (λεπτά)',       type: 'number', key: 'sessionTimeout' },
      ],
    },
    {
      title: 'Δεδομένα & Backup', icon: Database, color: '#059669', items: [
        { label: 'Συχνότητα Backup',                type: 'select', key: 'backupFrequency', options: [{ value: 'hourly', label: 'Ωριαία' }, { value: 'daily', label: 'Καθημερινή' }, { value: 'weekly', label: 'Εβδομαδιαία' }] },
        { label: 'Μέγιστα Χωράφια ανά Αγρότη',     type: 'number', key: 'maxFieldsPerFarmer' },
      ],
    },
  ];

  const dangerActions = [
    { key: 'cache', label: 'Καθαρισμός Cache',      desc: 'Διαγραφή προσωρινών δεδομένων',     confirm: 'Να διαγραφεί το cache;',        doneMsg: 'Cache καθαρίστηκε επιτυχώς!' },
    { key: 'reset', label: 'Επαναφορά Ρυθμίσεων',  desc: 'Επαναφορά στις αρχικές τιμές',       confirm: 'Να επαναφερθούν οι ρυθμίσεις;', doneMsg: 'Ρυθμίσεις επαναφέρθηκαν!'       },
  ];

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl" style={{ fontWeight: 700, color: '#111827' }}>Ρυθμίσεις Συστήματος</h1>
          <p className="text-sm text-gray-500 mt-1">Διαχείριση παραμέτρων πλατφόρμας</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm transition-all"
          style={{ background: saved ? '#059669' : 'linear-gradient(135deg, #3b0764, #7c3aed)', fontWeight: 600 }}>
          {saved ? <><CheckCircle2 className="w-4 h-4" /> Αποθηκεύτηκε!</> : <><Save className="w-4 h-4" /> Αποθήκευση</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sections.map(section => (
          <div key={section.title} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 p-5 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: section.color + '20' }}>
                <section.icon className="w-4 h-4" style={{ color: section.color }} />
              </div>
              <h3 className="text-sm" style={{ fontWeight: 600, color: '#111827' }}>{section.title}</h3>
            </div>
            <div className="p-5 space-y-4">
              {section.items.map(item => (
                <div key={item.key} className="flex items-center justify-between gap-4">
                  <label className="text-sm text-gray-700" style={{ fontWeight: 500 }}>{item.label}</label>
                  {item.type === 'toggle' && (
                    <ToggleSwitch
                      value={settings[item.key as keyof typeof settings] as boolean}
                      onChange={v => setSettings(p => ({ ...p, [item.key]: v }))}
                    />
                  )}
                  {item.type === 'text' && (
                    <input
                      value={settings[item.key as keyof typeof settings] as string}
                      onChange={e => setSettings(p => ({ ...p, [item.key]: e.target.value }))}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none w-40"
                    />
                  )}
                  {item.type === 'number' && (
                    <input
                      type="number"
                      value={settings[item.key as keyof typeof settings] as number}
                      onChange={e => setSettings(p => ({ ...p, [item.key]: Number(e.target.value) }))}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none w-24"
                    />
                  )}
                  {item.type === 'select' && (
                    <select
                      value={settings[item.key as keyof typeof settings] as string}
                      onChange={e => setSettings(p => ({ ...p, [item.key]: e.target.value }))}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none"
                    >
                      {(item as any).options?.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
        <h3 className="text-sm mb-3" style={{ fontWeight: 600, color: '#991b1b' }}>⚠️ Επικίνδυνη Ζώνη</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          {dangerActions.map(action => (
            <div key={action.key} className="flex-1 bg-white rounded-xl p-4 border border-red-200">
              <div className="text-sm" style={{ fontWeight: 600, color: '#111827' }}>{action.label}</div>
              <div className="text-xs text-gray-500 mt-0.5 mb-3">{action.desc}</div>
              {dangerDone === action.key ? (
                <div className="w-full py-2 rounded-lg text-xs text-center bg-green-50 border border-green-200 text-green-700 flex items-center justify-center gap-1" style={{ fontWeight: 600 }}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> {action.doneMsg}
                </div>
              ) : (
                <button onClick={() => setDangerAction(action.key)}
                  className="w-full py-2 rounded-lg text-xs border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                  style={{ fontWeight: 600 }}>
                  Εκτέλεση
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {dangerAction && (() => {
        const action = dangerActions.find(a => a.key === dangerAction)!;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setDangerAction(null)} />
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-base" style={{ fontWeight: 700 }}>{action.label}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{action.confirm}</p>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setDangerAction(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm" style={{ fontWeight: 500 }}>Ακύρωση</button>
                <button onClick={() => handleDangerConfirm(action.key)} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm" style={{ fontWeight: 600 }}>Επιβεβαίωση</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
