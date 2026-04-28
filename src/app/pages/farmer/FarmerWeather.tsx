import React from 'react';
import { weatherData } from '../../data/mockData';
import { Droplet, Wind, Eye, Thermometer, CloudRain } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function FarmerWeather() {
  const today    = weatherData[0];
  const forecast = weatherData;

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl" style={{ fontWeight: 700, color: '#111827' }}>Καιρός & Αγρομετεωρολογία</h1>
        <p className="text-sm text-gray-500 mt-1">7ήμερη πρόγνωση για την περιοχή σας</p>
      </div>

      {/* Today Big Card */}
      <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0284c7 100%)' }}>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-5xl mb-2">{today.icon}</div>
            <div className="text-6xl mb-2" style={{ fontWeight: 700 }}>{today.temp}°</div>
            <div className="text-xl text-blue-100">{today.condition}</div>
            <div className="text-sm text-blue-200 mt-1">Σάββατο, 21 Μαρτίου 2026 · Λάρισα</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Droplet,     label: 'Υγρασία', value: `${today.humidity}%` },
              { icon: Wind,        label: 'Άνεμος',  value: `${today.windSpeed} km/h` },
              { icon: CloudRain,   label: 'Βροχή',   value: `${today.rainfall} mm` },
              { icon: Thermometer, label: 'Αίσθηση', value: `${today.temp - 2}°C` },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
                <s.icon className="w-5 h-5 text-blue-200 mx-auto mb-1" />
                <div className="text-lg text-white" style={{ fontWeight: 700 }}>{s.value}</div>
                <div className="text-xs text-blue-200">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-5 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="text-sm" style={{ fontWeight: 600 }}>🌾 Αγρομετεωρολογική Σύσταση</div>
          <div className="text-sm text-blue-100 mt-1">
            Καλές συνθήκες για άρδευση σήμερα. Αποφύγετε ψε��ασμούς τη Δευτέρα λόγω αναμενόμενης βροχής. Θερμοκρασίες κατάλληλες για εαρινές καλλιέργειες.
          </div>
        </div>
      </div>

      {/* 7-day Forecast */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-base mb-4" style={{ fontWeight: 600, color: '#111827' }}>7ήμερη Πρόγνωση</h3>
        <div className="grid grid-cols-7 gap-2">
          {forecast.map((day, i) => {
            const date    = new Date(day.date);
            const dayName = i === 0 ? 'Σήμερα' : date.toLocaleDateString('el-GR', { weekday: 'short' });
            return (
              <div key={day.date}
                className={`text-center p-3 rounded-xl ${i === 0 ? 'text-white' : 'bg-gray-50'}`}
                style={i === 0 ? { background: '#0284c7' } : {}}>
                <div className={`text-xs mb-2 ${i === 0 ? 'text-blue-100' : 'text-gray-500'}`} style={{ fontWeight: 500 }}>{dayName}</div>
                <div className="text-2xl mb-2">{day.icon}</div>
                <div className={`text-sm ${i === 0 ? 'text-white' : 'text-gray-900'}`} style={{ fontWeight: 700 }}>{day.temp}°</div>
                {day.rainfall > 0 && (
                  <div className={`text-xs mt-1 ${i === 0 ? 'text-blue-200' : 'text-blue-500'}`}>{day.rainfall}mm</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm mb-4" style={{ fontWeight: 600, color: '#111827' }}>Θερμοκρασία Εβδομάδας</h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={forecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => new Date(d).toLocaleDateString('el-GR', { weekday: 'short' })} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}°`} />
              <Tooltip formatter={(v: number) => [`${v}°C`, 'Θερμοκρασία']} />
              <Line type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: '#f59e0b', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm mb-4" style={{ fontWeight: 600, color: '#111827' }}>Βροχόπτωση (mm)</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={forecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => new Date(d).toLocaleDateString('el-GR', { weekday: 'short' })} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => [`${v} mm`, 'Βροχόπτωση']} />
              <Bar dataKey="rainfall" fill="#0284c7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Agro Tips */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-sm mb-4" style={{ fontWeight: 600, color: '#111827' }}>🌿 Αγρονομικές Συστάσεις Εβδομάδας</h3>
        <div className="space-y-3">
          {[
            { icon: '☀️', title: 'Ψεκασμοί',      desc: 'Κατάλληλες συνθήκες Σαββ.-Κυρ. Αποφύγετε Τρίτη-Τετάρτη (βροχή)',    color: '#fef3c7' },
            { icon: '💧', title: 'Άρδευση',        desc: 'Μειώστε άρδευση μετά τη βροχόπτωση Δευτέρας (12mm αναμ.)',           color: '#dbeafe' },
            { icon: '🌡️', title: 'Θερμοκρασίες',  desc: 'Ευνοϊκές για ανάπτυξη σιτηρών. Κίνδυνος παγετού απίθανος.',         color: '#d1fae5' },
            { icon: '💨', title: 'Άνεμος',         desc: 'Δευτέρα-Τρίτη ισχυρές ριπές 22km/h. Ασφαλίστε κατασκευές.',        color: '#fce7f3' },
          ].map(tip => (
            <div key={tip.title} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: tip.color }}>
              <span className="text-xl">{tip.icon}</span>
              <div>
                <div className="text-sm" style={{ fontWeight: 600, color: '#111827' }}>{tip.title}</div>
                <div className="text-xs text-gray-600 mt-0.5">{tip.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
