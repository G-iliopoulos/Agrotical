import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getFieldsByFarmer, calculateFieldFinancials, getCropById, getFarmerTotals } from '../../data/mockData';
import { FileText, Download, TrendingUp, TrendingDown, Leaf, Map, BarChart3, CheckCircle2 } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

export default function FarmerReports() {
  const { currentUser } = useAuth();
  const [downloaded, setDownloaded] = useState(false);

  if (!currentUser) return null;

  const myFields = getFieldsByFarmer(currentUser.id);
  const totals   = getFarmerTotals(currentUser.id);

  const fieldComparison = myFields.map(f => {
    const fin  = calculateFieldFinancials(f);
    const crop = getCropById(f.cropTypeId);
    return {
      name:   f.name.length > 10 ? f.name.substring(0, 10) + '...' : f.name,
      Έσοδα:  fin.estimatedRevenue,
      Έξοδα:  fin.estimatedCosts,
      Κέρδος: Math.max(0, fin.estimatedProfit),
      color:  crop?.color ?? '#40916c',
      acres:  f.acres,
    };
  });

  const radarData = myFields.slice(0, 4).map(f => {
    const fin  = calculateFieldFinancials(f);
    const crop = getCropById(f.cropTypeId);
    return {
      field:      f.name.split(' ')[1] ?? f.name,
      Απόδοση:   Math.min(100, fin.yieldPerAcre / 50),
      Κερδοφορία: Math.max(0, fin.profitMargin),
      Υγεία:     f.healthScore,
      Φροντίδα:  f.careLevel === 'high' ? 100 : f.careLevel === 'medium' ? 65 : 35,
    };
  });

  // Rankings sorted by profit
  const ranked = [...myFields].map(f => {
    const fin = calculateFieldFinancials(f);
    return { field: f, fin, crop: getCropById(f.cropTypeId) };
  }).sort((a, b) => b.fin.estimatedProfit - a.fin.estimatedProfit);

  const handleDownload = () => {
    setDownloaded(true);
    const headers = ['Χωράφι', 'Καλλιέργεια', 'Στρέμματα', 'Τύπος Εδάφους', 'Άρδευση', 'Φροντίδα', 'Παραγωγή (kg)', 'Έσοδα (€)', 'Έξοδα (€)', 'Κέρδος (€)', 'Margin %'];
    const rows = ranked.map(({ field, fin, crop }) => [
      field.name, crop?.name ?? '', field.acres, field.soilType, field.irrigationType,
      field.careLevel === 'high' ? 'Υψηλή' : field.careLevel === 'medium' ? 'Μέτρια' : 'Χαμηλή',
      fin.estimatedYield, fin.estimatedRevenue, fin.estimatedCosts, fin.estimatedProfit, fin.profitMargin + '%',
    ]);
    const csvContent = [
      `Αναφορά Agrotical — ${new Date().toLocaleDateString('el-GR')}`,
      '',
      headers.join(','),
      ...rows.map(r => r.join(',')),
      '',
      `Σύνολο,,${totals.totalAcres},,,,${totals.totalYield},${totals.totalRevenue},${totals.totalCosts},${totals.totalProfit},${totals.avgProfitMargin}%`,
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `agrotical-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl" style={{ fontWeight: 700, color: '#111827' }}>Αναφορές & Σύγκριση</h1>
          <p className="text-sm text-gray-500 mt-1">Συγκεντρωτική ανάλυση απόδοσης σεζόν 2026</p>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm transition-all hover:shadow-md"
          style={{ background: downloaded ? '#059669' : 'linear-gradient(135deg, #2d6a4f, #40916c)', fontWeight: 600 }}
        >
          {downloaded ? <CheckCircle2 className="w-4 h-4" /> : <Download className="w-4 h-4" />}
          {downloaded ? 'Έτοιμο!' : 'Λήψη CSV'}
        </button>
      </div>

      {/* Summary KPIs — από getFarmerTotals() */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Συν. Χωράφια',  value: totals.fieldCount,                              unit: 'χωράφια', icon: Map,      c: '#2d6a4f', bg: '#d1fae5' },
          { label: 'Συν. Στρέμματα', value: totals.totalAcres,                             unit: 'στρ.',    icon: Leaf,     c: '#059669', bg: '#d1fae5' },
          { label: 'Συν. Παραγωγή', value: `${totals.totalYield.toLocaleString('el-GR')}`, unit: 'kg',      icon: BarChart3, c: '#2563eb', bg: '#dbeafe' },
          { label: 'Εκτ. Κέρδος',   value: `€${totals.totalProfit.toLocaleString('el-GR')}`, unit: '',   icon: TrendingUp, c: '#059669', bg: '#d1fae5' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
              <s.icon className="w-4 h-4" style={{ color: s.c }} />
            </div>
            <div className="text-xl" style={{ fontWeight: 700, color: '#111827' }}>
              {s.value} <span className="text-sm text-gray-400">{s.unit}</span>
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm mb-4" style={{ fontWeight: 600, color: '#111827' }}>Σύγκριση Εσόδων ανά Χωράφι</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={fieldComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `€${v}`} />
              <Tooltip formatter={(v: number) => [`€${v.toLocaleString('el-GR')}`, '']} />
              <Bar dataKey="Έσοδα" radius={[4, 4, 0, 0]}>
                {fieldComparison.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm mb-4" style={{ fontWeight: 600, color: '#111827' }}>Αξιολόγηση Χωραφιών (Radar)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#f3f4f6" />
              <PolarAngleAxis dataKey="field" tick={{ fontSize: 10 }} />
              <Radar name="Κερδοφορία" dataKey="Κερδοφορία" stroke="#40916c" fill="#40916c" fillOpacity={0.3} />
              <Radar name="Υγεία"      dataKey="Υγεία"      stroke="#0284c7" fill="#0284c7" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ranking Table */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-sm" style={{ fontWeight: 600, color: '#111827' }}>Κατάταξη Χωραφιών βάσει Κερδοφορίας</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['#', 'Χωράφι', 'Καλλιέργεια', 'Στρ.', 'Παραγωγή', 'Έσοδα', 'Έξοδα', 'Κέρδος', 'Margin'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 whitespace-nowrap" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ranked.map(({ field, fin, crop }, i) => (
                <tr key={field.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{
                      background: i === 0 ? '#f59e0b' : i === 1 ? '#6b7280' : i === 2 ? '#cd7c2f' : '#e5e7eb',
                      color: i < 3 ? 'white' : '#6b7280',
                      fontWeight: 700,
                    }}>{i + 1}</span>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ fontWeight: 600 }}>{field.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{crop?.icon} {crop?.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{field.acres}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{fin.estimatedYield.toLocaleString('el-GR')} kg</td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#2563eb', fontWeight: 600 }}>€{fin.estimatedRevenue.toLocaleString('el-GR')}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#d97706', fontWeight: 600 }}>€{fin.estimatedCosts.toLocaleString('el-GR')}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: fin.estimatedProfit >= 0 ? '#059669' : '#dc2626', fontWeight: 700 }}>€{fin.estimatedProfit.toLocaleString('el-GR')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full w-16">
                        <div className="h-1.5 rounded-full" style={{ width: `${Math.max(0, fin.profitMargin)}%`, background: '#40916c' }} />
                      </div>
                      <span className="text-xs" style={{ fontWeight: 600, color: '#111827' }}>{fin.profitMargin}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conclusions — dynamic text από getFarmerTotals() */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100 p-5">
        <h3 className="text-sm mb-3" style={{ fontWeight: 600, color: '#1b4332' }}>📊 Συμπεράσματα Σεζόν</h3>
        <div className="space-y-2">
          {[
            `Το καλύτερο χωράφι είναι το "${ranked[0]?.field.name}" με εκτιμώμενο κέρδος €${ranked[0]?.fin.estimatedProfit.toLocaleString('el-GR')}.`,
            `Συνολική παραγωγή: ${totals.totalYield.toLocaleString('el-GR')} kg από ${totals.totalAcres} στρέμματα (${Math.round(totals.totalYield / totals.totalAcres)} kg/στρ. μέσος όρος).`,
            `Το μέσο περιθώριο κέρδους είναι ${totals.avgProfitMargin}% — ${totals.avgProfitMargin > 25 ? 'πολύ καλό αποτέλεσμα!' : totals.avgProfitMargin > 10 ? 'ικανοποιητικό αποτέλεσμα.' : 'υπάρχουν περιθώρια βελτίωσης.'}`,
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-green-800">
              <span style={{ fontWeight: 600 }}>→</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
