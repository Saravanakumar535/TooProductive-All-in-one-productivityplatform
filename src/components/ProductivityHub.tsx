import {
    CheckSquare, Trello, Activity, Timer, BookDashed, Calendar, Lightbulb,
    Target, DollarSign, BookOpen, GraduationCap, TrendingUp, ArrowRight
} from 'lucide-react';
import { View } from '../App';
import { motion } from 'framer-motion';

interface ProductivityHubProps {
    onViewChange: (view: View) => void;
}

const tools = [
    { id: 'dashboard' as View, title: 'Dashboard', desc: 'Your command center with stats, charts, and trophies.', icon: TrendingUp, gradient: 'from-blue-500 to-cyan-400' },
    { id: 'planner' as View, title: 'Daily Planner', desc: 'Plan your day with a visual timeline scheduler.', icon: Calendar, gradient: 'from-violet-500 to-purple-400' },
    { id: 'tasks' as View, title: 'Task Manager', desc: 'Organize tasks with priorities, categories, and due dates.', icon: CheckSquare, gradient: 'from-orange-500 to-amber-400' },
    { id: 'kanban' as View, title: 'Kanban Board', desc: 'Agile workflow with drag-and-drop columns.', icon: Trello, gradient: 'from-cyan-500 to-teal-400' },
    { id: 'habits' as View, title: 'Habit Tracker', desc: 'Build lasting routines with streak tracking.', icon: Activity, gradient: 'from-emerald-500 to-green-400' },
    { id: 'pomodoro' as View, title: 'Focus Timer', desc: 'Deep work sessions with Pomodoro technique.', icon: Timer, gradient: 'from-rose-500 to-pink-400' },
    { id: 'journal' as View, title: 'Journal', desc: 'Capture thoughts and reflections daily.', icon: BookDashed, gradient: 'from-amber-500 to-yellow-400' },
    { id: 'learning' as View, title: 'Learning Log', desc: 'Track your learning hours and streaks.', icon: Lightbulb, gradient: 'from-yellow-500 to-orange-400' },
    { id: 'goals' as View, title: 'Goals', desc: 'Set and track life targets with progress bars.', icon: Target, gradient: 'from-purple-500 to-indigo-400' },
    { id: 'finance' as View, title: 'Finance Tracker', desc: 'Monitor income, expenses, and budgets.', icon: DollarSign, gradient: 'from-green-500 to-emerald-400' },
    { id: 'reading' as View, title: 'Reading Tracker', desc: 'Track books, highlights, and reading goals.', icon: BookOpen, gradient: 'from-indigo-500 to-blue-400' },
    { id: 'student' as View, title: 'Student Hub', desc: 'Subjects, study sessions, and timetable.', icon: GraduationCap, gradient: 'from-teal-500 to-cyan-400' },
    { id: 'stocks' as View, title: 'Market Watch', desc: 'Track stocks and market trends.', icon: TrendingUp, gradient: 'from-lime-500 to-green-400' },
];

export function ProductivityHub({ onViewChange }: ProductivityHubProps) {
    return (
        <div className="pb-16">
            <div className="mb-10">
                <h1 className="text-4xl md:text-[2.75rem] font-extrabold text-text-primary mb-3 tracking-tight">
                    Productivity <span className="text-gradient-brand">Tools</span>
                </h1>
                <p className="text-text-secondary text-lg leading-relaxed max-w-2xl">Your entire operating system. Choose a tool to get started.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tools.map((tool, i) => {
                    const Icon = tool.icon;
                    return (
                        <motion.button
                            key={tool.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            whileHover={{ y: -4, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onViewChange(tool.id)}
                            className="dark-card text-left group relative overflow-hidden"
                        >
                            {/* Gradient accent line */}
                            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tool.gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />

                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-5 shadow-lg`}>
                                <Icon className="w-6 h-6 text-white" />
                            </div>

                            <h3 className="text-text-primary font-bold text-base mb-2 group-hover:text-accent-blue transition-colors">
                                {tool.title}
                            </h3>
                            <p className="text-text-muted text-[0.8125rem] leading-relaxed mb-4">{tool.desc}</p>

                            <div className="flex items-center gap-1.5 text-accent-blue text-[0.8125rem] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                Open <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
