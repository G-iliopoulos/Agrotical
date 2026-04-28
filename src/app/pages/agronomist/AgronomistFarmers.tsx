import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { users, fields, calculateFieldFinancials, getCropById, getFarmerTotals } from '../../data/mockData';
import { MapPin, Phone, Map, TrendingUp, Activity, ChevronDown, ChevronUp, X } from 'lucide-react';

export default function AgronomistFarmers() {
  const { currentUser } = useAuth();
  const [expandedFarmer, setExpandedFarmer] = useState<string | null>(null);
  const [selectedFarmer, setSelectedFarmer] = useState<string | null>(null);

  if (!currentUser || currentUser.role !== 'agronomist') return null;

  const myFarmerIds = (currentUser as any).assignedFarmers ?? [];
  const myFarmers   = users.filter(u => myFarmerIds.includes(u.id));

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl" style={{ fontWeight: 700, color: '#111827' }}>Αγρότες μου</h1>
        <p className="text-sm text-gray-500 mt-1">{myFarmers.length} αγρότες υπό την εποπτεία σας</p>
      </div>

      <div className="space-y-4">
        {myFarmers.map(farmer => {
          const farmerFields = fields.filter(f => f.farmerId === farmer.id);
          const totals       = getFarmerTotals(farmer.id);
          const avgHealth    = farmerFields.length > 0
            ? Math.round(farmerFields.reduce((acc, f) => acc + f.healthScore, 0) / farmerFields.length)
            : 0;
          const isExpanded   = expandedFarmer === farmer.id;

          return (
            <div key={farmer.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {/* Farmer Header */}
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: '#dbeafe' }}>
                    👨‍🌾
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base" style={{ fontWeight: 700, color: '#111827' }}>{farmer.name}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{farmer.location}</span>
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{farmer.phone}</span>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${farmer.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`} style={{ fontWeight: 600 }}>
                        {farmer.active ? '● Ενεργός' : '○ Ανενεργός'}
                      </span>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-4 gap-3 mt-4">
                      {[
                        { label: 'Χωράφια',    value: totals.fieldCount },
                        { label: 'Στρέμματα',  value: totals.totalAcres },
                        { label: 'Αναμ. Έσοδα', value: `€${totals.totalRevenue.toLocaleString('el-GR')}` },
                        { label: 'Υγεία',      value: `${avgHealth}%` },
                      ].map(s => (
                        <div key={s.label} className="bg-gray-50 rounded-xl p-2.5 text-center">
                          <div className="text-sm" style={{ fontWeight: 700, color: '#111827' }}>{s.value}</div>
                          <div className="text-xs text-gray-500">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Health Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Μέση Υγεία Καλλιεργειών</span>
                        <span style={{ fontWeight: 600, color: avgHealth >= 80 ? '#059669' : '#d97706' }}>{avgHealth}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div className="h-2 rounded-full" style={{
                          width: `${avgHealth}%`,
                          background: avgHealth >= 80
                            ? 'linear-gradient(90deg, #10b981, #059669)'
                            : 'linear-gradient(90deg, #f59e0b, #d97706)',
                        }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expand / Collapse button */}
                <button
                  onClick={() => setExpandedFarmer(isExpanded ? null : farmer.id)}
                  className="mt-4 w-full flex items-center justify-center gap-1 py-2 rounded-xl text-xs border border-gray-200 hover:bg-gray-50 transition-colors"
                  style={{ color: '#6b7280', fontWeight: 500 }}
                >
                  {isExpanded
                    ? <><ChevronUp   className="w-3.5 h-3.5" /> Απόκρυψη Χωραφιών</>
                    : <><ChevronDown className="w-3.5 h-3.5" /> Προβολή Χωραφιών ({farmerFields.length})</>}
                </button>
              </div>

              {/* Expanded Fields */}
              {isExpanded && farmerFields.length > 0 && (
                <div className="border-t border-gray-100 bg-gray-50">
                  <div className="p-4 space-y-2">
                    {farmerFields.map(field => {
                      const crop = getCropById(field.cropTypeId);
                      const fin  = calculateFieldFinancials(field);
                      return (
                        <div key={field.id} className="bg-white rounded-xl p-3 flex items-center gap-3">
                          <span className="text-xl">{crop?.icon}</span>
                          <div className="flex-1">
                            <div className="text-sm" style={{ fontWeight: 600 }}>{field.name}</div>
                            <div className="text-xs text-gray-500">
                              {field.acres} στρ. · {crop?.name} · {field.careLevel === 'high' ? 'Υψηλή' : field.careLevel === 'medium' ? 'Μέτρια' : 'Χαμηλή'} φροντίδα
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs" style={{ fontWeight: 600, color: '#2563eb' }}>€{fin.estimatedRevenue.toLocaleString('el-GR')}</div>
                            <div className="text-xs" style={{ color: field.healthScore >= 80 ? '#059669' : '#d97706' }}>Υγεία: {field.healthScore}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
