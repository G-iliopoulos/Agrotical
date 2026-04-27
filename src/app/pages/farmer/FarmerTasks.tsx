import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { tasks as allTasks, Task, getCropById, getFieldsByFarmer } from '../../data/mockData';
import { CheckCircle2, Circle, Clock, Plus, Droplet, Leaf, Bug, Wheat, Tractor, Scissors, ClipboardList, AlertTriangle, X, Save } from 'lucide-react';
import { toast } from 'sonner';

const taskIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  watering: Droplet, fertilizing: Leaf, pesticide: Bug,
  harvesting: Wheat, plowing: Tractor, pruning: Scissors, other: ClipboardList,
};
const taskColors: Record<string, { bg: string; text: string; label: string }> = {
  watering:   { bg: '#dbeafe', text: '#2563eb', label: '💧 Άρδευση' },
  fertilizing:{ bg: '#d1fae5', text: '#059669', label: '🌱 Λίπανση' },
  pesticide:  { bg: '#fee2e2', text: '#dc2626', label: '🧪 Φυτοπροστασία' },
  harvesting: { bg: '#fef3c7', text: '#d97706', label: '🌾 Συγκομιδή' },
  plowing:    { bg: '#ede9fe', text: '#7c3aed', label: '🚜 Άροτρο' },
  pruning:    { bg: '#fce7f3', text: '#be185d', label: '✂️ Κλάδεμα' },
  other:      { bg: '#f3f4f6', text: '#6b7280', label: '📋 Άλλο' },
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
  const [filter, setFilter]       = useState<'all' | 'pending' | 'done'>('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [fields] = useState(() => currentUser ? getFieldsByFarmer(currentUser.id) : []);

  // UC12: completion confirmation
  const [completeConfirm, setCompleteConfirm] = useState<string | null>(null);

  // Form validation errors (UC11)
  const [formErrors, setFormErrors] = useState<{ date?: string; duplicate?: string }>({});

  const [form, setForm] = useState({
    title: '', description: '', dueDate: '', type: 'watering' as Task['type'],
    priority: 'medium' as 'low' | 'medium' | 'high',
    fieldId: fields[0]?.id ?? '',
    estimatedCost: 0,
  });

  if (!currentUser) return null;

  // UC12: Request completion with confirmation
  const requestComplete = (id: string) => { setCompleteConfirm(id); };

  const confirmComplete = (id: string) => {
    setLocalTasks(prev => prev.map(t => t.id === id ? { ...t, completed: true } : t));
    setCompleteConfirm(null);
    toast.success('Η εργασία επισημάνθηκε ως ολοκληρωμένη');
  };

  const validateTaskForm = (): boolean => {
    const errors: { date?: string; duplicate?: string } = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // UC11 Alt Flow 2: Past date
    if (form.dueDate) {
      const due = new Date(form.dueDate);
      if (due < today) {
        errors.date = 'Η ημερομηνία εκτέλεσης δεν μπορεί να είναι παρελθοντική';
      }
    }

    // UC11 Alt Flow 3: Duplicate task (same type, same field, same date, pending)
    if (!errors.date && form.dueDate && form.fieldId) {
      const duplicate = localTasks.find(t =>
        !t.completed &&
        t.type === form.type &&
        t.fieldId === form.fieldId &&
        t.dueDate === form.dueDate
      );
      if (duplicate) {
        errors.duplicate = 'Υπάρχει ήδη παρόμοια εργασία για το συγκεκριμένο χωράφι και την ίδια ημερομηνία';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddTask = () => {
    if (!form.title || !form.dueDate) return;
    if (!validateTaskForm()) return;

    // UC11 Step 9: Auto-urgent if high priority + close deadline (≤3 days)
    const daysUntilDue = (new Date(form.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
    const isUrgent = form.priority === 'high' && daysUntilDue <= 3;

    const newTask: Task = {
      id: `task_${Date.now()}`,
      farmerId: currentUser.id,
      completed: false,
      ...form,
      priority: isUrgent ? ('urgent' as any) : form.priority,
    };
    setLocalTasks(prev => [...prev, newTask]);
    setForm({ title: '', description: '', dueDate: '', type: 'watering', priority: 'medium', fieldId: fields[0]?.id ?? '', estimatedCost: 0 });
    setFormErrors({});
    setShowModal(false);
    toast.success(`Η εργασία "${newTask.title}" προστέθηκε${isUrgent ? ' και επισημάνθηκε ως επείγουσα' : ''}`);
  };

  const filtered = localTasks.filter(t => {
    const matchStatus = filter === 'all' || (filter === 'pending' ? !t.completed : t.completed);
    const matchType   = typeFilter === 'all' || t.type === typeFilter;
    return matchStatus && matchType;
  });

  const pending   = localTasks.filter(t => !t.completed);
  const done      = localTasks.filter(t => t.completed);
  const totalCost = pending.reduce((acc, t) => acc + (t.estimatedCost ?? 0), 0);

  const upcoming = pending.filter(t => {
    const due   = new Date(t.dueDate);
    const today = new Date();
    const diff  = (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7 && diff >= 0;
  });

  const taskToComplete  = completeConfirm ? localTasks.find(t => t.id === completeConfirm) : null;
  const isOverdueTask   = taskToComplete ? new Date(taskToComplete.dueDate) < new Date() : false;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl" style={{ fontWeight: 700, color: '#111827' }}>Εργασίες & Πρόγραμμα</h1>
          <p className="text-sm text-gray-500 mt-1">{pending.length} εκκρεμείς · {done.length} ολοκληρωμένες</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm"
          style={{ background: 'linear-gradient(135deg, #2d6a4f, #40916c)', fontWeight: 600 }}>
          <Plus className="w-4 h-4" /> Νέα Εργασία
        </button>
      </div>

      {/* Stats Row */}
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

      {/* Upcoming Alert */}
      {upcoming.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-sm" style={{ fontWeight: 600, color: '#92400e' }}>
              {upcoming.length} εργασίες λήγουν μέσα στις επόμενες 7 ημέρες
            </div>
            <div className="text-xs text-amber-700 mt-1">{upcoming.map(t => t.title).join(' · ')}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'done'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${filter === f ? 'text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            style={filter === f ? { background: '#2d6a4f', fontWeight: 600 } : { fontWeight: 500 }}>
            {f === 'all' ? 'Όλες' : f === 'pending' ? 'Εκκρεμείς' : 'Ολοκληρωμένες'}
          </button>
        ))}
        <div className="w-px bg-gray-200 mx-1" />
        {['all', ...Object.keys(taskColors)].map(type => (
          <button key={type} onClick={() => setTypeFilter(type)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${typeFilter === type ? 'text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            style={typeFilter === type ? { background: '#40916c', fontWeight: 600 } : { fontWeight: 500 }}>
            {type === 'all' ? '📋 Όλοι Τύποι' : taskColors[type]?.label ?? type}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Δεν υπάρχουν εργασίες με αυτά τα κριτήρια</p>
          </div>
        )}
        {filtered.map(task => {
          const Icon    = taskIcons[task.type] ?? ClipboardList;
          const tc      = taskColors[task.type];
          const pc      = priorityConfig[task.priority ?? 'medium'];
          const isOverdue = !task.completed && new Date(task.dueDate) < new Date();
          const field   = fields.find(f => f.id === task.fieldId);
          const crop    = field ? getCropById(field.cropTypeId) : null;

          return (
            <div key={task.id}
              className={`bg-white rounded-xl border p-4 flex items-start gap-4 transition-all hover:shadow-sm ${task.completed ? 'opacity-60' : ''} ${isOverdue && !task.completed ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}>
              {/* UC12: Click to open confirmation instead of direct toggle */}
              <button onClick={() => !task.completed && requestComplete(task.id)} className="mt-0.5 flex-shrink-0" disabled={task.completed}>
                {task.completed
                  ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                  : <Circle className="w-5 h-5 text-gray-300 hover:text-green-400 transition-colors" />}
              </button>

              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: tc?.bg }}>
                <Icon className="w-4 h-4" style={{ color: tc?.text }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm ${task.completed ? 'line-through text-gray-400' : ''}`} style={{ fontWeight: 600, color: '#111827' }}>
                    {task.title}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: pc.bg, color: pc.color, fontWeight: 600 }}>{pc.label}</span>
                  {isOverdue && !task.completed && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600" style={{ fontWeight: 600 }}>⚠️ Εκπρόθεσμη</span>
                  )}
                </div>
                {task.description && <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>}
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(task.dueDate).toLocaleDateString('el-GR')}
                  </span>
                  {field && <span className="text-xs text-gray-500">{crop?.icon} {field.name}</span>}
                  {task.estimatedCost && task.estimatedCost > 0 && (
                    <span className="text-xs text-gray-500">💰 €{task.estimatedCost}</span>
                  )}
                </div>
              </div>

              {!task.completed && (
                <button onClick={() => requestComplete(task.id)}
                  className="flex-shrink-0 text-xs px-2 py-1.5 rounded-lg border border-green-200 hover:bg-green-50 transition-colors"
                  style={{ color: '#059669', fontWeight: 500 }}>
                  ✓ Ολοκλήρωση
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* UC12: Completion Confirmation Modal */}
      {completeConfirm && taskToComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setCompleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
            {isOverdueTask ? (
              <>
                {/* UC12 Alt Flow 2: Overdue task warning */}
                <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-7 h-7 text-amber-600" />
                </div>
                <h3 className="text-lg mb-2" style={{ fontWeight: 700 }}>Εκπρόθεσμη Εργασία</h3>
                <p className="text-sm text-gray-500 mb-2">Η εργασία <strong>"{taskToComplete.title}"</strong> έχει καθυστερήσει.</p>
                <p className="text-sm text-gray-500 mb-6">Θέλετε να την ολοκληρώσετε τώρα;</p>
                <div className="flex gap-3">
                  <button onClick={() => setCompleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm" style={{ fontWeight: 500 }}>Άκυρο</button>
                  <button onClick={() => confirmComplete(completeConfirm)} className="flex-1 py-2.5 rounded-xl text-white text-sm" style={{ background: '#d97706', fontWeight: 600 }}>Ολοκλήρωση</button>
                </div>
              </>
            ) : (
              <>
                {/* UC12 Step 3: Normal confirmation */}
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-lg mb-2" style={{ fontWeight: 700 }}>Ολοκλήρωση Εργασίας;</h3>
                <p className="text-sm text-gray-500 mb-6">Θέλετε να επισημάνετε την εργασία <strong>"{taskToComplete.title}"</strong> ως ολοκληρωμένη;</p>
                <div className="flex gap-3">
                  <button onClick={() => setCompleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm" style={{ fontWeight: 500 }}>Άκυρο</button>
                  <button onClick={() => confirmComplete(completeConfirm)} className="flex-1 py-2.5 rounded-xl text-white text-sm" style={{ background: 'linear-gradient(135deg, #2d6a4f, #40916c)', fontWeight: 600 }}>Ολοκλήρωση</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg" style={{ fontWeight: 700 }}>Νέα Εργασία</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Τίτλος *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm"
                  placeholder="π.χ. Άρδευση χωραφιού" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Τύπος</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as any }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm">
                    {Object.entries(taskColors).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Προτεραιότητα</label>
                  <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value as any }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm">
                    <option value="low">Χαμηλή</option>
                    <option value="medium">Μέτρια</option>
                    <option value="high">Υψηλή</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Ημερομηνία *</label>
                  <input type="date" value={form.dueDate}
                    onChange={e => { setForm(p => ({ ...p, dueDate: e.target.value })); setFormErrors(p => ({ ...p, date: undefined, duplicate: undefined })); }}
                    className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none text-sm ${formErrors.date ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                  {formErrors.date && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />{formErrors.date}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Εκτ. Κόστος (€)</label>
                  <input type="number" value={form.estimatedCost || ''} onChange={e => setForm(p => ({ ...p, estimatedCost: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm" placeholder="0" />
                </div>
              </div>

              {/* Duplicate task warning */}
              {formErrors.duplicate && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-800">{formErrors.duplicate}</p>
                </div>
              )}

              <div>
                <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Χωράφι</label>
                <select value={form.fieldId} onChange={e => setForm(p => ({ ...p, fieldId: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm">
                  {fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>Περιγραφή</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={2} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm resize-none"
                  placeholder="Προαιρετικές λεπτομέρειες..." />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm" style={{ fontWeight: 500 }}>Ακύρωση</button>
              <button onClick={handleAddTask} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm"
                style={{ background: 'linear-gradient(135deg, #2d6a4f, #40916c)', fontWeight: 600 }}>
                <Save className="w-4 h-4" /> Προσθήκη
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
