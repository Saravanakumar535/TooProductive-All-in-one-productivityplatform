import { useState } from 'react';
import { Mail, Lock, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (email: string, password: string, name: string) => Promise<void>;
}

export function AuthModal({ isOpen, onClose, onLogin, onSignup }: AuthModalProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLoginMode) {
        await onLogin(email, password);
      } else {
        await onSignup(email, password, name);
      }
    } catch (err) {
      // Error is handled by App.tsx throwing an alert, but we just stop loading
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-md glass-panel p-8 rounded-2xl border border-gray-200 shadow-2xl overflow-hidden"
          >
            {/* Glossy gradient orb in the background of modal */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-brand-purple rounded-full mix-blend-screen filter blur-[80px] opacity-40 animate-pulse-slow" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-brand-cyan rounded-full mix-blend-screen filter blur-[80px] opacity-40 animate-pulse-slow" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-8 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-6 shadow-sm border border-border-subtle">
                <span className="text-2xl font-bold text-accent-blue">TP</span>
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                {isLoginMode ? 'Welcome Back' : 'Join TooProductive'}
              </h2>
              <p className="text-text-secondary text-sm">
                {isLoginMode ? 'Enter your details to access your workspace' : 'Begin your journey to infinite productivity'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              {!isLoginMode && (
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5 font-medium">Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted group-focus-within:text-accent-blue transition-colors" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-dark pl-icon"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm text-text-secondary mb-1.5 font-medium">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted group-focus-within:text-accent-blue transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-dark pl-icon"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1.5 font-medium">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted group-focus-within:text-accent-blue transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-dark pl-icon"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3.5 text-base font-semibold mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : (isLoginMode ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <div className="mt-8 text-center relative z-10">
              <button
                onClick={() => setIsLoginMode(!isLoginMode)}
                className="text-text-muted hover:text-text-primary transition-colors text-sm"
              >
                {isLoginMode ? "Don't have an account? " : 'Already have an account? '}
                <span className="text-accent-blue font-semibold ml-1">
                  {isLoginMode ? "Sign up" : "Log in"}
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
