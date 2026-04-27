import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getFieldsByFarmer, calculateFieldFinancials, getCropById, monthlyProductionData } from '../../data/mockData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Leaf, BarChart3, ArrowUpRight } from 'lucide-react';

export default function FarmerFinancials() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'perfield' | 'monthly'>('overview');

  if (!currentUser) return null;

  const myFields = getFieldsByFarmer(currentUser.id);

  const totals = myFields.reduce((acc, f) => {
    const fin = calculateFieldFinancials(f);
    return {
      revenue: acc.revenue + fin.estimatedRevenue,
      costs:   acc.costs   + fin.estimatedCosts,
      profit:  acc.profit  + fin.estimatedProfit,
      yield:   acc.yield   + fin.estimatedYield,
    };
  }, { revenue: 0, costs: 0, profit: 0, yield: 0 });

  const perFieldData = myFields.map(f => {
    const fin  = calculateFieldFinancials(f);
    const crop = getCropById(f.cropTypeId);
    return {
      name:     f.name.length > 12 ? f.name.substring(0, 12) + '...' : f.name,
      fullName: f.name,
      εσοδα:    fin.estimatedRevenue,
      εξοδα:    fin.estimatedCosts,
      κερδος:   fin.estimatedProfit,
      παραγωγη: fin.estimatedYield,
      color:    crop?.color ?? '#40916c',
      crop:     crop?.name,
      acres:    f.acres,
      margin:   fin.profitMargin,
    };
  });

  const pieData = perFieldData.map(f => ({
    name:  f.fullName,
    value: Math.max(f.εσοδα, 0),
    color: f.color,
  }));

  const tabs = [
    { key: 'overview', label: 'Συνολική Εικόνα' },
    { key: 'perfield', label: 'Ανά Χωράφι' },
    { key: 'monthly',  label: 'Μηνιαία' },
  ] as const;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl" style={{ fontWeight: 700, color: '#111827' }}>Οικονομική Επισκόπηση</h1>
        <p className="text-sm text-gray-500 mt-1">Εκτίμηση εσόδων, εξόδων και κέρδους για τη σεζόν 2026</p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Αναμ. Έσοδα',   value: `€${totals.revenue.toLocaleString('el-GR')}`, icon: TrendingUp,   color: '#2563eb', bg: '#dbeafe', sub: 'Συνολικά εκτιμώμενα' },
          { label: 'Συν. Έξοδα',    value: `€${totals.costs.toLocaleString('el-GR')}`,   icon: TrendingDown, color: '#d97706', bg: '#fef3c7', sub: 'Λειτουργικά κόστη' },
          { label: 'Καθαρό Κέρδος', value: `€${totals.profit.toLocaleString('el-GR')}`,  icon: DollarSign,   color: totals.profit >= 0 ? '#059669' : '#dc2626', bg: totals.profit >= 0 ? '#d1fae5' : '#fee2e2', sub: `Περιθώριο ${totals.revenue > 0 ? Math.round((totals.profit / totals.revenue) * 100) : 0}%` },
          { label: 'Συν. Παραγωγή', value: `${totals.yield.toLocaleString('el-GR')} kg`, icon: Leaf,          color: '#2d6a4f', bg: '#d1fae5', sub: 'Εκτίμηση σεζόν' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div className="text-2xl mb-1" style={{ fontWeight: 700, color: '#111827' }}>{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
            <div className="text-xs mt-1" style={{ color: s.color, fontWeight: 500 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Profit Margin Bar */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm" style={{ fontWeight: 600, color: '#111827' }}>Συνολικό Περιθώριο Κέρδους</span>
          <span className="text-sm" style={{ fontWeight: 700, color: '#059669' }}>
            {totals.revenue > 0 ? Math.round((totals.profit / totals.revenue) * 100) : 0}%
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.max(0, Math.min(100, totals.revenue > 0 ? (totals.profit / totals.revenue) * 100 : 0))}%`,
              background: 'linear-gradient(90deg, #40916c, #52b788)',
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0%</span><span>50%</span><span>100%</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 py-3.5 text-sm transition-colors ${activeTab === t.key ? 'border-b-2 text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
              style={{ fontWeight: activeTab === t.key ? 600 : 400, borderBottomColor: activeTab === t.key ? '#40916c' : 'transparent' }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm mb-4" style={{ fontWeight: 600, color: '#111827' }}>Κατανομή Εσόδων ανά Χωράφι</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={85} paddingAngle={2} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`€${v.toLocaleString('el-GR')}`, 'Έσοδα']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h3 className="text-sm mb-4" style={{ fontWeight: 600, color: '#111827' }}>Σύγκριση Εσόδων vs Εξόδων</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={perFieldData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `€${v}`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                    <Tooltip formatter={(v: number) => [`€${v.toLocaleString('el-GR')}`, '']} />
                    <Legend />
                    <Bar dataKey="εσοδα" name="Έσοδα" fill="#40916c" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="εξοδα" name="Έξοδα" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Per Field Tab */}
          {activeTab === 'perfield' && (
            <div className="space-y-3">
              {perFieldData.map((f, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: f.color }} />
                      <span className="text-sm" style={{ fontWeight: 600 }}>{f.fullName}</span>
                      <span className="text-xs text-gray-500">({f.crop} · {f.acres} στρ.)</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{
                      background: f.margin >= 30 ? '#d1fae5' : f.margin >= 10 ? '#fef3c7' : '#fee2e2',
                      color:      f.margin >= 30 ? '#059669' : f.margin >= 10 ? '#d97706' : '#dc2626',
                      fontWeight: 600
                    }}>
                      <ArrowUpRight className="w-3 h-3" />
                      {f.margin}% margin
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: 'Παραγωγή', value: `${f.παραγωγη.toLocaleString('el-GR')} kg`, c: '#111827' },
                      { label: 'Έσοδα',    value: `€${f.εσοδα.toLocaleString('el-GR')}`,       c: '#2563eb' },
                      { label: 'Έξοδα',    value: `€${f.εξοδα.toLocaleString('el-GR')}`,       c: '#d97706' },
                      { label: 'Κέρδος',   value: `€${f.κερδος.toLocaleString('el-GR')}`,      c: f.κερδος >= 0 ? '#059669' : '#dc2626' },
                    ].map(s => (
                      <div key={s.label} className="bg-gray-50 rounded-lg p-2.5">
                        <div className="text-xs text-gray-500">{s.label}</div>
                        <div className="text-sm" style={{ fontWeight: 700, color: s.c }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(100, f.margin)}%`, background: f.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Monthly Tab */}
          {activeTab === 'monthly' && (
            <div>
              <h3 className="text-sm mb-4" style={{ fontWeight: 600, color: '#111827' }}>Μηνιαία Εκτίμηση Ταμειακής Ροής</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyProductionData}>
                  <defs>
                    <linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#40916c" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#40916c" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `€${v}`} />
                  <Tooltip formatter={(v: number) => [`€${v.toLocaleString('el-GR')}`, '']} />
                  <Legend />
                  <Area type="monotone" dataKey="εσοδα" name="Έσοδα" stroke="#40916c" strokeWidth={2.5} fill="url(#rGrad)" />
                  <Area type="monotone" dataKey="εξοδα" name="Έξοδα" stroke="#f59e0b" strokeWidth={2.5} fill="url(#cGrad)" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { label: 'Υψηλότερος Μήνας',  value: 'Ιούλιος',   sub: '€18.000 έσοδα' },
                  { label: 'Χαμηλότερος Μήνας', value: 'Ιανουάριος', sub: '€2.400 έξοδα' },
                  { label: 'Μέσος Μήνας',        value: '€5.800',    sub: 'ανά μήνα' },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className="text-xs text-gray-500">{s.label}</div>
                    <div className="text-sm mt-1" style={{ fontWeight: 700, color: '#111827' }}>{s.value}</div>
                    <div className="text-xs text-gray-400">{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
