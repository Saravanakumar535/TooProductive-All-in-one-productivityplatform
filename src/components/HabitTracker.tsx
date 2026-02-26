import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Plus, Flame, Trash2 } from 'lucide-react';
import axios from 'axios';

export function HabitTracker() {
    const [habits, setHabits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newHabit, setNewHabit] = useState("");

    // Fetch habits
    const fetchHabits = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/habits');
            setHabits(res.data);
        } catch (err) {
            console.error("Failed to fetch habits", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHabits();
    }, []);

    // Create Habit
    const createHabit = async () => {
        if (!newHabit.trim()) return;

        try {
            await axios.post('http://localhost:5000/api/habits', {
                name: newHabit
            });
            setNewHabit("");
            fetchHabits();
        } catch (err) {
            console.error("Failed to create habit", err);
        }
    };

    // Toggle Habit
    const toggleHabit = async (id: string) => {
        try {
            await axios.put(`http://localhost:5000/api/habits/${id}/toggle`);
            fetchHabits();
        } catch (err) {
            console.error("Toggle failed", err);
        }
    };

    // Delete Habit
    const deleteHabit = async (id: string) => {
        try {
            await axios.delete(`http://localhost:5000/api/habits/${id}`);
            fetchHabits();
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    if (loading) return <p className="text-text-primary">Loading...</p>;

    return (
        <div className="space-y-8 w-full max-w-5xl mx-auto pb-12">

            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold text-text-primary">
                        Habit <span className="text-gradient-brand">Tracker</span>
                    </h1>
                </div>

                <div className="flex gap-2">
                    <input
                        value={newHabit}
                        onChange={(e) => setNewHabit(e.target.value)}
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

            {/* Habit Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {habits.map((habit) => (
                    <motion.div
                        whileHover={{ y: -5 }}
                        key={habit.id}
                        className="p-5 rounded-xl border border-border-subtle bg-bg-primary shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <div
                                onClick={() => toggleHabit(habit.id)}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer ${habit.completed
                                    ? 'border-accent-blue bg-indigo-50'
                                    : 'border-border-default'
                                    }`}
                            >
                                {habit.completed && (
                                    <Activity size={14} className="text-accent-blue" />
                                )}
                            </div>

                            <div className="flex items-center gap-1 text-accent-orange text-sm">
                                <Flame size={14} />
                                {habit.currentStreak}
                            </div>
                        </div>

                        <h3 className="text-text-primary font-bold mb-3">
                            {habit.name}
                        </h3>

                        <button
                            onClick={() => deleteHabit(habit.id)}
                            className="text-red-500 hover:text-red-600 flex items-center gap-1 text-sm transition-colors"
                        >
                            <Trash2 size={14} />
                            Delete
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
