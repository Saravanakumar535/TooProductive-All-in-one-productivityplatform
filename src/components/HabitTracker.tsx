import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Activity, Plus, Flame, Trash2, RotateCcw } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────
interface Habit {
    id: string;
    name: string;
    currentStreak: number;
    longestStreak: number;
    completed: boolean;
    lastCompletedDate: string | null;
    createdAt: string;
}

// ── Storage helpers ────────────────────────────────────────────────
const STORAGE_KEY = 'tooproductive_habits';

function loadHabits(): Habit[] {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
}

function saveHabits(habits: Habit[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ── Reset completed status for habits not completed today ──────────
function applyDailyReset(habits: Habit[]): Habit[] {
    const today = new Date().toDateString();
    return habits.map(h => {
        if (!h.completed) return h;
        const lastDate = h.lastCompletedDate ? new Date(h.lastCompletedDate).toDateString() : null;
        if (lastDate === today) return h;

        // Streak broke if more than 1 day passed
        const daysDiff = h.lastCompletedDate
            ? Math.floor((Date.now() - new Date(h.lastCompletedDate).getTime()) / 86400000)
            : 999;

        return {
            ...h,
            completed: false,
            currentStreak: daysDiff > 1 ? 0 : h.currentStreak,
        };
    });
}

export function HabitTracker() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [newHabit, setNewHabit] = useState('');
    const [loading, setLoading] = useState(true);

    // ── Load from localStorage (with daily reset) ──
    const loadAndRefresh = useCallback(() => {
        const raw = loadHabits();
        const refreshed = applyDailyReset(raw);
        saveHabits(refreshed);
        setHabits(refreshed);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadAndRefresh();
    }, [loadAndRefresh]);

    // ── Create ──
    const createHabit = () => {
        if (!newHabit.trim()) return;
        const habit: Habit = {
            id: uid(),
            name: newHabit.trim(),
            currentStreak: 0,
            longestStreak: 0,
            completed: false,
            lastCompletedDate: null,
            createdAt: new Date().toISOString(),
        };
        const updated = [habit, ...habits];
        saveHabits(updated);
        setHabits(updated);
        setNewHabit('');
    };

    // ── Toggle ──
    const toggleHabit = (id: string) => {
        const today = new Date().toDateString();
        const updated = habits.map(h => {
            if (h.id !== id) return h;
            const lastDate = h.lastCompletedDate ? new Date(h.lastCompletedDate).toDateString() : null;
            const newCompleted = !h.completed;

            let streak = h.currentStreak;
            let longest = h.longestStreak;

            if (newCompleted) {
                if (lastDate !== today) streak = h.currentStreak + 1;
                longest = Math.max(longest, streak);
            } else {
                if (lastDate === today) streak = Math.max(0, streak - 1);
            }

            return {
                ...h,
                completed: newCompleted,
                currentStreak: streak,
                longestStreak: longest,
                lastCompletedDate: newCompleted ? new Date().toISOString() : null,
            };
        });
        saveHabits(updated);
        setHabits(updated);
    };

    // ── Delete ──
    const deleteHabit = (id: string) => {
        const updated = habits.filter(h => h.id !== id);
        saveHabits(updated);
        setHabits(updated);
    };

    if (loading) return <p className="text-text-primary">Loading...</p>;

    return (
        <div className="space-y-8 w-full max-w-5xl mx-auto pb-12">
            <div className="flex justify-between items-end flex-wrap gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-text-primary">
                        Habit <span className="text-gradient-brand">Tracker</span>
                    </h1>
                    <p className="text-text-muted mt-1 text-sm">
                        {habits.filter(h => h.completed).length} / {habits.length} completed today
                    </p>
                </div>

                <div className="flex gap-2 items-center">
                    <input
                        value={newHabit}
                        onChange={(e) => setNewHabit(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && createHabit()}
                        placeholder="New habit..."
                        className="px-3 py-2 rounded-xl bg-bg-secondary text-text-primary border border-border-subtle focus:border-accent-blue focus:outline-none"
                    />
                    <button
                        onClick={createHabit}
                        className="btn-primary px-4 py-2 rounded-xl text-white"
                    >
                        <Plus size={18} />
                    </button>
                </div>
            </div>

            {habits.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-text-muted gap-4">
                    <Activity size={48} className="opacity-30" />
                    <p className="text-lg">No habits yet. Add your first one above!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {habits.map((habit) => (
                        <motion.div
                            whileHover={{ y: -4 }}
                            key={habit.id}
                            className={`p-5 rounded-xl border transition-all shadow-sm hover:shadow-md ${habit.completed
                                ? 'border-accent-blue/40 bg-indigo-50/60'
                                : 'border-border-subtle bg-bg-primary'
                                }`}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <div
                                    onClick={() => toggleHabit(habit.id)}
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${habit.completed
                                        ? 'border-accent-blue bg-indigo-100'
                                        : 'border-border-default hover:border-accent-blue'
                                        }`}
                                >
                                    {habit.completed && (
                                        <Activity size={13} className="text-accent-blue" />
                                    )}
                                </div>

                                <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: '#f97316' }}>
                                    <Flame size={14} />
                                    {habit.currentStreak}
                                </div>
                            </div>

                            <h3 className={`font-bold mb-1 transition-colors ${habit.completed ? 'text-accent-blue line-through opacity-70' : 'text-text-primary'}`}>
                                {habit.name}
                            </h3>
                            <p className="text-text-muted text-xs mb-3">Best streak: {habit.longestStreak} days</p>

                            <button
                                onClick={() => deleteHabit(habit.id)}
                                className="text-red-400 hover:text-red-500 flex items-center gap-1 text-xs transition-colors"
                            >
                                <Trash2 size={12} /> Delete
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}

            {habits.length > 0 && (
                <div className="flex justify-end">
                    <button
                        onClick={loadAndRefresh}
                        className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
                    >
                        <RotateCcw size={12} /> Refresh streaks
                    </button>
                </div>
            )}
        </div>
    );
}
