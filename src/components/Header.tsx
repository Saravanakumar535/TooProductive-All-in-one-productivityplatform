import { useState } from 'react';
import { LogOut, Bell, Sparkles, Menu, X, Home, Wrench, Newspaper, UserCircle } from 'lucide-react';
import { User } from '../App';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  user: User;
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  onToggleAI: () => void;
}

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'productivity', label: 'Productivity', icon: Wrench },
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'profile', label: 'Profile', icon: UserCircle },
];

export function Header({ user, currentView, onViewChange, onLogout, onToggleAI }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border-subtle">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-10 flex items-center justify-between h-16">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm">TP</div>
          <div className="hidden sm:block">
            <div className="text-base font-bold text-text-primary tracking-tight">TooProductive</div>
            <div className="text-[11px] text-text-muted -mt-0.5">Developer Platform</div>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = currentView === item.id || (item.id === 'home' && currentView === 'news');
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${active
                    ? 'text-accent-blue bg-indigo-50'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                  }`}
              >
                <Icon className="w-4 h-4" /> {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <button onClick={onToggleAI}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-indigo-200 transition-all">
            <Sparkles className="w-3.5 h-3.5" /> AI
          </button>
          <button className="relative p-2.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-all">
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
            {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
          </div>
          <button onClick={onLogout} className="p-2.5 rounded-xl text-text-muted hover:text-red-500 hover:bg-red-50 transition-all" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>

          {/* Mobile menu */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2.5 rounded-xl text-text-muted hover:bg-bg-secondary">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-white border-b border-border-subtle">
            <div className="px-4 py-3 space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const active = currentView === item.id;
                return (
                  <button key={item.id}
                    onClick={() => { onViewChange(item.id); setMobileOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active ? 'text-accent-blue bg-indigo-50' : 'text-text-secondary hover:bg-bg-secondary'
                      }`}>
                    <Icon className="w-4 h-4" /> {item.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}