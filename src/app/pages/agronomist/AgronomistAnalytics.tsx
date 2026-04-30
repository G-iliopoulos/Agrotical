import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { users, fields, calculateFieldFinancials, getCropById } from '../../data/mockData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ScatterChart, Scatter,
  LineChart, Line, Legend, Cell
} from 'recharts';

export default function AgronomistAnalytics() {
  const { currentUser } = useAuth();
  if (!currentUser || currentUser.role !== 'agronomist') return null;

  const myFarmerIds = (currentUser as any).assignedFarmers ?? [];
  const myFields = fields.filter(f => myFarmerIds.includes(f.farmerId));

  const fieldData = myFields.map(f => {
    const fin = calculateFieldFinancials(f);
    const crop = getCropById(f.cropTypeId);
    const farmer = users.find(u => u.id === f.farmerId);
    return {
      name: f.name.split(' ')[1] ?? f.name,
      fullName: f.name,
      Εσοδα: fin.estimatedRevenue,
      Εξοδα: fin.estimatedCosts,
      Κερδος: fin.estimatedProfit,
      Παραγωγη: fin.estimatedYield,
      Υγεια: f.healthScore,
      Στρ: f.acres,
      crop: crop?.name,
      farmer: farmer?.name,
      color: crop?.color ?? '#40916c',
      margin: fin.profitMargin,
    };
  });

  const cropBreakdown = (() => {
    const map: Record<string, { count: number; acres: number; revenue: number }> = {};
    myFields.forEach(f => {
      const crop = getCropById(f.cropTypeId);
      if (!crop) return;
      if (!map[crop.name]) map[crop.name] = { count: 0, acres: 0, revenue: 0 };
      map[crop.name].count++;
      map[crop.name].acres += f.acres;
      map[crop.name].revenue += calculateFieldFinancials(f).estimatedRevenue;
    });
    return Object.entries(map).map(([name, entry]) => ({
      name,
      Χωραφια: entry.count,
      Στρεμματα: entry.acres,
      Εσοδα: entry.revenue,
    }));
  })();

  const radarData = [
    { metric: 'Υγεια', value: Math.round(myFields.reduce((a, f) => a + f.healthScore, 0) / (myFields.length || 1)) },
    { metric: 'Κερδοφορια', value: Math.min(100, Math.round(fieldData.reduce((a, f) => a + f.margin, 0) / (fieldData.length || 1) * 2)) },
    { metric: 'Φροντιδα', value: Math.round(myFields.reduce((a, f) => a + (f.careLevel === 'high' ? 100 : f.careLevel === 'medium' ? 65 : 35), 0) / (myFields.length || 1)) },
    { metric: 'Ποικιλομορφια', value: Math.min(100, cropBreakdown.length * 20) },
    { metric: 'Παραγωγη', value: 75 },
    { metric: 'Αποδοτικοτητα', value: 80 },
  ];

  const totalRevenue = fieldData.reduce((a, f) => a + f.Εσοδα, 0);
  const totalProfit  = fieldData.reduce((a, f) => a + f.Κερδος, 0);
  const avgHealth    = fieldData.length > 0 ? Math.round(fieldData.reduce((a, f) => a + f.Υγεια, 0) / fieldData.length) : 0;

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl" style={{ fontWeight: 700, color: '#111827' }}>Αναλύσεις &amp; Στατιστικά</h1>
        <p className="text-sm text-gray-500 mt-1">Συγκεντρωτική ανάλυση όλων των καλλιεργειών</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Χωράφια',    value: myFields.length,                              unit: '',  c: '#0284c7', bg: '#dbeafe' },
          { label: 'Μέση Υγεία', value: avgHealth,                                    unit: '%', c: avgHealth >= 80 ? '#059669' : '#d97706', bg: avgHealth >= 80 ? '#d1fae5' : '#fef3c7' },
          { label: 'Συν. Έσοδα', value: '€' + totalRevenue.toLocaleString('el-GR'), unit: '', c: '#2563eb', bg: '#dbeafe' },
          { label: 'Συν. Κέρδος', value: '€' + totalProfit.toLocaleString('el-GR'),  unit: '', c: totalProfit >= 0 ? '#059669' : '#dc2626', bg: '#d1fae5' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="text-2xl" style={{ fontWeight: 700, color: s.c }}>{s.value}{s.unit}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm mb-4" style={{ fontWeight: 600, color: '#111827' }}>Εσοδα ανά Χωράφι</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={fieldData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => '€' + v} />
              <Tooltip formatter={(v: number) => ['€' + v.toLocaleString('el-GR'), '']} />
              <Bar dataKey="Εσοδα" radius={[4, 4, 0, 0]}>
                {fieldData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm mb-4" style={{ fontWeight: 600, color: '#111827' }}>Συνολική Αξιολόγηση</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#f3f4f6" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
              <Radar dataKey="value" stroke="#0284c7" fill="#0284c7" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm mb-4" style={{ fontWeight: 600, color: '#111827' }}>Ανάλυση ανά Είδος Καλλιέργειας</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cropBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => '€' + v} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={70} />
              <Tooltip formatter={(v: number) => ['€' + v.toLocaleString('el-GR'), 'Εσοδα']} />
              <Bar dataKey="Εσοδα" fill="#0284c7" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm mb-4" style={{ fontWeight: 600, color: '#111827' }}>Κατάταξη Υγείας Χωραφιών</h3>
          <div className="space-y-3">
            {[...fieldData].sort((a, b) => b.Υγεια - a.Υγεια).map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-5 text-xs text-gray-500 text-right" style={{ fontWeight: 600 }}>{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs" style={{ fontWeight: 500 }}>{f.fullName}</span>
                    <span className="text-xs" style={{ fontWeight: 700, color: f.Υγεια >= 80 ? '#059669' : '#d97706' }}>{f.Υγεια}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full">
                    <div className="h-1.5 rounded-full" style={{ width: f.Υγεια + '%', background: f.Υγεια >= 80 ? '#10b981' : '#f59e0b' }} />
                  </div>
                </div>
                <span className="text-xs text-gray-400">{f.crop}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
