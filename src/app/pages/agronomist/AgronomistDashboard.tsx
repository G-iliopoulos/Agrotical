import React from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { users, fields, recommendations, calculateFieldFinancials, getCropById } from '../../data/mockData';
import { Users, Map, MessageSquare, AlertTriangle, TrendingUp, CheckCircle2, Clock, ArrowRight, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AgronomistDashboard() {
  const { currentUser } = useAuth();
  if (!currentUser || currentUser.role !== 'agronomist') return null;

  const myFarmerIds = (currentUser as any).assignedFarmers ?? [];
  const myFarmers   = users.filter(u => myFarmerIds.includes(u.id));
  const myFields    = fields.filter(f => myFarmerIds.includes(f.farmerId));
  const myRecs      = recommendations.filter(r => r.agronomistId === currentUser.id);
  const pendingRecs = myRecs.filter(r => r.status === 'pending' || r.status === 'read');
  const appliedRecs = myRecs.filter(r => r.status === 'applied');

  const urgentFields    = myFields.filter(f => f.healthScore < 75);
  const fieldFinancials = myFields.map(f => {
    const fin  = calculateFieldFinancials(f);
    const crop = getCropById(f.cropTypeId);
    return { ...f, fin, crop };
  });

  const recentActivity = [
    { type: 'rec',     text: 'Στάλθηκε σύσταση λίπανσης στον Κωστόπουλο',        time: '2 ώρες',   color: '#059669' },
    { type: 'alert',   text: 'Χαμηλός δείκτης υγείας στο χωράφι Ξηρολάκκι',      time: '5 ώρες',   color: '#d97706' },
    { type: 'applied', text: 'Εφαρμόστηκε σύσταση άρδευσης (Αλεξίου)',            time: '1 ημέρα',  color: '#2563eb' },
    { type: 'check',   text: 'Επιθεώρηση χωραφιών Λάρισας ολοκληρώθηκε',          time: '2 ημέρες', color: '#7c3aed' },
  ];

  const farmerPerformance = myFarmers.map(farmer => {
    const farmerFields = myFields.filter(f => f.farmerId === farmer.id);
    const totalRevenue = farmerFields.reduce((acc, f) => acc + calculateFieldFinancials(f).estimatedRevenue, 0);
    const avgHealth    = farmerFields.length > 0
      ? Math.round(farmerFields.reduce((acc, f) => acc + f.healthScore, 0) / farmerFields.length)
      : 0;
    return {
      name:     farmer.name.split(' ')[1] ?? farmer.name,
      fullName: farmer.name,
      Έσοδα:    totalRevenue,
      Υγεία:    avgHealth,
      Χωράφια:  farmerFields.length,
    };
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl" style={{ fontWeight: 700, color: '#111827' }}>
          Καλησπέρα, {currentUser.name.split(' ').slice(-1)[0]}! 🔬
        </h1>
        <p className="text-gray-500 text-sm mt-1">Επισκόπηση των αγροτών και καλλιεργειών που παρακολουθείτε</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Αγρότες υπ' ευθύνη",    value: myFarmers.length,   icon: Users,         color: '#0284c7', bg: '#dbeafe', sub: 'Ενεργοί αγρότες' },
          { label: 'Χωράφια σε Monitoring', value: myFields.length,    icon: Map,           color: '#2d6a4f', bg: '#d1fae5', sub: `${myFields.reduce((a, f) => a + f.acres, 0)} στρ. συνολικά` },
          { label: 'Εκκρεμείς Συστάσεις',   value: pendingRecs.length, icon: MessageSquare, color: '#d97706', bg: '#fef3c7', sub: 'Αναμένουν εφαρμογή' },
          { label: 'Χωράφια σε Κίνδυνο',    value: urgentFields.length, icon: AlertTriangle, color: '#dc2626', bg: '#fee2e2', sub: 'Υγεία < 75' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-sm transition-shadow">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div className="text-3xl mb-1" style={{ fontWeight: 700, color: '#111827' }}>{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
            <div className="text-xs mt-1" style={{ color: s.color, fontWeight: 500 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts & Field Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Farmer Performance Bar Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm mb-4" style={{ fontWeight: 600, color: '#111827' }}>Απόδοση Αγροτών (Αναμ. Έσοδα)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={farmerPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `€${v}`} />
              <Tooltip formatter={(v: number) => [`€${v.toLocaleString('el-GR')}`, 'Έσοδα']} />
              <Bar dataKey="Έσοδα" fill="#0284c7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Field Health Bars */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm mb-4" style={{ fontWeight: 600, color: '#111827' }}>Κατάσταση Υγείας Χωραφιών</h3>
          <div className="space-y-3">
            {myFields.map(f => {
              const crop   = getCropById(f.cropTypeId);
              const farmer = users.find(u => u.id === f.farmerId);
              return (
                <div key={f.id} className="flex items-center gap-3">
                  <span className="text-xl">{crop?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs" style={{ fontWeight: 500, color: '#374151' }}>{f.name}</span>
                      <span className="text-xs" style={{ fontWeight: 700, color: f.healthScore >= 85 ? '#059669' : f.healthScore >= 65 ? '#d97706' : '#dc2626' }}>
                        {f.healthScore}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div className="h-1.5 rounded-full transition-all" style={{
                        width: `${f.healthScore}%`,
                        background: f.healthScore >= 85 ? '#10b981' : f.healthScore >= 65 ? '#f59e0b' : '#ef4444',
                      }} />
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{farmer?.name.split(' ')[1]}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row: Farmers list + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Farmers List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="text-sm" style={{ fontWeight: 600, color: '#111827' }}>Αγρότες μου</h3>
            <Link to="/agronomist/farmers" className="text-xs flex items-center gap-1" style={{ color: '#0284c7', fontWeight: 500 }}>
              Όλοι <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {myFarmers.map(farmer => {
              const farmerFields = myFields.filter(f => f.farmerId === farmer.id);
              const avgHealth    = farmerFields.length > 0
                ? Math.round(farmerFields.reduce((acc, f) => acc + f.healthScore, 0) / farmerFields.length)
                : 0;
              const totalRevenue = farmerFields.reduce((acc, f) => acc + calculateFieldFinancials(f).estimatedRevenue, 0);
              return (
                <div key={farmer.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: '#dbeafe' }}>👨‍🌾</div>
                  <div className="flex-1">
                    <div className="text-sm" style={{ fontWeight: 600 }}>{farmer.name}</div>
                    <div className="text-xs text-gray-500">{farmer.location} · {farmerFields.length} χωράφια</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm" style={{ fontWeight: 600, color: '#2563eb' }}>€{totalRevenue.toLocaleString('el-GR')}</div>
                    <div className="text-xs" style={{ color: avgHealth >= 80 ? '#059669' : '#d97706' }}>Υγεία: {avgHealth}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-sm" style={{ fontWeight: 600, color: '#111827' }}>Πρόσφατη Δραστηριότητα</h3>
          </div>
          <div className="p-4 space-y-3">
            {recentActivity.map((act, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: act.color }} />
                <div className="flex-1">
                  <p className="text-xs text-gray-700">{act.text}</p>
                  <span className="text-xs text-gray-400">{act.time} πριν</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
