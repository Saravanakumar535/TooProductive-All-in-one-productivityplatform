import { useState, useEffect } from 'react';
import { Plus, Target, Trophy, Star, Trash2, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MotionSection } from './ui/MotionSection';
import { AnimatedCard } from './ui/AnimatedCard';
import { GradientButton } from './ui/GradientButton';
import { cn } from '../lib/utils';

interface Goal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  category: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  xpReward: number;
}

export function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [userXP, setUserXP] = useState(0);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetValue: '',
    unit: '',
    category: '',
  });

  const [loading, setLoading] = useState(true);

  const fetchGoalsAndXP = async () => {
    try {
      const res = await fetch('/api/goals');
      if (res.ok) {
        const data = await res.json();
        setGoals(data.goals);
        setUserXP(data.xp);
      }
    } catch (e) {
      console.error('Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoalsAndXP();
  }, []);

  const addGoal = async () => {
    if (!newGoal.title || !newGoal.targetValue || !newGoal.unit || !newGoal.category) return;

    const targetValue = parseInt(newGoal.targetValue);
    const xpReward = Math.floor(targetValue / 2) + 50;

    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newGoal.title,
          description: newGoal.description,
          targetValue,
          unit: newGoal.unit,
          category: newGoal.category,
          xpReward
        })
      });

      if (res.ok) {
        const goal = await res.json();
        setGoals([goal, ...goals]);
        setNewGoal({ title: '', description: '', unit: '', targetValue: '', category: '' });
        setShowAddForm(false);
      }
    } catch (e) {
      console.error('Failed to create goal');
    }
  };

  const updateProgress = async (id: string, value: number) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;

    const newValue = Math.min(value, goal.targetValue);
    const isNowCompleted = newValue >= goal.targetValue;

    // Optimistic UI update
    setGoals(goals.map(g => {
      if (g.id === id) {
        if (!g.completed && isNowCompleted) {
          setUserXP(prev => prev + g.xpReward);
          return { ...g, currentValue: newValue, completed: true, completedAt: new Date().toISOString() };
        }
        return { ...g, currentValue: newValue };
      }
      return g;
    }));

    try {
      await fetch(`/api/goals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentValue: newValue })
      });
    } catch (e) {
      console.error('Failed to update goal progress');
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const res = await fetch(`/api/goals/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setGoals(goals.filter(g => g.id !== id));
      }
    } catch (e) {
      console.error('Failed to delete goal');
    }
  };

  const level = Math.floor(userXP / 1000) + 1;
  const xpProgress = (userXP % 1000) / 10;

  const completedGoals = goals.filter(g => g.completed).length;
  const totalGoals = goals.length;

  const categories = ['Health', 'Career', 'Learning', 'Finance', 'Personal', 'Other'];

  const categoryColors: Record<string, string> = {
    Health: 'text-green-400 border-green-500/30 bg-green-500/10',
    Career: 'text-brand-cyan border-brand-cyan/30 bg-brand-cyan/10',
    Learning: 'text-brand-purple border-brand-purple/30 bg-brand-purple/10',
    Finance: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
    Personal: 'text-brand-pink border-brand-pink/30 bg-brand-pink/10',
    Other: 'text-text-muted border-gray-500/30 bg-bg-tertiary0/10',
  };

  return (
    <div className="space-y-8 pb-12 w-full max-w-5xl mx-auto">
      <MotionSection delay={0.1}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold tracking-tight text-text-primary inline-block">
              Objective <span className="text-gradient-brand">Tracker</span>
            </h1>
            <p className="text-text-muted text-lg">Gamified achievement system.</p>
          </div>
          <GradientButton onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-5 h-5 mr-2" /> Define Objective
          </GradientButton>
        </div>
      </MotionSection>

      {/* Level & XP Card */}
      <MotionSection delay={0.2}>
        <div className="relative rounded-3xl p-8 overflow-hidden group border border-border-subtle bg-white shadow-xl shadow-indigo-100/50">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-violet-50/50 pointer-events-none" />
          <div className="absolute -inset-[100%] bg-[linear-gradient(to_right,rgba(255,255,255,0)_0%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0)_100%)] rotate-12 -translate-y-1/2 group-hover:translate-x-[200%] transition-transform duration-[2s] ease-in-out pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 relative z-10 gap-6">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-bg-tertiary rounded-2xl border border-border-subtle shadow-sm group-hover:scale-105 transition-transform duration-500">
                <Trophy className="w-12 h-12 text-accent-purple" />
              </div>
              <div>
                <div className="text-sm font-bold tracking-[0.2em] text-text-muted mb-1 uppercase">Operator Level</div>
                <div className="text-6xl font-black text-text-primary tracking-tighter">
                  {level}
                </div>
              </div>
            </div>
            <div className="text-left md:text-right">
              <div className="text-sm font-bold tracking-[0.2em] text-text-muted mb-1 uppercase">Cumulative XP</div>
              <div className="text-4xl font-bold text-accent-blue tracking-tight">{userXP.toLocaleString()}</div>
            </div>
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between text-xs font-bold tracking-widest text-text-muted mb-3">
              <span>PROGRESS TO LVL {level + 1}</span>
              <span className="text-text-primary">{userXP % 1000} / 1000 XP</span>
            </div>
            <div className="w-full bg-bg-tertiary border border-border-subtle rounded-full h-3 p-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-gradient-to-r from-brand-purple via-brand-pink to-brand-cyan h-full rounded-full relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 w-full animate-[pulse_2s_infinite]" />
              </motion.div>
            </div>
          </div>
        </div>
      </MotionSection>

      {/* Stats */}
      <MotionSection delay={0.3}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatedCard className="border border-border-subtle bg-bg-tertiary">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-brand-cyan/10 rounded-xl border border-brand-cyan/20">
                <Target className="w-5 h-5 text-brand-cyan" />
              </div>
              <span className="text-text-muted font-medium tracking-wide">ACTIVE OBJECTIVES</span>
            </div>
            <div className="text-3xl font-bold text-text-primary tracking-tight">{totalGoals - completedGoals}</div>
          </AnimatedCard>

          <AnimatedCard className="border border-border-subtle bg-bg-tertiary">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                <Award className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-text-muted font-medium tracking-wide">MISSIONS CLEARED</span>
            </div>
            <div className="text-3xl font-bold text-text-primary tracking-tight">{completedGoals}</div>
          </AnimatedCard>

          <AnimatedCard className="border border-border-subtle bg-bg-tertiary">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-brand-purple/10 rounded-xl border border-brand-purple/20">
                <Star className="w-5 h-5 text-brand-purple" />
              </div>
              <span className="text-text-muted font-medium tracking-wide">SUCCESS RATE</span>
            </div>
            <div className="text-3xl font-bold text-text-primary tracking-tight">
              {totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0}%
            </div>
          </AnimatedCard>
        </div>
      </MotionSection>

      {/* Add Goal Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="glass-panel p-6 rounded-2xl border border-border-subtle space-y-4">
              <h3 className="text-xl font-bold text-text-primary mb-2">Define New Objective</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="Objective designation"
                  className="w-full px-5 py-3 bg-bg-tertiary border border-border-subtle text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
                  required
                />
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Operational parameters (optional)"
                  rows={2}
                  className="w-full px-5 py-3 bg-bg-tertiary border border-border-subtle text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 resize-none font-mono text-sm leading-relaxed"
                />
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    type="number"
                    value={newGoal.targetValue}
                    onChange={(e) => setNewGoal({ ...newGoal, targetValue: e.target.value })}
                    placeholder="Target metric"
                    className="flex-1 px-5 py-3 bg-bg-tertiary border border-border-subtle text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
                    required
                  />
                  <input
                    type="text"
                    value={newGoal.unit}
                    onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                    placeholder="Unit (km, hrs, reps)"
                    className="flex-1 px-5 py-3 bg-bg-tertiary border border-border-subtle text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
                    required
                  />
                  <select
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                    className="flex-1 px-5 py-3 bg-bg-tertiary border border-border-subtle text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
                    required
                  >
                    <option value="">Classification</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <GradientButton onClick={addGoal} className="flex-1 md:flex-none">
                    Initialize Objective
                  </GradientButton>
                  <button onClick={() => setShowAddForm(false)} className="px-6 py-3 text-text-muted hover:text-text-primary transition-colors font-medium">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goals List */}
      <MotionSection delay={0.4} className="space-y-4">
        <h3 className="text-xl font-bold text-text-primary mb-6 border-b border-border-subtle pb-4 inline-block">Active Directives</h3>
        {loading ? (
          <div className="glass-panel p-16 text-center rounded-2xl border border-border-subtle flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-brand-cyan/20 border-t-brand-cyan rounded-full animate-spin mb-4" />
            <p className="text-text-muted font-medium">Syncing objective parameters...</p>
          </div>
        ) : goals.length === 0 ? (
          <div className="glass-panel p-20 text-center rounded-2xl border border-border-subtle">
            <Target className="w-20 h-20 text-brand-purple/40 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-text-primary mb-2">No active directives.</h3>
            <p className="text-text-muted font-medium">Define a new objective to begin earning XP.</p>
          </div>
        ) : (
          goals.map((goal, i) => {
            const progress = (goal.currentValue / goal.targetValue) * 100;
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={goal.id}
                className={cn(
                  "p-8 rounded-2xl border transition-all relative overflow-hidden group",
                  goal.completed ? "bg-green-500/5 border-green-500/20" : "glass-panel border-border-subtle hover:border-brand-purple/30"
                )}
              >
                {goal.completed && (
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent pointer-events-none" />
                )}
                <div className="flex flex-col md:flex-row items-start justify-between mb-8 gap-4 relative z-10">
                  <div className="flex-1 pr-8">
                    <div className="flex flex-wrap items-center gap-4 mb-3">
                      <h3 className="text-2xl font-bold text-text-primary tracking-wide">{goal.title}</h3>
                      <span className={cn("text-xs px-3 py-1.5 rounded uppercase font-bold tracking-widest", categoryColors[goal.category] || categoryColors.Other)}>
                        {goal.category}
                      </span>
                      {goal.completed && (
                        <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-green-500/20 text-green-400 rounded uppercase font-bold tracking-widest border border-green-500/30">
                          <Trophy className="w-3.5 h-3.5" /> MISSION CLEARED
                        </span>
                      )}
                    </div>
                    {goal.description && (
                      <p className="text-text-muted text-sm mb-4 font-mono leading-relaxed max-w-2xl">{goal.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Star className={cn("w-4.5 h-4.5", goal.completed ? "text-green-500" : "text-yellow-500")} fill={goal.completed ? "currentColor" : "none"} />
                      <span className="text-text-primary font-bold tracking-wide">{goal.xpReward} XP BOUNTY</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="p-3 text-text-muted hover:text-brand-pink hover:bg-brand-pink/10 rounded-xl transition-all self-end md:self-auto opacity-0 group-hover:opacity-100 absolute top-4 right-4 md:relative md:top-auto md:right-auto"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-6 relative z-10">
                  <div className="flex items-center justify-between text-sm font-bold tracking-widest text-text-muted mb-2 font-mono">
                    <span>COMPLETION RATIO</span>
                    <span className="text-text-primary">{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                  </div>
                  <div className="w-full bg-bg-tertiary border border-border-subtle rounded-full h-3 p-0.5">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden",
                        goal.completed ? "bg-gradient-to-r from-green-400 to-green-500" : "bg-gradient-to-r from-brand-cyan to-brand-purple"
                      )}
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 w-full animate-pulse" />
                    </div>
                  </div>
                </div>

                {!goal.completed && (
                  <div className="flex flex-col md:flex-row gap-4 relative z-10">
                    <div className="flex-1 flex gap-4 max-w-sm">
                      <input
                        type="number"
                        min="0"
                        max={goal.targetValue}
                        value={goal.currentValue}
                        onChange={(e) => updateProgress(goal.id, parseInt(e.target.value) || 0)}
                        className="w-full px-5 py-3 bg-black/40 border border-border-subtle text-text-primary rounded-xl focus:outline-none focus:border-brand-cyan text-center font-bold"
                        placeholder="Log progress"
                      />
                      <button
                        onClick={() => updateProgress(goal.id, goal.targetValue)}
                        className="px-6 auto py-3 border border-green-500/50 bg-green-500/10 text-green-400 rounded-xl hover:bg-green-500/20 transition-colors font-bold tracking-wide whitespace-nowrap"
                      >
                        100% EXECUTED
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </MotionSection>
    </div>
  );
}

