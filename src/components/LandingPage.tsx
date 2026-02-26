import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Shield, Layout, Layers } from 'lucide-react';
import { BackgroundEffects } from './ui/BackgroundEffects';
interface LandingPageProps {
    onLoginClick: () => void;
}

export function LandingPage({ onLoginClick }: LandingPageProps) {
    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans overflow-hidden">
            <BackgroundEffects />

            {/* Floating Navbar */}
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="fixed top-0 left-0 right-0 z-50 p-6"
            >
                <div className="max-w-7xl mx-auto glass-panel rounded-full px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer">
                        <div className="w-8 h-8 rounded bg-gradient-neon flex items-center justify-center font-bold text-gray-900 text-sm">
                            TP
                        </div>
                        <span className="font-semibold tracking-tight">TooProductive</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
                        <a className="hover:text-gray-900 transition-colors cursor-pointer">Features</a>
                        <a className="hover:text-gray-900 transition-colors cursor-pointer">Methodology</a>
                        <a className="hover:text-gray-900 transition-colors cursor-pointer">Pricing</a>
                    </div>

                    <button
                        onClick={onLoginClick}
                        className="btn-glow bg-white text-black px-6 py-2 rounded-full text-sm font-medium hover:scale-105 transition-transform cursor-pointer"
                    >
                        Get Started
                    </button>
                </div>
            </motion.nav>

            <main className="relative z-10 pt-40 pb-20 px-6">
                <div className="max-w-7xl mx-auto text-center">

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8 text-sm"
                    >
                        <Sparkles className="w-4 h-4 text-brand-cyan" />
                        <span className="text-gray-300">Introducing TooProductive 2.0</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 leading-tight"
                    >
                        Unleash your <br />
                        <span className="text-gradient-brand">infinite potential.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto font-light"
                    >
                        The premium all-in-one platform for high-performers. Kanban Work Boards, Pomodoro Focus Timers, Habit Tracking, Daily Planning, and Personal Journaling seamlessly integrated into one beautiful workspace.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <button
                            onClick={onLoginClick}
                            className="btn-glow w-full sm:w-auto bg-white text-black px-8 py-4 rounded-full text-base font-medium flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                        >
                            Start Building <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                            className="w-full sm:w-auto glass-panel px-8 py-4 rounded-full text-base font-medium hover:text-gray-900 text-gray-300 flex items-center justify-center gap-2"
                        >
                            View Demo
                        </button>
                    </motion.div>

                    {/* Features Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 perspective-1000"
                    >
                        {[
                            { icon: Layout, title: "Agile Kanban", desc: "Visualize your workflow with professional drag-and-drop boards." },
                            { icon: Zap, title: "Focus Pomodoro", desc: "Master your attention span with alternating deep work and rest blocks." },
                            { icon: Layers, title: "Habit Heatmaps", desc: "Build lasting routines with aesthetic streak tracking." },
                            { icon: Shield, title: "Daily Journal", desc: "Capture fleeting thoughts and reflections in a beautiful markdown editor." }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ rotateX: 5, rotateY: -5, scale: 1.02 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="glass-panel glass-panel-hover p-8 rounded-2xl text-left cursor-pointer"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-6">
                                    <feature.icon className="w-6 h-6 text-brand-cyan" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}

