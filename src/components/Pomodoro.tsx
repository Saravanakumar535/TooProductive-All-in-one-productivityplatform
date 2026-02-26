import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MotionSection } from './ui/MotionSection';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';
import { GradientButton } from './ui/GradientButton';

export function Pomodoro() {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'focus' | 'break'>('focus');

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Automatically switch modes
            if (mode === 'focus') {
                setMode('break');
                setTimeLeft(5 * 60);
            } else {
                setMode('focus');
                setTimeLeft(25 * 60);
            }
        }
        return () => clearInterval(interval as NodeJS.Timeout);
    }, [isActive, timeLeft, mode]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
    };

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const progress = mode === 'focus'
        ? ((25 * 60 - timeLeft) / (25 * 60)) * 100
        : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

    return (
        <div className="space-y-8 w-full max-w-3xl mx-auto pb-12 flex flex-col items-center justify-center min-h-[60vh]">
            <MotionSection delay={0.1} className="w-full text-center mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-text-primary inline-block mb-3">
                    Focus <span className="text-gradient-brand">Engine</span>
                </h1>
                <p className="text-text-muted text-lg">Master your attention span.</p>
            </MotionSection>

            <MotionSection delay={0.2} className="w-full flex justify-center">
                <div className="glass-panel p-10 rounded-[40px] border border-border-subtle flex flex-col items-center relative overflow-hidden w-full max-w-md shadow-2xl">

                    {/* Animated Background Gradients based on mode */}
                    <div className={`absolute inset-0 opacity-20 filter blur-[80px] transition-colors duration-1000 ${mode === 'focus' ? 'bg-brand-purple' : 'bg-brand-cyan'}`} />

                    {/* Mode Selector */}
                    <div className="flex gap-4 mb-10 relative z-10 bg-black/40 p-1.5 rounded-full backdrop-blur-md border border-border-subtle">
                        <button
                            onClick={() => { setMode('focus'); setTimeLeft(25 * 60); setIsActive(false); }}
                            className={`px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${mode === 'focus' ? 'bg-brand-purple text-text-primary shadow-[0_0_20px_rgba(176,38,255,0.4)]' : 'text-text-muted hover:text-text-primary'}`}
                        >
                            <Brain className="w-4 h-4" /> Deep Work
                        </button>
                        <button
                            onClick={() => { setMode('break'); setTimeLeft(5 * 60); setIsActive(false); }}
                            className={`px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${mode === 'break' ? 'bg-brand-cyan text-black shadow-[0_0_20px_rgba(0,229,255,0.4)]' : 'text-text-muted hover:text-text-primary'}`}
                        >
                            <Coffee className="w-4 h-4" /> Rest
                        </button>
                    </div>

                    {/* Timer Display */}
                    <div className="relative w-64 h-64 flex items-center justify-center mb-10 z-10">
                        {/* Circular Progress (simplified SVG ring) */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle cx="128" cy="128" r="120" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
                            <motion.circle
                                cx="128" cy="128" r="120"
                                stroke={mode === 'focus' ? 'var(--color-brand-purple)' : 'var(--color-brand-cyan)'}
                                strokeWidth="8" fill="none"
                                strokeLinecap="round"
                                initial={{ strokeDasharray: "0, 1000" }}
                                animate={{ strokeDasharray: `${(progress / 100) * (2 * Math.PI * 120)}, 1000` }}
                                transition={{ duration: 1 }}
                            />
                        </svg>
                        <div className="text-center">
                            <span className="text-7xl font-bold tracking-tighter text-text-primary font-mono drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                            </span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex gap-4 relative z-10">
                        <GradientButton onClick={toggleTimer} className="px-8 py-4 rounded-full min-w-[160px] flex justify-center shadow-lg">
                            {isActive ? (
                                <span className="flex items-center gap-3 text-lg font-bold"><Pause className="w-6 h-6 fill-current" /> Pause</span>
                            ) : (
                                <span className="flex items-center gap-3 text-lg font-bold"><Play className="w-6 h-6 fill-current ml-1" /> Start</span>
                            )}
                        </GradientButton>

                        <button
                            onClick={resetTimer}
                            className="w-16 h-16 rounded-full bg-bg-tertiary border border-border-subtle flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-all backdrop-blur-md"
                        >
                            <RotateCcw className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </MotionSection>
        </div>
    );
}

