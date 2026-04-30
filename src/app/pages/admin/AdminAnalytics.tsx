import React from 'react';
import { users, fields, recommendations, cropTypes, calculateFieldFinancials } from '../../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area } from 'recharts';

const monthlyGrowth = [
  { month: 'Σεπ', χρηστες: 2, χωραφια: 3 }, { month: 'Οκτ', χρηστες: 3, χωραφια: 5 },
  { month: 'Νοε', χρηστες: 4, χωραφια: 6 }, { month: 'Δεκ', χρηστες: 5, χωραφια: 6 },
  { month: 'Ιαν', χρηστες: 5, χωραφια: 7 }, { month: 'Φεβ', χρηστες: 6, χωραφια: 7 },
  { month: 'Μαρ', χρηστες: 7, χωραφια: 8 },
];

export default function AdminAnalytics() {
  const totalRevenue = fields.reduce((a, f) => a + calculateFieldFinancials(f).estimatedRevenue, 0);
  const totalProfit  = fields.reduce((a, f) => a + calculateFieldFinancials(f).estimatedProfit, 0);

  const cropUsage = cropTypes.map(crop => ({
    name: crop.icon + ' ' + crop.name,
    value: fields.filter(f => f.cropTypeId === crop.id).length,
    color: crop.color,
  })).filter(c => c.value > 0);

  const revenueByRole = [
    { name: 'Λάρισα',       value: fields.filter(f => ['farmer1'].includes(f.farmerId)).reduce((a, f) => a + calculateFieldFinancials(f).estimatedRevenue, 0) },
    { name: 'Θεσσαλονίκη', value: fields.filter(f => ['farmer2'].includes(f.farmerId)).reduce((a, f) => a + calculateFieldFinancials(f).estimatedRevenue, 0) },
    { name: 'Κρήτη',        value: fields.filter(f => ['farmer3'].includes(f.farmerId)).reduce((a, f) => a + calculateFieldFinancials(f).estimatedRevenue, 0) },
  ];

  const recStats = [
    { name: 'Εκκρεμείς',     value: recommendations.filter(r => r.status === 'pending').length,   color: '#3b82f6' },
    { name: 'Αναγνωσμένες', value: recommendations.filter(r => r.status === 'read').length,       color: '#7c3aed' },
    { name: 'Εφαρμόστηκαν', value: recommendations.filter(r => r.status === 'applied').length,    color: '#10b981' },
    { name: 'Απορρίφθηκαν', value: recommendations.filter(r => r.status === 'dismissed').length,  color: '#ef4444' },
  ];

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl" style={{ fontWeight: 700, color: '#111827' }}>Αναλύσεις Πλατφόρμας</h1>
        <p className="text-sm text-gray-500 mt-1">Στατιστικά χρήσης και απόδοσης</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Συν. Χρήστες',   value: users.length,                                              color: '#7c3aed', bg: '#ede9fe' },
          { label: 'Ενεργά Χωράφια', value: fields.filter(f => f.status === 'active').length,         color: '#059669', bg: '#d1fae5' },
          { label: 'Πλατφ. Έσοδα',   value: '€' + totalRevenue.toLocaleString('el-GR'),           color: '#2563eb', bg: '#dbeafe' },
          { label: 'Συστάσεις',       value: recommendations.length,                                   color: '#d97706', bg: '#fef3c7' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="text-2xl" style={{ fontWeight: 700, color: s.color }}>{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm mb-4" style={{ fontWeight: 600, color: '#111827' }}>Αύξηση Χρηστών &amp; Χωραφιών</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyGrowth}>
              <defs>
                <linearGradient id="uGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="χρηστες" name="Χρήστες" stroke="#7c3aed" fill="url(#uGrad)" strokeWidth={2} />
              <Line type="monotone" dataKey="χωραφια" name="Χωράφια" stroke="#40916c" strokeWidth={2} dot={{ r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm mb-4" style={{ fontWeight: 600, color: '#111827' }}>Δημοφιλέστερες Καλλιέργειες</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={cropUsage} cx="50%" cy="50%" outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, value }) => String(value)}>
                {cropUsage.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [v, 'Χωράφια']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm mb-4" style={{ fontWeight: 600, color: '#111827' }}>Αναμ. Έσοδα ανά Περιοχή</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueByRole}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => '€' + v} />
              <Tooltip formatter={(v: number) => ['€' + v.toLocaleString('el-GR'), 'Έσοδα']} />
              <Bar dataKey="value" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm mb-4" style={{ fontWeight: 600, color: '#111827' }}>Κατάσταση Συστάσεων</h3>
          <div className="space-y-3">
            {recStats.map(s => (
              <div key={s.name} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.color }} />
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-700">{s.name}</span>
                    <span className="text-sm" style={{ fontWeight: 700 }}>{s.value}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full">
                    <div className="h-1.5 rounded-full" style={{ width: (s.value / recommendations.length) * 100 + '%', background: s.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-green-50 rounded-xl text-sm text-green-700">
            📊 Ποσοστό εφαρμογής: <strong>{Math.round((recommendations.filter(r => r.status === 'applied').length / recommendations.length) * 100)}%</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
