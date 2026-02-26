import { useState, useMemo } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Code, Cpu, Braces, Terminal, Shield, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthPageProps {
    onLogin: (email: string, password: string) => Promise<void>;
    onSignup: (email: string, password: string, name: string, role: string) => Promise<void>;
}

const roles = [
    { id: 'developer', label: 'Developer', icon: Code },
    { id: 'student', label: 'Student', icon: Braces },
    { id: 'professional', label: 'Professional', icon: Shield },
    { id: 'other', label: 'Other', icon: Zap },
];

const devQuotes = [
    { text: "The best error message is the one that never shows up.", author: "Thomas Fuchs" },
    { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
    { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
];

export function AuthPage({ onLogin, onSignup }: AuthPageProps) {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('developer');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const quote = useMemo(() => devQuotes[Math.floor(Math.random() * devQuotes.length)], []);

    const passwordStrength = useMemo(() => {
        if (!password) return { score: 0, label: '', color: '' };
        let s = 0;
        if (password.length >= 6) s++;
        if (password.length >= 10) s++;
        if (/[A-Z]/.test(password)) s++;
        if (/[0-9]/.test(password)) s++;
        if (/[^A-Za-z0-9]/.test(password)) s++;
        if (s <= 1) return { score: s, label: 'Weak', color: 'bg-red-500' };
        if (s <= 3) return { score: s, label: 'Medium', color: 'bg-yellow-500' };
        return { score: s, label: 'Strong', color: 'bg-green-500' };
    }, [password]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (mode === 'login') await onLogin(email, password);
            else await onSignup(email, password, name, role);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white">

            {/* ═══ Left Panel — Branding ═══ */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700">
                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }} />

                {/* Floating icons */}
                <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-[20%] right-[15%] w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <Terminal className="w-6 h-6 text-white/70" />
                </motion.div>
                <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    className="absolute bottom-[30%] right-[20%] w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-white/70" />
                </motion.div>

                <div className="relative z-10 flex flex-col justify-center px-14 py-16 text-white max-w-[560px]">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-lg">TP</div>
                        <span className="text-xl font-bold tracking-tight">TooProductive</span>
                    </div>

                    <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight mb-3">
                        Build.<br />
                        <span className="text-white/80">Ship. Grow.</span>
                    </h1>

                    {/* Quote */}
                    <div className="mt-10 p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                        <p className="text-white/90 text-base italic leading-relaxed">"{quote.text}"</p>
                        <p className="text-white/60 text-sm mt-3">— {quote.author}</p>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-10 mt-12">
                        <div><div className="text-2xl font-bold">13+</div><div className="text-sm text-white/60">Productivity Tools</div></div>
                        <div><div className="text-2xl font-bold">∞</div><div className="text-sm text-white/60">Potential Unlocked</div></div>
                        <div><div className="text-2xl font-bold">24/7</div><div className="text-sm text-white/60">Always Available</div></div>
                    </div>
                </div>
            </div>

            {/* ═══ Right Panel — Auth Form ═══ */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-white">
                <div className="w-full max-w-[440px]">

                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">TP</div>
                        <span className="text-lg font-bold text-text-primary">TooProductive</span>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div key={mode} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
                            <h2 className="text-3xl font-extrabold text-text-primary mb-2">
                                {mode === 'login' ? 'Welcome back' : 'Create account'}
                            </h2>
                            <p className="text-text-muted text-[0.9375rem] mb-8">
                                {mode === 'login' ? 'Enter your credentials to access your workspace' : 'Start your journey to infinite productivity'}
                            </p>



                            <form onSubmit={handleSubmit} className="space-y-5">
                                {mode === 'signup' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-semibold text-text-primary mb-2">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                                <input type="text" value={name} onChange={e => setName(e.target.value)}
                                                    className="input-dark pl-icon" required />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-text-primary mb-2">I am a</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {roles.map(r => {
                                                    const Icon = r.icon;
                                                    return (
                                                        <button key={r.id} type="button" onClick={() => setRole(r.id)}
                                                            className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${role === r.id
                                                                ? 'border-accent-blue bg-indigo-50 text-accent-blue'
                                                                : 'border-border-subtle text-text-secondary hover:border-border-default hover:bg-bg-secondary'
                                                                }`}>
                                                            <Icon className="w-4 h-4" /> {r.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block text-sm font-semibold text-text-primary mb-2">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                            className="input-dark pl-icon" required />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-text-primary mb-2">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                                            className="input-dark pl-icon pr-11" required />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {mode === 'signup' && password && (
                                        <div className="mt-2.5">
                                            <div className="flex gap-1.5 mb-1">
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= passwordStrength.score ? passwordStrength.color : 'bg-gray-200'}`} />
                                                ))}
                                            </div>
                                            <span className={`text-xs font-medium ${passwordStrength.score <= 1 ? 'text-red-500' : passwordStrength.score <= 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                                                {passwordStrength.label}
                                            </span>
                                        </div>
                                    )}
                                    {mode === 'login' && (
                                        <div className="text-right mt-2">
                                            <button type="button" className="text-sm text-accent-blue hover:text-accent-purple transition-colors font-medium">Forgot password?</button>
                                        </div>
                                    )}
                                </div>

                                {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

                                <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base font-semibold disabled:opacity-50">
                                    {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                                </button>
                            </form>

                            <p className="text-center text-sm text-text-muted mt-6">
                                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                                <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
                                    className="text-accent-blue font-semibold hover:text-accent-purple transition-colors">
                                    {mode === 'login' ? 'Sign up' : 'Sign in'}
                                </button>
                            </p>

                            <p className="text-center text-xs text-text-muted mt-4">
                                By continuing, you agree to our Terms of Service and Privacy Policy.
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
