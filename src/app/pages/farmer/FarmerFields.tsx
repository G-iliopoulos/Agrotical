import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Field, CareLevel, getCropById,
  calculateFieldFinancials, getFieldsByFarmer,
} from '../../data/mockData';
import { Plus, Search, Map, TrendingUp, Leaf, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const careLevelLabels: Record<CareLevel, string> = {
  low: 'Χαμηλή', medium: 'Μέτρια', high: 'Υψηλή',
};
const careLevelColors: Record<CareLevel, { bg: string; text: string }> = {
  low:    { bg: '#fef3c7', text: '#d97706' },
  medium: { bg: '#dbeafe', text: '#2563eb' },
  high:   { bg: '#d1fae5', text: '#059669' },
};
const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: 'Ενεργό',        color: '#059669', bg: '#d1fae5' },
  harvested: { label: 'Θεριστό',       color: '#d97706', bg: '#fef3c7' },
  fallow:    { label: 'Αγρανάπαυση',  color: '#6b7280', bg: '#f3f4f6' },
  preparing: { label: 'Προετοιμασία', color: '#2563eb', bg: '#dbeafe' },
};

export default function FarmerFields() {
  const { currentUser } = useAuth();
  const [localFields, setLocalFields] = useState<Field[]>(
    currentUser ? getFieldsByFarmer(currentUser.id) : []
  );
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  if (!currentUser) return null;

  // UC7 Step 3: Filter by search + status
  const filtered = localFields.filter(f => {
    const matchSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      getCropById(f.cropTypeId)?.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || f.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Basic delete — no block check yet (UC9 Alt Flow 4 έρχεται στο Commit 13)
  const handleDelete = (id: string) => {
    const field = localFields.find(f => f.id === id);
    setLocalFields(prev => prev.filter(f => f.id !== id));
    setDeleteConfirm(null);
    toast.success(`Το χωράφι "${field?.name}" διαγράφηκε`);
  };

  const totals = localFields.reduce((acc, f) => {
    const fin = calculateFieldFinancials(f);
    return {
      acres:   acc.acres   + f.acres,
      revenue: acc.revenue + fin.estimatedRevenue,
      profit:  acc.profit  + fin.estimatedProfit,
    };
  }, { acres: 0, revenue: 0, profit: 0 });

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl" style={{ fontWeight: 700, color: '#111827' }}>Τα Χωράφια μου</h1>
          <p className="text-sm text-gray-500 mt-1">
            {localFields.length} χωράφια · {totals.acres} στρ. συνολικά
          </p>
        </div>
        {/* Το modal Add/Edit έρχεται στο Commit 12 */}
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm"
          style={{ background: 'linear-gradient(135deg, #2d6a4f, #40916c)', fontWeight: 600 }}
          onClick={() => toast.info('Η λειτουργία προσθήκης θα προστεθεί στο επόμενο commit')}
        >
          <Plus className="w-4 h-4" /> Προσθήκη Χωραφιού
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Συν. Στρέμματα', value: `${totals.acres} στρ.`,                            icon: Map,        color: '#2d6a4f', bg: '#d1fae5' },
          { label: 'Αναμ. Έσοδα',    value: `€${totals.revenue.toLocaleString('el-GR')}`,      icon: TrendingUp, color: '#2563eb', bg: '#dbeafe' },
          { label: 'Εκτ. Κέρδος',    value: `€${totals.profit.toLocaleString('el-GR')}`,       icon: Leaf,       color: '#059669', bg: '#d1fae5' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <div>
                <div className="text-lg" style={{ fontWeight: 700, color: '#111827' }}>{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Αναζήτηση χωραφιού..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none text-sm"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none text-sm"
        >
          <option value="all">Όλες οι καταστάσεις</option>
          <option value="active">Ενεργό</option>
          <option value="preparing">Προετοιμασία</option>
          <option value="harvested">Θεριστό</option>
          <option value="fallow">Αγρανάπαυση</option>
        </select>
      </div>

      {/* Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(field => {
          const crop  = getCropById(field.cropTypeId);
          const fin   = calculateFieldFinancials(field);
          const care  = careLevelColors[field.careLevel];
          const stat  = statusLabels[field.status];

          return (
            <div
              key={field.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div
                className="p-4"
                style={{
                  background: `linear-gradient(135deg, ${crop?.color}22, ${crop?.color}11)`,
                  borderBottom: '1px solid #f3f4f6',
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{crop?.icon}</div>
                    <div>
                      <h3 className="text-sm" style={{ fontWeight: 700, color: '#111827' }}>{field.name}</h3>
                      <p className="text-xs text-gray-500">{crop?.name}</p>
                    </div>
                  </div>
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ background: stat.bg, color: stat.color, fontWeight: 600 }}
                  >
                    {stat.label}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <div className="text-xs text-gray-500">Εκτάση</div>
                    <div className="text-sm" style={{ fontWeight: 700, color: '#111827' }}>{field.acres} στρ.</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <div className="text-xs text-gray-500">Υγεία</div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${field.healthScore}%`,
                            background:
                              field.healthScore >= 85 ? '#10b981' :
                              field.healthScore >= 65 ? '#f59e0b' : '#ef4444',
                          }}
                        />
                      </div>
                      <span className="text-xs" style={{ fontWeight: 600 }}>{field.healthScore}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Αναμ. Έσοδα</div>
                    <div className="text-sm" style={{ fontWeight: 700, color: '#2563eb' }}>
                      €{fin.estimatedRevenue.toLocaleString('el-GR')}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Εκτ. Κέρδος</div>
                    <div className="text-sm" style={{ fontWeight: 700, color: fin.estimatedProfit >= 0 ? '#059669' : '#dc2626' }}>
                      €{fin.estimatedProfit.toLocaleString('el-GR')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: care.bg, color: care.text, fontWeight: 600 }}
                  >
                    Φροντίδα: {careLevelLabels[field.careLevel]}
                  </span>
                  <span className="text-xs text-gray-500">{field.irrigationType}</span>
                </div>

                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Map className="w-3 h-3" />
                  {field.location}
                </div>
              </div>

              {/* Card Footer — Edit/Delete (modal έρχεται στο Commit 12) */}
              <div className="px-4 pb-4 flex gap-2">
                <button
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs border border-blue-200 hover:bg-blue-50 transition-colors"
                  style={{ fontWeight: 500, color: '#2563eb' }}
                  onClick={() => toast.info('Η επεξεργασία θα προστεθεί στο επόμενο commit')}
                >
                  <Edit2 className="w-3.5 h-3.5" /> Επεξεργασία
                </button>
                <button
                  onClick={() => setDeleteConfirm(field.id)}
                  className="py-2 px-3 rounded-lg text-xs border border-red-200 hover:bg-red-50 transition-colors"
                  style={{ color: '#dc2626' }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Placeholder add card */}
        <button
          className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8 flex flex-col items-center justify-center gap-3 hover:border-green-400 hover:bg-green-50 transition-all group min-h-[280px]"
          onClick={() => toast.info('Η λειτουργία προσθήκης θα προστεθεί στο επόμενο commit')}
        >
          <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-green-100 flex items-center justify-center transition-colors">
            <Plus className="w-6 h-6 text-gray-400 group-hover:text-green-600" />
          </div>
          <div className="text-sm text-gray-400 group-hover:text-green-600" style={{ fontWeight: 500 }}>
            Προσθήκη νέου χωραφιού
          </div>
        </button>
      </div>

      {/* No results from search */}
      {filtered.length === 0 && localFields.length > 0 && (
        <div className="text-center py-16 text-gray-400">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>Δεν βρέθηκαν χωράφια για την αναζήτησή σας</p>
        </div>
      )}

      {/* UC7 Alt Flow 2: Empty state — no fields at all */}
      {localFields.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Map className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="mb-3">Δεν έχετε προσθέσει χωράφια ακόμη</p>
          <button
            className="px-4 py-2 rounded-xl text-white text-sm"
            style={{ background: 'linear-gradient(135deg, #2d6a4f, #40916c)', fontWeight: 600 }}
            onClick={() => toast.info('Η λειτουργία προσθήκης θα προστεθεί στο επόμενο commit')}
          >
            + Προσθήκη Χωραφιού
          </button>
        </div>
      )}

      {/* Basic Delete Confirm (χωρίς UC9 block check — έρχεται στο Commit 13) */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-lg mb-2" style={{ fontWeight: 700 }}>Διαγραφή Χωραφιού;</h3>
            <p className="text-sm text-gray-500 mb-6">
              Είστε σίγουροι ότι θέλετε να διαγράψετε το χωράφι; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm"
                style={{ fontWeight: 500 }}
              >
                Άκυρο
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm"
                style={{ fontWeight: 600 }}
              >
                Διαγραφή
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
