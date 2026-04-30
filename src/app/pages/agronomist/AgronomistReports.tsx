import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { users, fields, recommendations, calculateFieldFinancials, getCropById } from '../../data/mockData';
import { FileText, Download, CheckCircle2, Users, Map, MessageSquare } from 'lucide-react';

export default function AgronomistReports() {
  const { currentUser } = useAuth();
  const [downloaded, setDownloaded] = useState<string | null>(null);

  if (!currentUser || currentUser.role !== 'agronomist') return null;
  const myFarmerIds = (currentUser as any).assignedFarmers ?? [];
  const myFarmers = users.filter(u => myFarmerIds.includes(u.id));
  const myFields = fields.filter(f => myFarmerIds.includes(f.farmerId));
  const myRecs = recommendations.filter(r => r.agronomistId === currentUser.id);

  const dl = (key: string) => { setDownloaded(key); setTimeout(() => setDownloaded(null), 2000); };

  const farmerSummaries = myFarmers.map(farmer => {
    const farmerFields = myFields.filter(f => f.farmerId === farmer.id);
    const totalRevenue = farmerFields.reduce((a, f) => a + calculateFieldFinancials(f).estimatedRevenue, 0);
    const totalProfit  = farmerFields.reduce((a, f) => a + calculateFieldFinancials(f).estimatedProfit, 0);
    const avgHealth    = farmerFields.length > 0 ? Math.round(farmerFields.reduce((a, f) => a + f.healthScore, 0) / farmerFields.length) : 0;
    const recs = myRecs.filter(r => r.farmerId === farmer.id);
    return { farmer, farmerFields, totalRevenue, totalProfit, avgHealth, recs };
  });

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl" style={{ fontWeight: 700, color: '#111827' }}>Αναφορές Γεωπόνου</h1>
        <p className="text-sm text-gray-500 mt-1">Δημιουργία και λήψη αναφορών για αγρότες</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { key: 'summary', title: 'Συνολική Αναφορά',     desc: 'Σύνοψη όλων των αγροτών και χωραφιών',               icon: FileText,     color: '#0284c7', bg: '#dbeafe' },
          { key: 'health',  title: 'Αναφορά Υγείας',       desc: 'Κατάσταση υγείας όλων των καλλιεργειών',              icon: Map,          color: '#059669', bg: '#d1fae5' },
          { key: 'recs',    title: 'Αναφορά Συστάσεων',    desc: myRecs.length + ' συστάσεις - ποσοστό εφαρμογής',     icon: MessageSquare, color: '#7c3aed', bg: '#ede9fe' },
        ].map(r => (
          <div key={r.key} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: r.bg }}>
              <r.icon className="w-5 h-5" style={{ color: r.color }} />
            </div>
            <h3 className="text-sm mb-1" style={{ fontWeight: 600 }}>{r.title}</h3>
            <p className="text-xs text-gray-500 mb-4">{r.desc}</p>
            <button onClick={() => dl(r.key)} className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm transition-all"
              style={{ background: downloaded === r.key ? '#d1fae5' : r.bg, color: downloaded === r.key ? '#059669' : r.color, fontWeight: 600 }}>
              {downloaded === r.key ? <><CheckCircle2 className="w-4 h-4" /> Ετοιμο!</> : <><Download className="w-4 h-4" /> Ληψη</>}
            </button>
          </div>
        ))}
      </div>

      <h2 className="text-base" style={{ fontWeight: 600, color: '#111827' }}>Αναφορές ανά Αγρότη</h2>
      <div className="space-y-4">
        {farmerSummaries.map(({ farmer, farmerFields, totalRevenue, totalProfit, avgHealth, recs }) => (
          <div key={farmer.id} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: '#dbeafe' }}>👨‍🌾</div>
                <div>
                  <h3 className="text-sm" style={{ fontWeight: 700 }}>{farmer.name}</h3>
                  <p className="text-xs text-gray-500">{farmer.location}</p>
                </div>
              </div>
              <button onClick={() => dl(farmer.id)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                style={{ background: downloaded === farmer.id ? '#d1fae5' : '#f0f9ff', color: downloaded === farmer.id ? '#059669' : '#0284c7', fontWeight: 600 }}>
                {downloaded === farmer.id ? <><CheckCircle2 className="w-3.5 h-3.5" /> Εσταλη</> : <><Download className="w-3.5 h-3.5" /> PDF</>}
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 mt-4">
              {[
                { label: 'Χωράφια',    value: farmerFields.length },
                { label: 'Αναμ. Εσοδα',  value: '€' + totalRevenue.toLocaleString('el-GR') },
                { label: 'Εκτ. Κερδος',  value: '€' + totalProfit.toLocaleString('el-GR') },
                { label: 'Μέση Υγεία', value: avgHealth + '%' },
              ].map(s => (
                <div key={s.label} className="bg-gray-50 rounded-xl p-2.5 text-center">
                  <div className="text-sm" style={{ fontWeight: 700, color: '#111827' }}>{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>

            {farmerFields.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {farmerFields.map(f => {
                  const crop = getCropById(f.cropTypeId);
                  const fin  = calculateFieldFinancials(f);
                  return (
                    <div key={f.id} className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-1.5">
                      <span>{crop?.icon}</span>
                      <span style={{ fontWeight: 500 }}>{f.name}</span>
                      <span className="text-gray-400">·</span>
                      <span>{f.acres} στρ.</span>
                      <span className="text-gray-400">·</span>
                      <span style={{ color: '#2563eb', fontWeight: 600 }}>€{fin.estimatedRevenue.toLocaleString('el-GR')}</span>
                      <span className="ml-auto" style={{ color: f.healthScore >= 80 ? '#059669' : '#d97706', fontWeight: 600 }}>
                        Υγεία: {f.healthScore}%
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {recs.length > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                📋 {recs.length} συστάσεις · {recs.filter(r => r.status === 'applied').length} εφαρμόστηκαν ({Math.round(recs.filter(r => r.status === 'applied').length / recs.length * 100)}%)
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
