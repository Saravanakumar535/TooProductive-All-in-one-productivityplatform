import { useState, useEffect, useCallback } from 'react';
import {
  CheckSquare, BookOpen, Wallet, Target, TrendingUp, Flame, Award,
  Calendar, Trello, Activity, Timer, BookDashed, RefreshCw, Brain
} from 'lucide-react';
import { View } from '../App';
import { MotionSection } from './ui/MotionSection';
import { AnimatedCard } from './ui/AnimatedCard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API = '/api/dashboard';

interface DashboardProps {
  onViewChange: (view: View) => void;
}

interface DashStats {
  tasksCompleted: number;
  totalTasks: number;
  habitsCompleted: number;
  totalHabits: number;
  currentHabitStreak: number;
  longestHabitStreak: number;
  goalsAchieved: number;
  totalGoals: number;
  totalLearningMins: number;
  learningStreak: number;
  totalJournalEntries: number;
}

interface WeeklyPoint {
  day: string;
  tasks: number;
  learning: number;
  habits: number;
}

interface DashboardData {
  user: { xp: number; level: number; name: string | null };
  stats: DashStats;
  weeklyActivity: WeeklyPoint[];
}

const defaultData: DashboardData = {
  user: { xp: 0, level: 1, name: null },
  stats: {
    tasksCompleted: 0, totalTasks: 0,
    habitsCompleted: 0, totalHabits: 0,
    currentHabitStreak: 0, longestHabitStreak: 0,
    goalsAchieved: 0, totalGoals: 0,
    totalLearningMins: 0, learningStreak: 0,
    totalJournalEntries: 0,
  },
  weeklyActivity: [],
};

// Custom Tooltip for chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-secondary/95 border border-border-subtle rounded-xl p-3 text-sm shadow-xl backdrop-blur-sm">
      <p className="text-text-primary font-bold mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-text-muted capitalize">{p.name}:</span>
          <span className="text-text-primary font-semibold">
            {p.name === 'learning' ? `${p.value * 10}m` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export function Dashboard({ onViewChange }: DashboardProps) {
  const [data, setData] = useState<DashboardData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboard = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await axios.get<DashboardData>(API);
      setData(res.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard fetch failed', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchDashboard(), 30_000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const { stats, user, weeklyActivity } = data;
  const totalLearningHours = Math.floor(stats.totalLearningMins / 60);
  const totalLearningRemMins = stats.totalLearningMins % 60;

  // XP progress to next level (100 XP per level)
  const xpForNextLevel = (user.level) * 100;
  const xpProgress = Math.min((user.xp % xpForNextLevel) / xpForNextLevel * 100, 100);

  const statCards = [
    {
      title: 'Active Tasks',
      value: loading ? 'â€”' : `${stats.tasksCompleted}/${stats.totalTasks}`,
      subtitle: 'Completed today',
      icon: CheckSquare,
      color: 'text-brand-cyan',
      glow: 'group-hover:shadow-[0_0_30px_rgba(0,229,255,0.15)]',
      view: 'tasks' as View,
    },
    {
      title: 'Habits',
      value: loading ? 'â€”' : `${stats.habitsCompleted}/${stats.totalHabits}`,
      subtitle: `ðŸ”¥ ${stats.currentHabitStreak} day streak`,
      icon: Activity,
      color: 'text-brand-pink',
      glow: 'group-hover:shadow-[0_0_30px_rgba(255,0,128,0.15)]',
      view: 'habits' as View,
    },
    {
      title: 'Life Targets',
      value: loading ? 'â€”' : `${stats.goalsAchieved}/${stats.totalGoals}`,
      subtitle: 'Goals crushed',
      icon: Target,
      color: 'text-brand-purple',
      glow: 'group-hover:shadow-[0_0_30px_rgba(176,38,255,0.15)]',
      view: 'goals' as View,
    },
    {
      title: 'Learning',
      value: loading ? 'â€”' : `${totalLearningHours}h ${totalLearningRemMins}m`,
      subtitle: `ðŸ“š ${stats.learningStreak} day streak`,
      icon: Brain,
      color: 'text-green-400',
      glow: 'group-hover:shadow-[0_0_30px_rgba(74,222,128,0.15)]',
      view: 'learning' as View,
    },
    {
      title: 'Journal',
      value: loading ? 'â€”' : stats.totalJournalEntries.toString(),
      subtitle: 'Entries written',
      icon: BookDashed,
      color: 'text-gray-300',
      glow: 'group-hover:shadow-[0_0_30px_rgba(255,255,255,0.08)]',
      view: 'journal' as View,
    },
    {
      title: 'Daily Planner',
      value: 'Timeline',
      subtitle: 'Schedule your day',
      icon: Calendar,
      color: 'text-brand-purple',
      glow: 'group-hover:shadow-[0_0_30px_rgba(176,38,255,0.15)]',
      view: 'planner' as View,
    },
    {
      title: 'Work Board',
      value: 'Kanban',
      subtitle: 'Agile execution',
      icon: Trello,
      color: 'text-brand-cyan',
      glow: 'group-hover:shadow-[0_0_30px_rgba(0,229,255,0.15)]',
      view: 'kanban' as View,
    },
    {
      title: 'Focus Timer',
      value: 'Pomodoro',
      subtitle: 'Deep work sessions',
      icon: Timer,
      color: 'text-brand-purple',
      glow: 'group-hover:shadow-[0_0_30px_rgba(176,38,255,0.15)]',
      view: 'pomodoro' as View,
    },
  ];

  // Dynamic trophies based on real data
  const trophies = [
    {
      title: 'Task Crusher',
      desc: `${stats.tasksCompleted} tasks completed`,
      icon: CheckSquare,
      color: 'text-brand-cyan',
      bg: 'bg-brand-cyan/10',
      earned: stats.tasksCompleted >= 1,
    },
    {
      title: 'Habit Builder',
      desc: `${stats.longestHabitStreak} day best streak`,
      icon: Flame,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      earned: stats.longestHabitStreak >= 3,
    },
    {
      title: 'Knowledge Seeker',
      desc: `${totalLearningHours}h ${totalLearningRemMins}m learned`,
      icon: BookOpen,
      color: 'text-brand-purple',
      bg: 'bg-brand-purple/10',
      earned: stats.totalLearningMins >= 60,
    },
    {
      title: 'Goal Crusher',
      desc: `${stats.goalsAchieved} goals achieved`,
      icon: Target,
      color: 'text-brand-pink',
      bg: 'bg-brand-pink/10',
      earned: stats.goalsAchieved >= 1,
    },
    {
      title: 'Journalist',
      desc: `${stats.totalJournalEntries} entries written`,
      icon: BookDashed,
      color: 'text-gray-300',
      bg: 'bg-gray-50',
      earned: stats.totalJournalEntries >= 1,
    },
  ].filter(t => t.earned);

  return (
    <div className="space-y-8 pb-12 overflow-x-hidden">
      {/* Header */}
      <MotionSection delay={0.1}>
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold tracking-tight text-text-primary inline-block">
              Command <span className="text-gradient-brand">Center</span>
            </h1>
            <p className="text-text-muted text-lg">Your entire operating system, visualized.</p>
          </div>

          {/* Refresh + Last Updated */}
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-text-muted">
                Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => fetchDashboard(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-secondary border border-border-subtle text-text-muted hover:text-text-primary transition-colors text-sm"
            >
              <motion.div animate={refreshing ? { rotate: 360 } : {}} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <RefreshCw size={14} />
              </motion.div>
              Refresh
            </motion.button>
          </div>
        </div>
      </MotionSection>

      {/* XP / Level Bar */}
      {!loading && (
        <MotionSection delay={0.15}>
          <div className="glass-panel p-4 rounded-2xl border border-border-subtle flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {user.level}
              </div>
              <div>
                <div className="text-text-primary font-bold">Level {user.level}</div>
                <div className="text-text-muted text-xs">{user.xp} XP total</div>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex justify-between text-xs text-text-muted mb-1.5">
                <span>Progress to Level {user.level + 1}</span>
                <span>{user.xp % xpForNextLevel} / {xpForNextLevel} XP</span>
              </div>
              <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                  className="h-full rounded-full bg-gradient-to-r from-accent-blue to-accent-purple"
                />
              </div>
            </div>

            <div className="flex gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-text-primary">{stats.tasksCompleted}</div>
                <div className="text-xs text-text-muted">Tasks Done</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-500">{stats.currentHabitStreak}</div>
                <div className="text-xs text-text-muted">Day Streak</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">{stats.learningStreak}</div>
                <div className="text-xs text-text-muted">Learn Streak</div>
              </div>
            </div>
          </div>
        </MotionSection>
      )}

      {/* Stats Grid */}
      <MotionSection delay={0.2}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 perspective-1000">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <AnimatedCard
                key={stat.title}
                onClick={() => onViewChange(stat.view)}
                className={`group transition-shadow ${stat.glow}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-bg-tertiary border border-border-subtle group-hover:bg-bg-elevated transition-colors ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={stat.value}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-bold text-text-primary mb-1 group-hover:scale-105 origin-left transition-transform"
                  >
                    {stat.value}
                  </motion.div>
                </AnimatePresence>
                <div className="text-text-secondary font-medium tracking-wide text-sm">{stat.title}</div>
                <div className="text-xs text-text-muted mt-1">{stat.subtitle}</div>
              </AnimatedCard>
            );
          })}
        </div>
      </MotionSection>

      {/* Charts & Trophies */}
      <MotionSection delay={0.3}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 perspective-1000">

          {/* Output Velocity Chart */}
          <div className="lg:col-span-2 relative group h-full">
            <AnimatedCard tilt={false} className="h-full border border-border-subtle bg-bg-secondary/60">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-brand-cyan" /> Output Velocity
                </h3>
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-brand-cyan" /> Tasks
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-brand-purple" /> Learning
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-brand-pink" /> Habits
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="h-[280px] flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-brand-cyan/20 border-t-brand-cyan rounded-full animate-spin" />
                </div>
              ) : weeklyActivity.length === 0 ? (
                <div className="h-[280px] flex flex-col items-center justify-center text-gray-400 gap-2">
                  <TrendingUp size={40} className="opacity-30" />
                  <p className="text-sm">Complete tasks, habits & learning to see your velocity chart</p>
                </div>
              ) : (
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyActivity} barGap={2} barCategoryGap="25%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="day" stroke="#94a3b8" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(79,70,229,0.04)' }} />
                      <Bar dataKey="tasks" name="tasks" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={24} />
                      <Bar dataKey="learning" name="learning" fill="#7c3aed" radius={[4, 4, 0, 0]} maxBarSize={24} />
                      <Bar dataKey="habits" name="habits" fill="#db2777" radius={[4, 4, 0, 0]} maxBarSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </AnimatedCard>
          </div>

          {/* Trophies */}
          <div className="lg:col-span-1 h-full">
            <AnimatedCard tilt={false} className="h-full border border-border-subtle bg-bg-secondary/60">
              <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-brand-pink" /> Trophies
              </h3>
              <div className="space-y-3">
                {loading ? (
                  [1, 2, 3].map(i => (
                    <div key={i} className="h-16 rounded-xl skeleton" />
                  ))
                ) : trophies.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-3">
                    <Award size={40} className="opacity-20" />
                    <p className="text-sm text-center">Complete tasks, habits & goals<br />to earn trophies!</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {trophies.map((t, i) => (
                      <motion.div
                        key={t.title}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-center gap-3 p-3 rounded-xl border border-border-subtle bg-bg-tertiary hover:bg-bg-elevated transition-colors"
                      >
                        <div className={`p-2.5 rounded-xl ${t.bg} flex-shrink-0`}>
                          <t.icon className={`w-4 h-4 ${t.color}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-text-primary font-medium text-sm truncate">{t.title}</div>
                          <div className="text-xs text-text-muted truncate">{t.desc}</div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </AnimatedCard>
          </div>

        </div>
      </MotionSection>
    </div>
  );
}
