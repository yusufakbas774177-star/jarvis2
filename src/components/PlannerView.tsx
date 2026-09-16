import React, { useState } from 'react';
import { 
  AssistantTask 
} from '../types';
import { 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Volume2, 
  Sparkles,
  Check,
  Tag
} from 'lucide-react';
import { playCommandSuccess, playChirp } from '../utils/soundEffects';

interface PlannerViewProps {
  tasks: AssistantTask[];
  onAddTask: (task: AssistantTask) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onJarvisBriefing: () => void;
  isMobile?: boolean;
}

export const PlannerView: React.FC<PlannerViewProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onJarvisBriefing,
  isMobile = false
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('14:00');
  const [newDueDate, setNewDueDate] = useState('Bugün');
  const [newCategory, setNewCategory] = useState<'work' | 'personal' | 'health' | 'home'>('work');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const highPriorityCount = tasks.filter((t) => !t.completed && t.priority === 'high').length;

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending' && task.completed) return false;
    if (filter === 'completed' && !task.completed) return false;
    if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;
    return true;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: AssistantTask = {
      id: `task_${Date.now()}`,
      title: newTitle.trim(),
      time: newTime,
      dueDate: newDueDate,
      category: newCategory,
      priority: newPriority,
      completed: false
    };

    onAddTask(newTask);
    setNewTitle('');
    setShowAddModal(false);
    playCommandSuccess();
  };

  const handleQuickAdd = (title: string, category: 'work' | 'personal' | 'health' | 'home', priority: 'high' | 'medium' | 'low') => {
    const newTask: AssistantTask = {
      id: `task_${Date.now()}`,
      title,
      time: 'Bugün',
      dueDate: 'Bugün',
      category,
      priority,
      completed: false
    };
    onAddTask(newTask);
    playCommandSuccess();
  };

  const getPriorityBadge = (p: 'high' | 'medium' | 'low') => {
    if (p === 'high') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Yüksek
        </span>
      );
    }
    if (p === 'medium') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
          Orta
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
        Düşük
      </span>
    );
  };

  const getCategoryLabel = (cat: 'work' | 'personal' | 'health' | 'home') => {
    switch (cat) {
      case 'work': return 'İş & Proje';
      case 'personal': return 'Kişisel';
      case 'health': return 'Sağlık / Spor';
      case 'home': return 'Ev / Rutin';
    }
  };

  return (
    <div id="jarvis-planner-view" className="h-full flex flex-col p-4 space-y-4 overflow-y-auto">
      {/* Top Header Card */}
      <div className="bg-[#061226]/85 backdrop-blur-md rounded-xl border border-cyan-500/30 p-4 shadow-[0_0_20px_rgba(0,180,255,0.1)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(0,229,255,0.3)]">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-['Orbitron'] text-cyan-200 tracking-wide flex items-center gap-2">
              <span>AJANDA & GÖREV PLANLAYICI</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40">
                J.A.R.V.I.S. TAKİBİNDE
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Zamanlanmış görevler, sesli hatırlatıcılar ve günlük üretkenlik takibi.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playChirp(900);
              onJarvisBriefing();
            }}
            className="px-3 py-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400/50 text-cyan-300 font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_12px_rgba(0,229,255,0.2)]"
          >
            <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>J.A.R.V.I.S. Brifingi Al</span>
          </button>

          <button
            onClick={() => {
              playChirp(1200);
              setShowAddModal(true);
            }}
            className="px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-['Orbitron'] text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.4)]"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Görev</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#08152e]/80 p-3 rounded-xl border border-cyan-500/20">
          <div className="text-[10px] font-mono text-slate-400">TOPLAM GÖREV</div>
          <div className="text-xl font-bold font-['Orbitron'] text-cyan-200 mt-0.5">{tasks.length}</div>
        </div>
        <div className="bg-[#08152e]/80 p-3 rounded-xl border border-amber-500/30">
          <div className="text-[10px] font-mono text-amber-400/80">BEKLEYEN İŞLER</div>
          <div className="text-xl font-bold font-['Orbitron'] text-amber-300 mt-0.5">{pendingCount}</div>
        </div>
        <div className="bg-[#08152e]/80 p-3 rounded-xl border border-emerald-500/30">
          <div className="text-[10px] font-mono text-emerald-400/80">TAMAMLANAN</div>
          <div className="text-xl font-bold font-['Orbitron'] text-emerald-300 mt-0.5">{completedCount}</div>
        </div>
        <div className="bg-[#08152e]/80 p-3 rounded-xl border border-rose-500/30">
          <div className="text-[10px] font-mono text-rose-400/80">YÜKSEK ÖNCELİK</div>
          <div className="text-xl font-bold font-['Orbitron'] text-rose-300 mt-0.5">{highPriorityCount}</div>
        </div>
      </div>

      {/* Quick Preset Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
        <span className="text-slate-400 flex items-center gap-1 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Hızlı Şablonlar:
        </span>
        <button
          onClick={() => handleQuickAdd('Günde 2 Litre Su İç', 'health', 'medium')}
          className="px-2.5 py-1 rounded bg-[#0a1e40] hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 shrink-0 cursor-pointer"
        >
          + Su Hatırlatıcısı
        </button>
        <button
          onClick={() => handleQuickAdd('Önemli E-Postaları Yanıtla', 'work', 'high')}
          className="px-2.5 py-1 rounded bg-[#0a1e40] hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 shrink-0 cursor-pointer"
        >
          + E-Postaları Kontrol Et
        </button>
        <button
          onClick={() => handleQuickAdd('Haftalık Sistem Yedeklemesi Al', 'home', 'medium')}
          className="px-2.5 py-1 rounded bg-[#0a1e40] hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 shrink-0 cursor-pointer"
        >
          + Sistem Yedekleme
        </button>
        <button
          onClick={() => handleQuickAdd('30 Dakika Egzersiz & Yürüyüş', 'health', 'medium')}
          className="px-2.5 py-1 rounded bg-[#0a1e40] hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 shrink-0 cursor-pointer"
        >
          + Egzersiz / Spor
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/20 pb-2 text-xs font-mono">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md transition-colors ${filter === 'all' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-cyan-200'}`}
          >
            Tümü ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-md transition-colors ${filter === 'pending' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-cyan-200'}`}
          >
            Bekleyenler ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-md transition-colors ${filter === 'completed' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-cyan-200'}`}
          >
            Tamamlananlar ({completedCount})
          </button>
        </div>

        <div className="flex items-center space-x-1">
          <Tag className="w-3.5 h-3.5 text-cyan-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#09152b] border border-cyan-500/30 text-cyan-200 px-2 py-1 rounded text-xs outline-none"
          >
            <option value="all">Tüm Kategoriler</option>
            <option value="work">İş & Proje</option>
            <option value="personal">Kişisel</option>
            <option value="health">Sağlık / Spor</option>
            <option value="home">Ev / Rutin</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-cyan-500/20 rounded-xl bg-[#061226]/40">
            <Calendar className="w-8 h-8 text-cyan-500/40 mx-auto mb-2" />
            <div className="text-cyan-300 font-mono text-sm">Görüntülenecek görev bulunamadı</div>
            <div className="text-xs text-slate-500 mt-1">
              "Yeni Görev" butonuna tıklayarak veya J.A.R.V.I.S.'a sesli olarak "Görev ekle" diyerek hemen oluşturabilirsiniz.
            </div>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                task.completed
                  ? 'bg-[#061224]/50 border-cyan-500/10 opacity-70'
                  : 'bg-[#081733]/80 border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_2px_10px_rgba(0,0,0,0.2)]'
              }`}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <button
                  onClick={() => {
                    playChirp(task.completed ? 700 : 1100);
                    onToggleTask(task.id);
                  }}
                  className="cursor-pointer text-cyan-400 hover:text-cyan-300 shrink-0"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500 hover:text-cyan-400" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <div
                    className={`text-sm font-sans font-medium truncate ${
                      task.completed ? 'line-through text-slate-500' : 'text-slate-100'
                    }`}
                  >
                    {task.title}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      {task.time || 'Zaman belirtilmedi'}
                    </span>
                    <span>•</span>
                    <span className="text-cyan-300/80">{getCategoryLabel(task.category)}</span>
                    <span>•</span>
                    <span>{task.dueDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {getPriorityBadge(task.priority)}
                <button
                  onClick={() => {
                    playChirp(600);
                    onDeleteTask(task.id);
                  }}
                  className="p-1.5 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Görevi Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#07162e] border-2 border-cyan-400/80 rounded-2xl p-6 w-full max-w-md shadow-[0_0_40px_rgba(0,229,255,0.3)]">
            <h3 className="text-base font-bold font-['Orbitron'] text-cyan-200 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyan-400" />
              <span>YENİ GÖREV VEYA HATIRLATICI</span>
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">GÖREV BAŞLIĞI</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Saat 15:00 Proje Toplantısı"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#040e1f] border border-cyan-500/40 rounded-lg px-3 py-2 text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">SAAT / ZAMAN</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-[#040e1f] border border-cyan-500/40 rounded-lg px-3 py-2 text-cyan-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">TARİH</label>
                  <input
                    type="text"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    placeholder="Örn: Bugün, Yarın"
                    className="w-full bg-[#040e1f] border border-cyan-500/40 rounded-lg px-3 py-2 text-cyan-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">KATEGORİ</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-[#040e1f] border border-cyan-500/40 rounded-lg px-3 py-2 text-cyan-100 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="work">İş & Proje</option>
                    <option value="personal">Kişisel</option>
                    <option value="health">Sağlık / Spor</option>
                    <option value="home">Ev / Rutin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">ÖNCELİK</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-[#040e1f] border border-cyan-500/40 rounded-lg px-3 py-2 text-cyan-100 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="high">Yüksek</option>
                    <option value="medium">Orta</option>
                    <option value="low">Düşük</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-cyan-500/20">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-['Orbitron'] cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                >
                  Kaydet & Başlat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
