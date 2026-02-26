import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MotionSection } from './ui/MotionSection';
import { Calendar as CalendarIcon, Clock, ArrowRight, Trash2, Save } from 'lucide-react';
import { AnimatedCard } from './ui/AnimatedCard';

export function DailyPlanner() {
    const timeBlocks = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

    const [schedule, setSchedule] = useState<Record<number, string>>({});

    // ✅ Load from localStorage on first render
    useEffect(() => {
        const saved = localStorage.getItem("dailyPlannerSchedule");
        if (saved) {
            setSchedule(JSON.parse(saved));
        }
    }, []);

    // ✅ Auto-save whenever schedule changes
    useEffect(() => {
        localStorage.setItem("dailyPlannerSchedule", JSON.stringify(schedule));
    }, [schedule]);

    const handleScheduleChange = (hour: number, value: string) => {
        setSchedule(prev => ({ ...prev, [hour]: value }));
    };

    // ✅ Optimize schedule function
    const optimizeSchedule = () => {
        const newSchedule = { ...schedule };
        let deepWorkAdded = 0;

        for (let hour of timeBlocks) {
            if (!newSchedule[hour] && deepWorkAdded < 4) {
                newSchedule[hour] = "Deep Work Session";                
                deepWorkAdded++;
            }
        }

        setSchedule(newSchedule);
    };

    // ✅ Clear all tasks
    const clearSchedule = () => {
        setSchedule({});
        localStorage.removeItem("dailyPlannerSchedule");
    };

    // ✅ Calculate Deep Work Hours dynamically
    const deepWorkHours = Object.values(schedule).filter(
        task => task?.toLowerCase().includes("deep")
    ).length;

    return (
        <div className="space-y-8 w-full max-w-5xl mx-auto pb-12">
            <MotionSection delay={0.1}>
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-bold tracking-tight text-text-primary inline-block">
                        Daily <span className="text-gradient-brand">Planner</span>
                    </h1>
                    <p className="text-text-muted text-lg">Timeline schedule and day architecture.</p>
                </div>
            </MotionSection>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <MotionSection delay={0.2} className="lg:col-span-2">
                    <div className="glass-panel p-6 rounded-2xl border border-border-subtle space-y-4">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-subtle">
                            <CalendarIcon className="w-6 h-6 text-brand-cyan" />
                            <h2 className="text-xl font-bold text-text-primary">Today's Timeline</h2>
                        </div>

                        <div className="space-y-4 relative">
                            <div className="absolute left-6 top-4 bottom-4 w-px bg-bg-elevated" />

                            {timeBlocks.map((hour, index) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    key={hour}
                                    className="flex items-start gap-6 group"
                                >
                                    <div className="text-xs font-medium text-text-muted w-12 pt-4">
                                        {hour % 12 || 12}:00 {hour >= 12 ? 'PM' : 'AM'}
                                    </div>

                                    <div className="flex-1 bg-white p-2 rounded-xl border border-border-subtle min-h-[60px] flex items-center shadow-sm group-hover:border-accent-blue/30 transition-colors">
                                        <input
                                            type="text"
                                            value={schedule[hour] || ''}
                                            onChange={(e) => handleScheduleChange(hour, e.target.value)}
                                            placeholder="Click to schedule time block..."
                                            className="w-full bg-transparent border-none outline-none text-text-primary placeholder-gray-500/50 px-2"
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </MotionSection>

                <div className="space-y-6">
                    <MotionSection delay={0.3}>
                        <AnimatedCard className="p-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-neon/20 flex items-center justify-center mb-4">
                                <Clock className="w-6 h-6 text-brand-purple" />
                            </div>

                            <h3 className="text-lg font-bold text-text-primary mb-2">Focus Architecture</h3>

                            <p className="text-sm text-text-muted mb-4">
                                You have {deepWorkHours} hours of deep work scheduled today.
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={optimizeSchedule}
                                    className="text-brand-cyan text-sm font-medium flex items-center gap-2 hover:gap-3 transition-all"
                                >
                                    Optimize Schedule <ArrowRight className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={clearSchedule}
                                    className="text-red-400 text-sm font-medium flex items-center gap-2 hover:gap-3 transition-all"
                                >
                                    Clear Schedule <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </AnimatedCard>
                    </MotionSection>
                </div>
            </div>
        </div>
    );
}
