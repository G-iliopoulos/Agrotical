import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { users, fields, getCropById, calculateFieldFinancials } from '../../data/mockData';
import { Search, Map, Filter, Activity } from 'lucide-react';

export default function AgronomistFields() {
  const { currentUser } = useAuth();
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterHealth, setFilterHealth] = useState('all');

  if (!currentUser || currentUser.role !== 'agronomist') return null;

  const myFarmerIds = (currentUser as any).assignedFarmers ?? [];
  const myFields    = fields.filter(f => myFarmerIds.includes(f.farmerId));

  const filtered = myFields.filter(f => {
    const crop        = getCropById(f.cropTypeId);
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) || crop?.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || f.status === filterStatus;
    const matchHealth = filterHealth === 'all' ||
      (filterHealth === 'good'   && f.healthScore >= 80) ||
      (filterHealth === 'medium' && f.healthScore >= 65 && f.healthScore < 80) ||
      (filterHealth === 'poor'   && f.healthScore < 65);
    return matchSearch && matchStatus && matchHealth;
  });

  const statusMap: Record<string, { label: string; color: string; bg: string }> = {
    active:    { label: 'Ενεργό',       color: '#059669', bg: '#d1fae5' },
    preparing: { label: 'Προετοιμασία', color: '#2563eb', bg: '#dbeafe' },
    harvested: { label: 'Θεριστό',      color: '#d97706', bg: '#fef3c7' },
    fallow:    { label: 'Αγρανάπαυση', color: '#6b7280', bg: '#f3f4f6' },
  };

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl" style={{ fontWeight: 700, color: '#111827' }}>Χωράφια σε Monitoring</h1>
        <p className="text-sm text-gray-500 mt-1">{myFields.length} χωράφια · {myFields.reduce((a, f) => a + f.acres, 0)} στρ. συνολικά</p>
      </div>

      {/* Alert banner — poor health fields */}
      {myFields.filter(f => f.healthScore < 75).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <Activity className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <span className="text-sm" style={{ fontWeight: 600, color: '#991b1b' }}>
              {myFields.filter(f => f.healthScore < 75).length} χωράφια χρειάζονται προσοχή
            </span>
            <span className="text-xs text-red-600 ml-2">Δείκτης υγείας κάτω από 75%</span>
          </div>
        </div>
      )}

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Αναζήτηση..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none text-sm" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm">
          <option value="all">Όλες Καταστάσεις</option>
          <option value="active">Ενεργό</option>
          <option value="preparing">Προετοιμασία</option>
          <option value="harvested">Θεριστό</option>
          <option value="fallow">Αγρανάπαυση</option>
        </select>
        <select value={filterHealth} onChange={e => setFilterHealth(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm">
          <option value="all">Όλη η Υγεία</option>
          <option value="good">Άριστη (80%+)</option>
          <option value="medium">Καλή (65-80%)</option>
          <option value="poor">Προσοχή (&lt;65%)</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Χωράφι', 'Αγρότης', 'Καλλιέργεια', 'Στρ.', 'Κατάσταση', 'Υγεία', 'Αναμ. Έσοδα', 'Τελ. Επιθ.'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 whitespace-nowrap" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(field => {
                const crop   = getCropById(field.cropTypeId);
                const fin    = calculateFieldFinancials(field);
                const farmer = users.find(u => u.id === field.farmerId);
                const stat   = statusMap[field.status];
                return (
                  <tr key={field.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-sm" style={{ fontWeight: 600, color: '#111827' }}>{field.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Map className="w-3 h-3" />{field.location}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{farmer?.name}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-sm">
                        <span>{crop?.icon}</span>
                        <span className="text-gray-700">{crop?.name}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{field.acres}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: stat?.bg, color: stat?.color, fontWeight: 600 }}>
                        {stat?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full">
                          <div className="h-1.5 rounded-full" style={{
                            width: `${field.healthScore}%`,
                            background: field.healthScore >= 80 ? '#10b981' : field.healthScore >= 65 ? '#f59e0b' : '#ef4444',
                          }} />
                        </div>
                        <span className="text-xs" style={{
                          fontWeight: 700,
                          color: field.healthScore >= 80 ? '#059669' : field.healthScore >= 65 ? '#d97706' : '#dc2626',
                        }}>{field.healthScore}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ fontWeight: 600, color: '#2563eb' }}>
                      €{fin.estimatedRevenue.toLocaleString('el-GR')}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {field.lastInspection ? new Date(field.lastInspection).toLocaleDateString('el-GR') : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Map className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Δεν βρέθηκαν χωράφια</p>
          </div>
        )}
      </div>
    </div>
  );
}
