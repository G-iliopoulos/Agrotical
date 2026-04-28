import React, { useState } from 'react';
import { cropTypes } from '../../data/mockData';
import { Search, Droplet, Sun, Calendar, TrendingUp } from 'lucide-react';

const waterLabels:     Record<string, string> = { low: 'Χαμηλές',   medium: 'Μέτριες',  high: 'Υψηλές'   };
const waterColors:     Record<string, string> = { low: '#d1fae5',   medium: '#dbeafe',  high: '#fee2e2'  };
const waterTextColors: Record<string, string> = { low: '#059669',   medium: '#2563eb',  high: '#dc2626'  };

export default function AgronomistCropLibrary() {
  const [search, setSearch]           = useState('');
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [filterWater, setFilterWater] = useState('all');

  const filtered = cropTypes.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.nameEn.toLowerCase().includes(search.toLowerCase());
    const matchWater  = filterWater === 'all' || c.waterNeeds === filterWater;
    return matchSearch && matchWater;
  });

  const selected = cropTypes.find(c => c.id === selectedCrop);

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl" style={{ fontWeight: 700, color: '#111827' }}>Βιβλιοθήκη Καλλιεργειών</h1>
        <p className="text-sm text-gray-500 mt-1">{cropTypes.length} καλλιέργειες με αναλυτικά στοιχεία</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Αναζήτηση καλλιέργειας..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none text-sm" />
        </div>
        <select value={filterWater} onChange={e => setFilterWater(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm">
          <option value="all">Όλες Ανάγκες Νερού</option>
          <option value="low">Χαμηλές</option>
          <option value="medium">Μέτριες</option>
          <option value="high">Υψηλές</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Crop Cards List */}
        <div className="space-y-2">
          {filtered.map(crop => (
            <button
              key={crop.id}
              onClick={() => setSelectedCrop(selectedCrop === crop.id ? null : crop.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${selectedCrop === crop.id ? 'border-blue-300 bg-blue-50' : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{crop.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ fontWeight: 600, color: '#111827' }}>{crop.name}</span>
                    <span className="text-xs text-gray-400">({crop.nameEn})</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: waterColors[crop.waterNeeds], color: waterTextColors[crop.waterNeeds], fontWeight: 500 }}>
                      💧 {waterLabels[crop.waterNeeds]}
                    </span>
                    <span className="text-xs text-gray-500">{crop.season}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm" style={{ fontWeight: 700, color: '#059669' }}>€{Math.round(crop.avgYieldPerAcre * crop.avgPricePerKg - crop.avgCostPerAcre)}/στρ.</div>
                  <div className="text-xs text-gray-400">εκτ. κέρδος</div>
                </div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <span className="text-4xl">🌱</span>
              <p className="text-sm mt-2">Δεν βρέθηκαν καλλιέργειες</p>
            </div>
          )}
        </div>

        {/* Detail Panel (sticky) */}
        <div className="sticky top-6">
          {selected ? (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {/* Gradient header */}
              <div className="p-5" style={{ background: `linear-gradient(135deg, ${selected.color}22, ${selected.color}11)` }}>
                <div className="text-5xl mb-3">{selected.icon}</div>
                <h2 className="text-xl" style={{ fontWeight: 700, color: '#111827' }}>{selected.name}</h2>
                <p className="text-sm text-gray-600 mt-1">{selected.description}</p>
              </div>
              <div className="p-5 space-y-4">
                {/* 4 stat tiles */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Απόδοση/Στρ.',  value: `${selected.avgYieldPerAcre} kg`,                                   color: '#059669' },
                    { label: 'Τιμή/kg',        value: `€${selected.avgPricePerKg}`,                                    color: '#2563eb' },
                    { label: 'Κόστος/Στρ.',    value: `€${selected.avgCostPerAcre}`,                                   color: '#d97706' },
                    { label: 'Έσοδα/Στρ.',     value: `€${Math.round(selected.avgYieldPerAcre * selected.avgPricePerKg)}`, color: '#7c3aed' },
                  ].map(s => (
                    <div key={s.label} className="bg-gray-50 rounded-xl p-3">
                      <div className="text-xs text-gray-500">{s.label}</div>
                      <div className="text-base mt-0.5" style={{ fontWeight: 700, color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>
                {/* Info rows */}
                <div className="space-y-2">
                  {[
                    { icon: Calendar, label: 'Εποχή',            value: selected.season },
                    { icon: Sun,      label: 'Ημέρες Ανάπτυξης', value: `${selected.growthDays} ημέρες` },
                    { icon: Droplet,  label: 'Ανάγκες Νερού',    value: waterLabels[selected.waterNeeds] },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <s.icon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{s.label}:</span>
                      <span className="text-sm ml-auto" style={{ fontWeight: 600 }}>{s.value}</span>
                    </div>
                  ))}
                </div>
                {/* Profit estimate */}
                <div className="p-3 rounded-xl" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <div className="text-xs" style={{ fontWeight: 600, color: '#166534', marginBottom: '4px' }}>💰 Εκτίμηση Κέρδους ανά Στρέμμα</div>
                  <div className="text-lg" style={{ fontWeight: 700, color: '#059669' }}>
                    €{Math.round(selected.avgYieldPerAcre * selected.avgPricePerKg - selected.avgCostPerAcre)}
                    <span className="text-sm text-gray-500 ml-1" style={{ fontWeight: 400 }}>με φροντίδα: μέτρια</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <span className="text-5xl">🌿</span>
              <p className="text-sm text-gray-500 mt-3">Επιλέξτε μια καλλιέργεια για να δείτε λεπτομέρειες</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
