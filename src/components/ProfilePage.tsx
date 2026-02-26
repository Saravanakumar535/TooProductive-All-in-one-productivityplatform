import { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Calendar, Shield, Code, Braces, Zap } from 'lucide-react';
import { User } from '../App';
import { motion } from 'framer-motion';
import axios from 'axios';

interface ProfilePageProps {
    user: User;
}

const techCategories = [
    'React', 'TypeScript', 'Node.js', 'Python', 'Rust', 'Go',
    'DevOps', 'AI/ML', 'Web3', 'System Design', 'Security', 'Mobile',
];

export function ProfilePage({ user }: ProfilePageProps) {
    const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
        const saved = localStorage.getItem('tooproductive_preferred_categories');
        return saved ? JSON.parse(saved) : ['React', 'TypeScript', 'Node.js'];
    });
    const [stats, setStats] = useState({ tasks: 0, streak: 0, goals: 0, xp: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('/api/dashboard', { params: { userId: user.id } });
                const d = res.data;
                setStats({
                    tasks: d.stats?.tasksCompleted || 0, streak: d.stats?.currentHabitStreak || 0,
                    goals: d.stats?.goalsActive || 0, xp: d.user?.xp || 0
                });
            } catch (err) { console.error('Profile stats error', err); }
        };
        fetchStats();
    }, [user.id]);

    const toggleCategory = (cat: string) => {
        const updated = selectedCategories.includes(cat)
            ? selectedCategories.filter(c => c !== cat)
            : [...selectedCategories, cat];
        setSelectedCategories(updated);
        localStorage.setItem('tooproductive_preferred_categories', JSON.stringify(updated));
    };

    return (
        <div className="pb-16 max-w-4xl mx-auto">
            <h1 className="text-4xl font-extrabold text-text-primary mb-10 tracking-tight">
                Your <span className="text-gradient-brand">Profile</span>
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* User Info */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="dark-card md:col-span-2">
                    <div className="flex items-start gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                            {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xl font-bold text-text-primary">{user.name || 'User'}</h2>
                            <p className="text-text-muted text-sm flex items-center gap-1.5 mt-1">
                                <Mail className="w-3.5 h-3.5" /> {user.email}
                            </p>
                            <div className="flex items-center gap-3 mt-2.5">
                                <span className="px-3 py-1 rounded-lg bg-indigo-50 text-accent-blue text-xs font-semibold flex items-center gap-1">
                                    <Shield className="w-3 h-3" /> Developer
                                </span>
                                <span className="text-text-muted text-xs flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> Member since 2026
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Stats */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="dark-card">
                    <h3 className="text-base font-bold text-text-primary mb-4">Quick Stats</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Tasks Done', value: stats.tasks, color: 'text-accent-blue' },
                            { label: 'Day Streak', value: stats.streak, color: 'text-accent-orange' },
                            { label: 'Active Goals', value: stats.goals, color: 'text-accent-green' },
                            { label: 'Total XP', value: stats.xp, color: 'text-accent-purple' },
                        ].map(s => (
                            <div key={s.label} className="text-center p-3 rounded-xl bg-bg-secondary">
                                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                                <div className="text-text-muted text-xs mt-0.5">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Preferred Categories */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="dark-card mt-6">
                <h3 className="text-base font-bold text-text-primary mb-2">Preferred Tech Categories</h3>
                <p className="text-text-muted text-sm mb-5">Select topics you're interested in to personalize your news feed.</p>
                <div className="flex flex-wrap gap-2.5">
                    {techCategories.map(cat => (
                        <button key={cat} onClick={() => toggleCategory(cat)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${selectedCategories.includes(cat)
                                    ? 'bg-indigo-50 border-indigo-200 text-accent-blue'
                                    : 'bg-bg-secondary border-border-subtle text-text-secondary hover:border-border-default hover:bg-bg-tertiary'
                                }`}>
                            {cat}
                        </button>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
