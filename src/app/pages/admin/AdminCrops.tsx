import React, { useState } from 'react';
import { cropTypes, CropType } from '../../data/mockData';
import { Search, Plus, Edit2, Droplet, Sun, TrendingUp, X, Save } from 'lucide-react';

const waterLabels: Record<string, string> = { low: 'Χαμηλές', medium: 'Μέτριες', high: 'Υψηλές' };
const waterColors: Record<string, { bg: string; text: string }> = {
  low: { bg: '#d1fae5', text: '#059669' },
  medium: { bg: '#dbeafe', text: '#2563eb' },
  high: { bg: '#fee2e2', text: '#dc2626' },
};

export default function AdminCrops() {
  const [localCrops, setLocalCrops] = useState<CropType[]>(cropTypes);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCrop, setEditingCrop] = useState<CropType | null>(null);
  const [form, setForm] = useState<Partial<CropType>>({});

  const filtered = localCrops.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.nameEn.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (crop: CropType) => { setEditingCrop(crop); setForm({ ...crop }); setShowModal(true); };
  const openAdd = () => { setEditingCrop(null); setForm({ season: 'Καλοκαιρινό', waterNeeds: 'medium', icon: '🌱', color: '#40916c' }); setShowModal(true); };
  const handleSave = () => {
    if (!form.name) return;
    if (editingCrop) {
      setLocalCrops(prev => prev.map(c => c.id === editingCrop.id ? { ...editingCrop, ...form } as CropType : c));
    } else {
      const newCrop: CropType = {
        id: 'crop_' + Date.now(),
        name: form.name ?? '',
        nameEn: form.nameEn ?? form.name ?? '',
        avgYieldPerAcre: form.avgYieldPerAcre ?? 200,
        avgPricePerKg: form.avgPricePerKg ?? 0.30,
        avgCostPerAcre: form.avgCostPerAcre ?? 60,
        season: form.season ?? 'Καλοκαιρινό',
        waterNeeds: form.waterNeeds ?? 'medium',
        growthDays: form.growthDays ?? 120,
        description: form.description ?? '',
        icon: form.icon ?? '🌱',
        color: form.color ?? '#40916c',
      };
      setLocalCrops(prev => [...prev, newCrop]);
    }
    setShowModal(false);
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl" style={{ fontWeight: 700, color: '#111827' }}>Βάση Καλλιεργειών</h1>
          <p className="text-sm text-gray-500 mt-1">{localCrops.length} είδη καλλιεργειών στο σύστημα</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm"
          style={{ background: 'linear-gradient(135deg, #3b0764, #7c3aed)', fontWeight: 600 }}>
          <Plus className="w-4 h-4" /> Νέα Καλλιέργεια
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Αναζήτηση καλλιέργειας..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none text-sm" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(crop => {
          const wc = waterColors[crop.waterNeeds];
          const estimatedProfit = Math.round(crop.avgYieldPerAcre * crop.avgPricePerKg - crop.avgCostPerAcre);
          return (
            <div key={crop.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4" style={{ background: 'linear-gradient(135deg, ' + crop.color + '22, ' + crop.color + '11)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{crop.icon}</span>
                    <div>
                      <h3 className="text-sm" style={{ fontWeight: 700, color: '#111827' }}>{crop.name}</h3>
                      <p className="text-xs text-gray-500">{crop.nameEn} · {crop.season}</p>
                    </div>
                  </div>
                  <button onClick={() => openEdit(crop)} className="p-2 rounded-lg hover:bg-white/50 text-gray-600 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-xs text-gray-500">{crop.description}</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Απόδοση/Στρ.', value: crop.avgYieldPerAcre + ' kg' },
                    { label: 'Τιμή/kg', value: '€' + crop.avgPricePerKg },
                    { label: 'Κόστος/Στρ.', value: '€' + crop.avgCostPerAcre },
                  ].map(s => (
                    <div key={s.label} className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="text-xs" style={{ fontWeight: 700 }}>{s.value}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 rounded-full" style={{ background: wc.bg, color: wc.text, fontWeight: 600 }}>
                    💧 {waterLabels[crop.waterNeeds]}
                  </span>
                  <span className="text-sm" style={{ fontWeight: 700, color: estimatedProfit >= 0 ? '#059669' : '#dc2626' }}>
                    €{estimatedProfit}/στρ. κέρδος
                  </span>
                </div>
                <div className="text-xs text-gray-400">⏱ {crop.growthDays} ημέρες ανάπτυξης</div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-400">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Δεν βρέθηκαν καλλιέργειες</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg" style={{ fontWeight: 700 }}>{editingCrop ? 'Επεξεργασία Καλλιέργειας' : 'Νέα Καλλιέργεια'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Όνομα (Ελληνικά)</label>
                  <input value={form.name ?? ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Απόδοση/Στρ. (kg)</label>
                  <input type="number" value={form.avgYieldPerAcre ?? ''} onChange={e => setForm(p => ({ ...p, avgYieldPerAcre: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Τιμή/kg (€)</label>
                  <input type="number" step="0.01" value={form.avgPricePerKg ?? ''} onChange={e => setForm(p => ({ ...p, avgPricePerKg: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Κόστος/Στρ. (€)</label>
                  <input type="number" value={form.avgCostPerAcre ?? ''} onChange={e => setForm(p => ({ ...p, avgCostPerAcre: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Ανάγκες Νερού</label>
                  <select value={form.waterNeeds ?? 'medium'} onChange={e => setForm(p => ({ ...p, waterNeeds: e.target.value as any }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm">
                    <option value="low">Χαμηλές</option>
                    <option value="medium">Μέτριες</option>
                    <option value="high">Υψηλές</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Ημέρες Ανάπτυξης</label>
                  <input type="number" value={form.growthDays ?? ''} onChange={e => setForm(p => ({ ...p, growthDays: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm" />
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm" style={{ fontWeight: 500 }}>Ακύρωση</button>
              <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm"
                style={{ background: 'linear-gradient(135deg, #3b0764, #7c3aed)', fontWeight: 600 }}>
                <Save className="w-4 h-4" /> Αποθήκευση
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
