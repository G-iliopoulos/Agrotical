import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { tasks as allTasks, Task, getCropById, getFieldsByFarmer } from '../../data/mockData';
import {
  CheckCircle2, Circle, Clock, Plus,
  Droplet, Leaf, Bug, Wheat, Tractor, Scissors, ClipboardList,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

const taskIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  watering: Droplet, fertilizing: Leaf, pesticide: Bug,
  harvesting: Wheat, plowing: Tractor, pruning: Scissors, other: ClipboardList,
};
const taskColors: Record<string, { bg: string; text: string; label: string }> = {
  watering:    { bg: '#dbeafe', text: '#2563eb', label: '💧 Άρδευση' },
  fertilizing: { bg: '#d1fae5', text: '#059669', label: '🌱 Λίπανση' },
  pesticide:   { bg: '#fee2e2', text: '#dc2626', label: '🧪 Φυτοπροστασία' },
  harvesting:  { bg: '#fef3c7', text: '#d97706', label: '🌾 Συγκομιδή' },
  plowing:     { bg: '#ede9fe', text: '#7c3aed', label: '🚜 Άροτρο' },
  pruning:     { bg: '#fce7f3', text: '#be185d', label: '✂️ Κλάδεμα' },
  other:       { bg: '#f3f4f6', text: '#6b7280', label: '📋 Άλλο' },
};
const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  low:    { label: 'Χαμηλή',  color: '#6b7280', bg: '#f3f4f6' },
  medium: { label: 'Μέτρια',  color: '#2563eb', bg: '#dbeafe' },
  high:   { label: 'Υψηλή',   color: '#d97706', bg: '#fef3c7' },
  urgent: { label: 'Επείγον', color: '#dc2626', bg: '#fee2e2' },
};

export default function FarmerTasks() {
  const { currentUser } = useAuth();
  const [localTasks, setLocalTasks] = useState<Task[]>(
    currentUser ? allTasks.filter(t => t.farmerId === currentUser.id) : []
  );
  const [filter, setFilter]         = useState<'all' | 'pending' | 'done'>('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [fields]                    = useState(() => currentUser ? getFieldsByFarmer(currentUser.id) : []);

  if (!currentUser) return null;

  // UC10 Step 7: Direct toggle — χωρίς confirmation (UC12 έρχεται στο Commit 15)
  const toggleComplete = (id: string) => {
    setLocalTasks(prev => prev.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
    const task = localTasks.find(t => t.id === id);
    if (task && !task.completed) {
      toast.success(`Η εργασία "${task.title}" επισημάνθηκε ως ολοκληρωμένη`);
    }
  };

  const filtered = localTasks.filter(t => {
    const matchStatus = filter === 'all' || (filter === 'pending' ? !t.completed : t.completed);
    const matchType   = typeFilter === 'all' || t.type === typeFilter;
    return matchStatus && matchType;
  });

  const pending   = localTasks.filter(t => !t.completed);
  const done      = localTasks.filter(t => t.completed);
  const totalCost = pending.reduce((acc, t) => acc + (t.estimatedCost ?? 0), 0);

  // UC10: Upcoming = pending tasks due in ≤7 days
  const upcoming = pending.filter(t => {
    const due   = new Date(t.dueDate);
    const today = new Date();
    const diff  = (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7 && diff >= 0;
  });

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl" style={{ fontWeight: 700, color: '#111827' }}>Εργασίες & Πρόγραμμα</h1>
          <p className="text-sm text-gray-500 mt-1">
            {pending.length} εκκρεμείς · {done.length} ολοκληρωμένες
          </p>
        </div>
        {/* Add modal έρχεται στο Commit 15 */}
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm"
          style={{ background: 'linear-gradient(135deg, #2d6a4f, #40916c)', fontWeight: 600 }}
          onClick={() => toast.info('Η προσθήκη εργασίας θα προστεθεί στο επόμενο commit')}
        >
          <Plus className="w-4 h-4" /> Νέα Εργασία
        </button>
      </div>

      {/* UC10 Step 4: KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Εκκρεμείς',              value: pending.length,                          color: '#2563eb', bg: '#dbeafe' },
          { label: 'Επείγοντα (7 μέρες)',     value: upcoming.length,                         color: '#dc2626', bg: '#fee2e2' },
          { label: 'Ολοκληρωμένες',           value: done.length,                             color: '#059669', bg: '#d1fae5' },
          { label: 'Εκτ. Κόστος Εκκρεμών',   value: `€${totalCost.toLocaleString('el-GR')}`, color: '#d97706', bg: '#fef3c7' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="text-xl" style={{ fontWeight: 700, color: s.color }}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* UC10 Step 5: Upcoming alert banner */}
      {upcoming.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-sm" style={{ fontWeight: 600, color: '#92400e' }}>
              {upcoming.length} εργασίες λήγουν μέσα στις επόμενες 7 ημέρες
            </div>
            <div className="text-xs text-amber-700 mt-1">
              {upcoming.map(t => t.title).join(' · ')}
            </div>
          </div>
        </div>
      )}

      {/* UC10 Step 3: Filters — status + type */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'done'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${filter === f ? 'text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            style={filter === f ? { background: '#2d6a4f', fontWeight: 600 } : { fontWeight: 500 }}
          >
            {f === 'all' ? 'Όλες' : f === 'pending' ? 'Εκκρεμείς' : 'Ολοκληρωμένες'}
          </button>
        ))}
        <div className="w-px bg-gray-200 mx-1" />
        {['all', ...Object.keys(taskColors)].map(type => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${typeFilter === type ? 'text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            style={typeFilter === type ? { background: '#40916c', fontWeight: 600 } : { fontWeight: 500 }}
          >
            {type === 'all' ? '📋 Όλοι Τύποι' : taskColors[type]?.label ?? type}
          </button>
        ))}
      </div>

      {/* UC10 Step 6: Task list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Δεν υπάρχουν εργασίες με αυτά τα κριτήρια</p>
          </div>
        )}

        {filtered.map(task => {
          const Icon      = taskIcons[task.type] ?? ClipboardList;
          const tc        = taskColors[task.type];
          const pc        = priorityConfig[task.priority ?? 'medium'];
          const isOverdue = !task.completed && new Date(task.dueDate) < new Date();
          const field     = fields.find(f => f.id === task.fieldId);
          const crop      = field ? getCropById(field.cropTypeId) : null;

          return (
            <div
              key={task.id}
              className={`bg-white rounded-xl border p-4 flex items-start gap-4 transition-all hover:shadow-sm ${task.completed ? 'opacity-60' : ''} ${isOverdue && !task.completed ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}
            >
              {/* UC10: Direct toggle (χωρίς confirm — UC12 έρχεται στο #15) */}
              <button
                onClick={() => !task.completed && toggleComplete(task.id)}
                className="mt-0.5 flex-shrink-0"
                disabled={task.completed}
              >
                {task.completed
                  ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                  : <Circle className="w-5 h-5 text-gray-300 hover:text-green-400 transition-colors" />}
              </button>

              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: tc?.bg }}>
                <Icon className="w-4 h-4" style={{ color: tc?.text }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-sm ${task.completed ? 'line-through text-gray-400' : ''}`}
                    style={{ fontWeight: 600, color: '#111827' }}
                  >
                    {task.title}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: pc.bg, color: pc.color, fontWeight: 600 }}>
                    {pc.label}
                  </span>
                  {isOverdue && !task.completed && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600" style={{ fontWeight: 600 }}>
                      ⚠️ Εκπρόθεσμη
                    </span>
                  )}
                </div>
                {task.description && (
                  <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
                )}
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(task.dueDate).toLocaleDateString('el-GR')}
                  </span>
                  {field && (
                    <span className="text-xs text-gray-500">{crop?.icon} {field.name}</span>
                  )}
                  {task.estimatedCost && task.estimatedCost > 0 && (
                    <span className="text-xs text-gray-500">💰 €{task.estimatedCost}</span>
                  )}
                </div>
              </div>

              {/* Quick complete — direct, χωρίς confirm */}
              {!task.completed && (
                <button
                  onClick={() => toggleComplete(task.id)}
                  className="flex-shrink-0 text-xs px-2 py-1.5 rounded-lg border border-green-200 hover:bg-green-50 transition-colors"
                  style={{ color: '#059669', fontWeight: 500 }}
                >
                  ✓ Ολοκλήρωση
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
