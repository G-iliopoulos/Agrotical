import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  fields as allFields, Field, CareLevel, getCropById, cropTypes,
  calculateFieldFinancials, getFieldsByFarmer, tasks as allTasks, recommendations as allRecs
} from '../../data/mockData';
import {
  Plus, Search, X, Edit2, Trash2, Eye, Map,
  TrendingUp, Leaf, Save, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

const careLevelLabels: Record<CareLevel, string> = {
  low: 'Χαμηλή', medium: 'Μέτρια', high: 'Υψηλή'
};
const careLevelColors: Record<CareLevel, { bg: string; text: string }> = {
  low:    { bg: '#fef3c7', text: '#d97706' },
  medium: { bg: '#dbeafe', text: '#2563eb' },
  high:   { bg: '#d1fae5', text: '#059669' },
};
const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: 'Ενεργό',       color: '#059669', bg: '#d1fae5' },
  harvested: { label: 'Θεριστό',      color: '#d97706', bg: '#fef3c7' },
  fallow:    { label: 'Αγρανάπαυση', color: '#6b7280', bg: '#f3f4f6' },
  preparing: { label: 'Προετοιμασία', color: '#2563eb', bg: '#dbeafe' },
};

const emptyField: Omit<Field, 'id' | 'farmerId' | 'healthScore'> = {
  name: '', acres: 0, cropTypeId: 'wheat', careLevel: 'medium',
  plantingDate: '', expectedHarvestDate: '', status: 'active',
  location: '', notes: '', irrigationType: 'Σταγόνα', soilType: 'Αμμοπηλώδες',
};

export default function FarmerFields() {
  const { currentUser } = useAuth();
  const [localFields, setLocalFields] = useState<Field[]>(
    currentUser ? getFieldsByFarmer(currentUser.id) : []
  );
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [form, setForm] = useState<Omit<Field, 'id' | 'farmerId' | 'healthScore'>>(emptyField);
  const [viewField, setViewField] = useState<Field | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteBlockMsg, setDeleteBlockMsg] = useState('');
  const [formErrors, setFormErrors] = useState<{ name?: string; acres?: string; dates?: string }>({});

  if (!currentUser) return null;

  const filtered = localFields.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
      getCropById(f.cropTypeId)?.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || f.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openAdd = () => { setEditingField(null); setForm(emptyField); setFormErrors({}); setShowModal(true); };

  const openEdit = (field: Field) => {
    setEditingField(field);
    const { id, farmerId, healthScore, ...rest } = field;
    setForm(rest); setFormErrors({}); setShowModal(true);
  };

  const validateForm = (): boolean => {
    const errors: { name?: string; acres?: string; dates?: string } = {};
    if (!form.name.trim()) {
      errors.name = 'Το όνομα χωραφιού είναι υποχρεωτικό';
    } else {
      const duplicate = localFields.find(f =>
        f.name.toLowerCase() === form.name.trim().toLowerCase() &&
        (!editingField || f.id !== editingField.id)
      );
      if (duplicate) errors.name = 'Υπάρχει ήδη χωράφι με αυτό το όνομα';
    }
    if (!form.acres || form.acres <= 0) errors.acres = 'Η έκταση πρέπει να είναι μεγαλύτερη από 0';
    if (form.plantingDate && form.expectedHarvestDate) {
      if (new Date(form.expectedHarvestDate) < new Date(form.plantingDate))
        errors.dates = 'Η ημερομηνία συγκομιδής δεν μπορεί να προηγείται της ημερομηνίας σποράς';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    if (editingField) {
      setLocalFields(prev => prev.map(f => f.id === editingField.id ? { ...editingField, ...form } : f));
      toast.success(`Το χωράφι "${form.name}" ενημερώθηκε επιτυχώς`);
    } else {
      const newField: Field = { id: `field_${Date.now()}`, farmerId: currentUser.id, healthScore: 75, ...form };
      setLocalFields(prev => [...prev, newField]);
      toast.success(`Το χωράφι "${form.name}" προστέθηκε επιτυχώς`);
    }
    setShowModal(false);
  };

  const handleDeleteRequest = (fieldId: string) => {
    const pendingTasks = allTasks.filter(t => t.fieldId === fieldId && !t.completed);
    const activeRecs   = allRecs.filter(r => r.fieldId === fieldId && (r.status === 'pending' || r.status === 'read'));
    if (pendingTasks.length > 0 || activeRecs.length > 0) {
      setDeleteBlockMsg('Δεν μπορείτε να διαγράψετε το χωράφι όσο υπάρχουν εκκρεμείς εργασίες ή ενεργές συστάσεις');
    } else { setDeleteBlockMsg(''); }
    setDeleteConfirm(fieldId);
  };

  const handleDelete = (id: string) => {
    if (deleteBlockMsg) return;
    const field = localFields.find(f => f.id === id);
    setLocalFields(prev => prev.filter(f => f.id !== id));
    setDeleteConfirm(null); setDeleteBlockMsg('');
    toast.success(`Το χωράφι "${field?.name}" διαγράφηκε`);
  };

  const totals = localFields.reduce((acc, f) => {
    const fin = calculateFieldFinancials(f);
    return { acres: acc.acres + f.acres, revenue: acc.revenue + fin.estimatedRevenue, profit: acc.profit + fin.estimatedProfit };
  }, { acres: 0, revenue: 0, profit: 0 });

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl" style={{ fontWeight: 700, color: '#111827' }}>Τα Χωράφια μου</h1>
          <p className="text-sm text-gray-500 mt-1">{localFields.length} χωράφια · {totals.acres} στρ. συνολικά</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm transition-all hover:shadow-md"
          style={{ background: 'linear-gradient(135deg, #2d6a4f, #40916c)', fontWeight: 600 }}>
          <Plus className="w-4 h-4" />Προσθήκη Χωραφιού
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Συν. Στρέμματα', value: `${totals.acres} στρ.`,                           icon: Map,        color: '#2d6a4f', bg: '#d1fae5' },
          { label: 'Αναμ. Έσοδα',   value: `€${totals.revenue.toLocaleString('el-GR')}`,      icon: TrendingUp, color: '#2563eb', bg: '#dbeafe' },
          { label: 'Εκτ. Κέρδος',   value: `€${totals.profit.toLocaleString('el-GR')}`,       icon: Leaf,       color: '#059669', bg: '#d1fae5' },
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Αναζήτηση χωραφιού..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 text-sm" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none text-sm">
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
          const crop = getCropById(field.cropTypeId);
          const fin  = calculateFieldFinancials(field);
          const care = careLevelColors[field.careLevel];
          const stat = statusLabels[field.status];
          return (
            <div key={field.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
              <div className="p-4" style={{ background: `linear-gradient(135deg, ${crop?.color}22, ${crop?.color}11)`, borderBottom: '1px solid #f3f4f6' }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{crop?.icon}</div>
                    <div>
                      <h3 className="text-sm" style={{ fontWeight: 700, color: '#111827' }}>{field.name}</h3>
                      <p className="text-xs text-gray-500">{crop?.name}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full" style={{ background: stat.bg, color: stat.color, fontWeight: 600 }}>{stat.label}</span>
                </div>
              </div>
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
                        <div className="h-1.5 rounded-full" style={{ width: `${field.healthScore}%`, background: field.healthScore >= 85 ? '#10b981' : field.healthScore >= 65 ? '#f59e0b' : '#ef4444' }} />
                      </div>
                      <span className="text-xs" style={{ fontWeight: 600 }}>{field.healthScore}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Αναμ. Έσοδα</div>
                    <div className="text-sm" style={{ fontWeight: 700, color: '#2563eb' }}>€{fin.estimatedRevenue.toLocaleString('el-GR')}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Εκτ. Κέρδος</div>
                    <div className="text-sm" style={{ fontWeight: 700, color: fin.estimatedProfit >= 0 ? '#059669' : '#dc2626' }}>€{fin.estimatedProfit.toLocaleString('el-GR')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: care.bg, color: care.text, fontWeight: 600 }}>Φροντίδα: {careLevelLabels[field.careLevel]}</span>
                  <span className="text-xs text-gray-500">{field.irrigationType}</span>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1"><Map className="w-3 h-3" />{field.location}</div>
              </div>
              <div className="px-4 pb-4 flex gap-2">
                <button onClick={() => setViewField(field)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs border border-gray-200 hover:bg-gray-50 transition-colors" style={{ fontWeight: 500, color: '#6b7280' }}>
                  <Eye className="w-3.5 h-3.5" /> Λεπτομέρειες
                </button>
                <button onClick={() => openEdit(field)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs border border-blue-200 hover:bg-blue-50 transition-colors" style={{ fontWeight: 500, color: '#2563eb' }}>
                  <Edit2 className="w-3.5 h-3.5" /> Επεξεργασία
                </button>
                <button onClick={() => handleDeleteRequest(field.id)} className="py-2 px-3 rounded-lg text-xs border border-red-200 hover:bg-red-50 transition-colors" style={{ color: '#dc2626' }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Add card */}
        <button onClick={openAdd} className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8 flex flex-col items-center justify-center gap-3 hover:border-green-400 hover:bg-green-50 transition-all group min-h-[280px]">
          <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-green-100 flex items-center justify-center transition-colors">
            <Plus className="w-6 h-6 text-gray-400 group-hover:text-green-600" />
          </div>
          <div className="text-sm text-gray-400 group-hover:text-green-600" style={{ fontWeight: 500 }}>Προσθήκη νέου χωραφιού</div>
        </button>
      </div>

      {filtered.length === 0 && localFields.length > 0 && (
        <div className="text-center py-16 text-gray-400">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>Δεν βρέθηκαν χωράφια για την αναζήτησή σας</p>
        </div>
      )}
      {localFields.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Map className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="mb-3">Δεν έχετε προσθέσει χωράφια ακόμη</p>
          <button onClick={openAdd} className="px-4 py-2 rounded-xl text-white text-sm" style={{ background: 'linear-gradient(135deg, #2d6a4f, #40916c)', fontWeight: 600 }}>
            + Προσθήκη Χωραφιού
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg" style={{ fontWeight: 700 }}>{editingField ? 'Επεξεργασία Χωραφιού' : 'Νέο Χωράφι'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Όνομα Χωραφιού *</label>
                  <input value={form.name} onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setFormErrors(p => ({ ...p, name: undefined })); }}
                    className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 text-sm ${formErrors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    placeholder="π.χ. Χωράφι Νταμάρι" />
                  {formErrors.name && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{formErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Στρέμματα *</label>
                  <input type="number" value={form.acres || ''} onChange={e => { setForm(p => ({ ...p, acres: Number(e.target.value) })); setFormErrors(p => ({ ...p, acres: undefined })); }}
                    className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 text-sm ${formErrors.acres ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    placeholder="0" min="0" />
                  {formErrors.acres && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{formErrors.acres}</p>}
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Είδος Καλλιέργειας</label>
                  <select value={form.cropTypeId} onChange={e => setForm(p => ({ ...p, cropTypeId: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm">
                    {cropTypes.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Επίπεδο Φροντίδας</label>
                  <select value={form.careLevel} onChange={e => setForm(p => ({ ...p, careLevel: e.target.value as CareLevel }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm">
                    <option value="low">Χαμηλή</option><option value="medium">Μέτρια</option><option value="high">Υψηλή</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Κατάσταση</label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as any }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm">
                    <option value="active">Ενεργό</option><option value="preparing">Προετοιμασία</option>
                    <option value="harvested">Θεριστό</option><option value="fallow">Αγρανάπαυση</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Ημ. Σποράς</label>
                  <input type="date" value={form.plantingDate} onChange={e => { setForm(p => ({ ...p, plantingDate: e.target.value })); setFormErrors(p => ({ ...p, dates: undefined })); }}
                    className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none text-sm ${formErrors.dates ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Αναμ. Συγκομιδή</label>
                  <input type="date" value={form.expectedHarvestDate} onChange={e => { setForm(p => ({ ...p, expectedHarvestDate: e.target.value })); setFormErrors(p => ({ ...p, dates: undefined })); }}
                    className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none text-sm ${formErrors.dates ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                </div>
                {formErrors.dates && <div className="col-span-2"><p className="text-xs text-red-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{formErrors.dates}</p></div>}
                <div className="col-span-2">
                  <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Τοποθεσία</label>
                  <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm" placeholder="π.χ. Λάρισα, Τυρνάβου" />
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Άρδευση</label>
                  <select value={form.irrigationType} onChange={e => setForm(p => ({ ...p, irrigationType: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm">
                    <option>Σταγόνα</option><option>Τεχνητή βροχή</option><option>Βροχή</option>
                    <option>Υπόγεια</option><option>Χωρίς άρδευση</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Τύπος Εδάφους</label>
                  <select value={form.soilType} onChange={e => setForm(p => ({ ...p, soilType: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm">
                    <option>Αμμοπηλώδες</option><option>Πηλώδες</option><option>Αργιλώδες</option>
                    <option>Ασβεστολιθικό</option><option>Πηλοαμμώδες</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Σημειώσεις</label>
                  <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm resize-none"
                    placeholder="Προαιρετικές σημειώσεις..." />
                </div>
              </div>

              {/* Preview */}
              {form.acres > 0 && form.cropTypeId && (
                <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                  <div className="text-xs mb-3" style={{ color: '#2d6a4f', fontWeight: 600 }}>📊 Εκτίμηση Αποδόσεων</div>
                  {(() => {
                    const preview = calculateFieldFinancials({ ...form, id: 'tmp', farmerId: 'tmp', healthScore: 80 } as Field);
                    return (
                      <>
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          {[
                            { label: 'Παραγωγή', value: `${preview.estimatedYield.toLocaleString('el-GR')} kg` },
                            { label: 'Έσοδα',    value: `€${preview.estimatedRevenue.toLocaleString('el-GR')}` },
                            { label: 'Κέρδος',   value: `€${preview.estimatedProfit.toLocaleString('el-GR')}` },
                          ].map(s => (
                            <div key={s.label} className="text-center">
                              <div className="text-sm" style={{ fontWeight: 700, color: '#1b4332' }}>{s.value}</div>
                              <div className="text-xs text-gray-500">{s.label}</div>
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-green-200">
                          <div className="flex items-center justify-between bg-white/70 rounded-lg px-2 py-1.5">
                            <span className="text-xs text-gray-500">🌍 Έδαφος</span>
                            <span className="text-xs" style={{ fontWeight: 600, color: preview.soilFactor >= 100 ? '#059669' : preview.soilFactor >= 90 ? '#d97706' : '#dc2626' }}>{preview.soilFactor}% απόδοσης</span>
                          </div>
                          <div className="flex items-center justify-between bg-white/70 rounded-lg px-2 py-1.5">
                            <span className="text-xs text-gray-500">💧 Άρδευση</span>
                            <span className="text-xs" style={{ fontWeight: 600, color: preview.irrigationFactor >= 100 ? '#059669' : preview.irrigationFactor >= 85 ? '#d97706' : '#dc2626' }}>{preview.irrigationFactor}% απόδοσης</span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
            <div className="sticky bottom-0 bg-white flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm hover:bg-gray-50 transition-colors" style={{ fontWeight: 500 }}>Ακύρωση</button>
              <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm transition-all hover:shadow-md"
                style={{ background: 'linear-gradient(135deg, #2d6a4f, #40916c)', fontWeight: 600 }}>
                <Save className="w-4 h-4" />{editingField ? 'Αποθήκευση' : 'Δημιουργία'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewField(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getCropById(viewField.cropTypeId)?.icon}</span>
                <div>
                  <h2 className="text-lg" style={{ fontWeight: 700 }}>{viewField.name}</h2>
                  <p className="text-sm text-gray-500">{getCropById(viewField.cropTypeId)?.name} · {viewField.acres} στρ.</p>
                </div>
              </div>
              <button onClick={() => setViewField(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {(() => {
                const fin = calculateFieldFinancials(viewField);
                return (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Παραγωγή',        value: `${fin.estimatedYield.toLocaleString('el-GR')} kg` },
                        { label: 'Ανά Στρέμμα',      value: `${fin.yieldPerAcre} kg` },
                        { label: 'Έσοδα',            value: `€${fin.estimatedRevenue.toLocaleString('el-GR')}`, color: '#2563eb' },
                        { label: 'Έξοδα',            value: `€${fin.estimatedCosts.toLocaleString('el-GR')}`,   color: '#d97706' },
                        { label: 'Κέρδος',           value: `€${fin.estimatedProfit.toLocaleString('el-GR')}`,  color: fin.estimatedProfit >= 0 ? '#059669' : '#dc2626' },
                        { label: 'Περιθώριο Κέρδους', value: `${fin.profitMargin}%` },
                      ].map(s => (
                        <div key={s.label} className="bg-gray-50 rounded-xl p-3">
                          <div className="text-xs text-gray-500">{s.label}</div>
                          <div className="text-sm mt-0.5" style={{ fontWeight: 700, color: s.color ?? '#111827' }}>{s.value}</div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50">
                      <div className="text-xs" style={{ fontWeight: 600, marginBottom: '4px' }}>Σημειώσεις</div>
                      <p className="text-sm text-gray-600">{viewField.notes || '—'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-gray-500">Σπορά:</span> <span style={{ fontWeight: 500 }}>{viewField.plantingDate ? new Date(viewField.plantingDate).toLocaleDateString('el-GR') : '—'}</span></div>
                      <div><span className="text-gray-500">Συγκομιδή:</span> <span style={{ fontWeight: 500 }}>{viewField.expectedHarvestDate ? new Date(viewField.expectedHarvestDate).toLocaleDateString('el-GR') : '—'}</span></div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setDeleteConfirm(null); setDeleteBlockMsg(''); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
            {deleteBlockMsg ? (
              <>
                <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-7 h-7 text-amber-600" />
                </div>
                <h3 className="text-lg mb-2" style={{ fontWeight: 700 }}>Αδύνατη Διαγραφή</h3>
                <p className="text-sm text-gray-500 mb-6">{deleteBlockMsg}</p>
                <button onClick={() => { setDeleteConfirm(null); setDeleteBlockMsg(''); }} className="w-full py-2.5 rounded-xl text-white text-sm" style={{ background: '#d97706', fontWeight: 600 }}>Κατανοητό</button>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-7 h-7 text-red-600" />
                </div>
                <h3 className="text-lg mb-2" style={{ fontWeight: 700 }}>Διαγραφή Χωραφιού;</h3>
                <p className="text-sm text-gray-500 mb-6">Είστε σίγουροι ότι θέλετε να διαγράψετε το χωράφι; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.</p>
                <div className="flex gap-3">
                  <button onClick={() => { setDeleteConfirm(null); setDeleteBlockMsg(''); }} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm" style={{ fontWeight: 500 }}>Άκυρο</button>
                  <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm" style={{ fontWeight: 600 }}>Διαγραφή</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
