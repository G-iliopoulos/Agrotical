import React from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import {
  fields, tasks, recommendations, weatherData, monthlyProductionData,
  cropDistributionData, getFarmerTotals, getFieldsByFarmer, calculateFieldFinancials,
  getCropById
} from '../../data/mockData';
import {
  TrendingUp, TrendingDown, Map, ListChecks, MessageSquare, Leaf,
  ArrowRight, DropletIcon, AlertTriangle, CheckCircle2, Clock
} from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';

function StatCard({ title, value, sub, icon: Icon, trend, color, bgColor }: {
  title: string; value: string; sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: { value: number; positive: boolean };
  color: string; bgColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: bgColor }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${trend.positive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`} style={{ fontWeight: 600 }}>
            {trend.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className="text-2xl mb-1" style={{ fontWeight: 700, color: '#111827' }}>{value}</div>
      <div className="text-sm text-gray-500">{title}</div>
      {sub && <div className="text-xs mt-1" style={{ color, fontWeight: 500 }}>{sub}</div>}
    </div>
  );
}

function HealthBadge({ score }: { score: number }) {
  const color = score >= 85 ? '#10b981' : score >= 65 ? '#f59e0b' : '#ef4444';
  const bg    = score >= 85 ? '#d1fae5' : score >= 65 ? '#fef3c7' : '#fee2e2';
  const label = score >= 85 ? 'Άριστο'  : score >= 65 ? 'Καλό'    : 'Προσοχή';
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: bg, color, fontWeight: 600 }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {label} ({score})
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    active:    { label: 'Ενεργό',       color: '#059669', bg: '#d1fae5' },
    harvested: { label: 'Θεριστό',      color: '#d97706', bg: '#fef3c7' },
    fallow:    { label: 'Αγρανάπαυση', color: '#6b7280', bg: '#f3f4f6' },
    preparing: { label: 'Προετοιμασία', color: '#2563eb', bg: '#dbeafe' },
  };
  const { label, color, bg } = map[status] ?? map.active;
  return <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: bg, color, fontWeight: 600 }}>{label}</span>;
}

export default function FarmerDashboard() {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  const totals   = getFarmerTotals(currentUser.id);
  const myFields = getFieldsByFarmer(currentUser.id);
  const myTasks  = tasks.filter(t => t.farmerId === currentUser.id && !t.completed);
  const myRecs   = recommendations.filter(r => r.farmerId === currentUser.id && r.status === 'pending');
  const today    = weatherData[0];

  const taskTypeLabels: Record<string, string> = {
    watering: '💧 Άρδευση', fertilizing: '🌱 Λίπανση', pesticide: '🧪 Φυτοπροστασία',
    harvesting: '🌾 Συγκομιδή', plowing: '🚜 Άροτρο', pruning: '✂️ Κλάδεμα', other: '📋 Άλλο',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl" style={{ fontWeight: 700, color: '#111827' }}>
            Καλησπέρα, {currentUser.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">Εδώ είναι η συνολική εικόνα των καλλιεργειών σου σήμερα</p>
        </div>
        <div className="hidden sm:flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100">
          <span className="text-2xl">{today.icon}</span>
          <div>
            <div className="text-sm" style={{ fontWeight: 600 }}>{today.condition}</div>
            <div className="text-xs text-gray-500">{today.temp}°C · Υγρ. {today.humidity}%</div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Συνολικά Στρέμματα"   value={`${totals.totalAcres}`}                                  sub={`${totals.fieldCount} χωράφια`}                    icon={Map}         color="#2d6a4f" bgColor="#d1fae5" trend={{ value: 5,  positive: true }} />
        <StatCard title="Αναμενόμενα Έσοδα"    value={`€${totals.totalRevenue.toLocaleString('el-GR')}`}       sub="Εκτίμηση έτους"                                   icon={TrendingUp}   color="#0284c7" bgColor="#dbeafe" trend={{ value: 12, positive: true }} />
        <StatCard title="Αναμενόμενα Έξοδα"    value={`€${totals.totalCosts.toLocaleString('el-GR')}`}         sub="Εκτίμηση έτους"                                   icon={TrendingDown} color="#d97706" bgColor="#fef3c7" />
        <StatCard title="Εκτιμώμενο Κέρδος"    value={`€${totals.totalProfit.toLocaleString('el-GR')}`}        sub={`Μέσο περιθώριο ${totals.avgProfitMargin}%`}       icon={Leaf}         color={totals.totalProfit >= 0 ? '#059669' : '#dc2626'} bgColor={totals.totalProfit >= 0 ? '#d1fae5' : '#fee2e2'} trend={{ value: totals.avgProfitMargin, positive: totals.totalProfit >= 0 }} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base" style={{ fontWeight: 600, color: '#111827' }}>Μηνιαία Εκτίμηση Εσόδων / Εξόδων</h3>
            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">2026</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyProductionData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#40916c" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#40916c" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `€${v}`} />
              <Tooltip formatter={(v: number) => [`€${v.toLocaleString('el-GR')}`, '']} />
              <Legend />
              <Area type="monotone" dataKey="εσοδα" name="Έσοδα" stroke="#40916c" strokeWidth={2} fill="url(#revGrad)" />
              <Area type="monotone" dataKey="εξοδα" name="Έξοδα" stroke="#f59e0b" strokeWidth={2} fill="url(#costGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h3 className="text-base mb-4" style={{ fontWeight: 600, color: '#111827' }}>Κατανομή Καλλιεργειών</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={cropDistributionData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                {cropDistributionData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v}%`, 'Ποσοστό']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {cropDistributionData.map(d => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-xs text-gray-600">{d.name}</span>
                </div>
                <span className="text-xs" style={{ fontWeight: 600 }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="text-base" style={{ fontWeight: 600, color: '#111827' }}>Τα Χωράφια μου</h3>
            <Link to="/farmer/fields" className="text-sm flex items-center gap-1 hover:underline" style={{ color: '#40916c', fontWeight: 500 }}>
              Όλα <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {myFields.slice(0, 4).map(field => {
              const crop = getCropById(field.cropTypeId);
              const fin  = calculateFieldFinancials(field);
              return (
                <Link to="/farmer/fields" key={field.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="text-2xl w-10 text-center">{crop?.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm" style={{ fontWeight: 600, color: '#111827' }}>{field.name}</span>
                      <StatusBadge status={field.status} />
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{field.acres} στρ · {crop?.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm" style={{ fontWeight: 600, color: fin.estimatedProfit >= 0 ? '#059669' : '#dc2626' }}>
                      €{fin.estimatedProfit.toLocaleString('el-GR')}
                    </div>
                    <HealthBadge score={field.healthScore} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-sm" style={{ fontWeight: 600, color: '#111827' }}>Εκκρεμείς Εργασίες</h3>
              <Link to="/farmer/tasks" className="text-xs" style={{ color: '#40916c', fontWeight: 500 }}>Όλες</Link>
            </div>
            <div className="p-3 space-y-2">
              {myTasks.slice(0, 3).map(task => (
                <div key={task.id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-50">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-base flex-shrink-0" style={{ background: '#fff' }}>
                    {taskTypeLabels[task.type]?.split(' ')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs" style={{ fontWeight: 600, color: '#111827' }}>{task.title}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(task.dueDate).toLocaleDateString('el-GR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-sm flex items-center gap-2" style={{ fontWeight: 600, color: '#111827' }}>
                Συστάσεις Γεωπόνου
                {myRecs.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-xs text-white" style={{ background: '#ef4444', fontWeight: 700 }}>{myRecs.length}</span>
                )}
              </h3>
              <Link to="/farmer/recommendations" className="text-xs" style={{ color: '#40916c', fontWeight: 500 }}>Όλες</Link>
            </div>
            <div className="p-3 space-y-2">
              {myRecs.slice(0, 2).map(rec => {
                const priorColor = rec.priority === 'urgent' ? '#ef4444' : rec.priority === 'high' ? '#f59e0b' : '#6b7280';
                return (
                  <div key={rec.id} className="p-2.5 rounded-lg border-l-4" style={{ borderLeftColor: priorColor, background: '#fafafa' }}>
                    <div className="text-xs" style={{ fontWeight: 600, color: '#111827' }}>{rec.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{rec.content.substring(0, 60)}...</div>
                  </div>
                );
              })}
              {myRecs.length === 0 && (
                <div className="text-center py-4 text-xs text-gray-400">
                  <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-green-400" />
                  Καμία εκκρεμής σύσταση
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
