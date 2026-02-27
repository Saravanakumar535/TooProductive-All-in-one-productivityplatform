import { useState, useEffect } from 'react';
import { Plus, BookOpen, Calendar, Flame, Trash2, PenLine, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MotionSection } from './ui/MotionSection';
import { AnimatedCard } from './ui/AnimatedCard';
import { GradientButton } from './ui/GradientButton';
import { cn } from '../lib/utils';
import axios from 'axios';

const API = '/api/learning';

interface LearningEntry {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  duration: number;
}

const CATEGORIES = ['Programming', 'Language', 'Design', 'Business', 'Science', 'Other'];

const categoryColors: Record<string, string> = {
  Programming: 'text-brand-cyan border-brand-cyan/30 bg-brand-cyan/10',
  Language: 'text-green-400 border-green-500/30 bg-green-500/10',
  Design: 'text-brand-purple border-brand-purple/30 bg-brand-purple/10',
  Business: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
  Science: 'text-brand-pink border-brand-pink/30 bg-brand-pink/10',
  Other: 'text-text-muted border-gray-500/30 bg-bg-tertiary0/10',
};

const emptyForm = { title: '', description: '', category: '', duration: '' };

export function LearningLog() {
  const [entries, setEntries] = useState<LearningEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Shared form state — used for both create and edit
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  /* ======== Fetch ======== */
  const fetchEntries = async () => {
    try {
      const res = await axios.get<LearningEntry[]>(API);
      setEntries(res.data);
    } catch (err) {
      console.error('Failed to fetch learning log', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEntries(); }, []);

  /* ======== Open form for New ======== */
  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  /* ======== Open form for Edit ======== */
  const openEdit = (entry: LearningEntry) => {
    setEditingId(entry.id);
    setForm({
      title: entry.title,
      description: entry.description,
      category: entry.category,
      duration: String(entry.duration),
    });
    setShowForm(true);
  };

  /* ======== Cancel Form ======== */
  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  /* ======== Submit (Create or Update) ======== */
  const submitEntry = async () => {
    if (!form.title || !form.description || !form.category || !form.duration) return;
    setSaving(true);
    try {
      if (editingId) {
        await axios.put(`${API}/${editingId}`, form);
      } else {
        await axios.post(API, { ...form, date: new Date().toISOString() });
      }
      cancelForm();
      await fetchEntries();
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setSaving(false);
    }
  };

  /* ======== Delete ======== */
  const deleteEntry = async (id: string) => {
    try {
      await axios.delete(`${API}/${id}`);
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  /* ======== Derived Stats ======== */
  const calculateStreak = () => {
    if (entries.length === 0) return 0;
    const today = new Date();
    let streak = 0;
    const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (let i = 0; i < sorted.length; i++) {
      const entryDate = new Date(sorted[i].date);
      const expected = new Date(today);
      expected.setDate(today.getDate() - i);
      if (entryDate.toDateString() === expected.toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const totalMinutes = entries.reduce((sum, e) => sum + e.duration, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const streak = calculateStreak();

  const entriesByDate = entries.reduce((acc, entry) => {
    const date = new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, LearningEntry[]>);

  return (
    <div className="space-y-8 pb-12 w-full max-w-4xl mx-auto">
      {/* Header */}
      <MotionSection delay={0.1}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold tracking-tight text-text-primary inline-block">
              Skill <span className="text-gradient-brand">Matrix</span>
            </h1>
            <p className="text-text-muted text-lg">Daily cognitive augmentation log.</p>
          </div>
          <GradientButton onClick={openNew}>
            <Plus className="w-5 h-5 mr-2" /> Log Session
          </GradientButton>
        </div>
      </MotionSection>

      {/* Stats */}
      <MotionSection delay={0.2}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatedCard className="border border-border-subtle bg-bg-tertiary">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                <Flame className="w-5 h-5 text-orange-400" />
              </div>
              <span className="text-text-muted font-medium tracking-wide">ACTIVE STREAK</span>
            </div>
            <div className="text-3xl font-bold text-text-primary tracking-tight">{streak} <span className="text-lg text-text-muted">Days</span></div>
          </AnimatedCard>

          <AnimatedCard className="border border-border-subtle bg-bg-tertiary">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-brand-cyan/10 rounded-xl border border-brand-cyan/20">
                <BookOpen className="w-5 h-5 text-brand-cyan" />
              </div>
              <span className="text-text-muted font-medium tracking-wide">LIFETIME LOGS</span>
            </div>
            <div className="text-3xl font-bold text-text-primary tracking-tight">{entries.length}</div>
          </AnimatedCard>

          <AnimatedCard className="border border-border-subtle bg-bg-tertiary">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-brand-purple/10 rounded-xl border border-brand-purple/20">
                <Calendar className="w-5 h-5 text-brand-purple" />
              </div>
              <span className="text-text-muted font-medium tracking-wide">TIME INVESTED</span>
            </div>
            <div className="text-3xl font-bold text-text-primary tracking-tight">{totalHours}h <span className="text-lg text-text-muted">{totalMinutes % 60}m</span></div>
          </AnimatedCard>
        </div>
      </MotionSection>

      {/* Add / Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-panel p-6 rounded-2xl border border-border-subtle space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-text-primary">
                  {editingId ? (
                    <span className="flex items-center gap-2">
                      <PenLine size={18} className="text-cyan-400" /> Edit Entry
                    </span>
                  ) : 'Record Session Data'}
                </h3>
                <button onClick={cancelForm} className="p-2 rounded-lg text-text-muted hover:text-text-primary transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Module Subject..."
                  className="w-full px-5 py-3 bg-bg-tertiary border border-border-subtle text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
                />
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detailed synopsis of acquired knowledge..."
                  rows={4}
                  className="w-full px-5 py-3 bg-bg-tertiary border border-border-subtle text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 resize-none font-mono text-sm leading-relaxed"
                />
                <div className="flex flex-col md:flex-row gap-4">
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="flex-1 px-5 py-3 bg-bg-tertiary border border-border-subtle text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
                  >
                    <option value="">Classification</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    placeholder="Duration (min)"
                    className="md:w-1/3 px-5 py-3 bg-bg-tertiary border border-border-subtle text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={submitEntry}
                    disabled={saving || !form.title || !form.description || !form.category || !form.duration}
                    className="btn-primary flex items-center gap-2 px-6 py-3.5"
                  >
                    {saving ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <Check size={16} />
                    )}
                    {editingId ? 'Update Entry' : 'Submit Log'}
                  </motion.button>
                  <button
                    onClick={cancelForm}
                    className="px-6 py-3 text-text-muted hover:text-text-primary transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline */}
      <MotionSection delay={0.3} className="space-y-8">
        {loading ? (
          <div className="glass-panel p-16 text-center rounded-2xl border border-border-subtle flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-brand-cyan/20 border-t-brand-cyan rounded-full animate-spin mb-4" />
            <p className="text-text-muted font-medium">Syncing cognitive nodes...</p>
          </div>
        ) : Object.keys(entriesByDate).length === 0 ? (
          <div className="glass-panel p-16 text-center rounded-2xl border border-border-subtle">
            <BookOpen className="w-16 h-16 text-brand-purple/40 mx-auto mb-4" />
            <p className="text-text-muted font-medium">No learning data found. Begin acquisition.</p>
          </div>
        ) : (
          Object.entries(entriesByDate).map(([date, dateEntries], idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={date}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2 glass-panel rounded-lg border border-border-subtle">
                  <Calendar className="w-5 h-5 text-brand-cyan" />
                </div>
                <h3 className="text-xl font-bold text-text-primary tracking-wide">{date}</h3>
                <div className="flex-1 h-px bg-bg-elevated" />
              </div>

              <div className="space-y-4 pl-4 md:pl-10 relative">
                <div className="absolute left-[27px] border-l border-border-subtle h-full top-0 md:block hidden" />
                <AnimatePresence>
                  {dateEntries.map(entry => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      className="relative group"
                    >
                      <div className="absolute -left-7 top-6 w-3 h-3 bg-brand-cyan rounded-full border border-black z-10 hidden md:block group-hover:scale-150 transition-transform hover:shadow-[0_0_10px_rgba(0,229,255,1)]" />
                      <div className="glass-panel rounded-2xl p-6 border border-border-subtle hover:border-brand-purple/30 transition-all flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        <div className="flex-1 w-full">
                          <div className="flex items-center justify-between md:justify-start gap-4 mb-3 w-full">
                            <h4 className="text-xl font-bold text-text-primary">{entry.title}</h4>
                            <span className={cn('text-xs px-3 py-1 rounded border uppercase tracking-wider font-bold', categoryColors[entry.category] || categoryColors.Other)}>
                              {entry.category}
                            </span>
                          </div>
                          <p className="text-text-muted mb-4 font-mono text-sm leading-relaxed">{entry.description}</p>
                          <div className="text-sm font-medium tracking-wide text-brand-cyan bg-brand-cyan/10 px-3 py-1 rounded inline-block">
                            Duration: {entry.duration} mins
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 self-end md:self-auto">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            onClick={() => openEdit(entry)}
                            className="p-3 text-text-muted hover:text-brand-cyan hover:bg-brand-cyan/10 rounded-xl transition-all"
                            title="Edit entry"
                          >
                            <PenLine className="w-5 h-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            onClick={() => deleteEntry(entry.id)}
                            className="p-3 text-text-muted hover:text-brand-pink hover:bg-brand-pink/10 rounded-xl transition-all"
                            title="Delete entry"
                          >
                            <Trash2 className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          ))
        )}
      </MotionSection>
    </div>
  );
}

