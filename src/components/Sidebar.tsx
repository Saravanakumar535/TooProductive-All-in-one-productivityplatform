import { LayoutDashboard, CheckSquare, BookOpen, DollarSign, Lightbulb, Target, GraduationCap, TrendingUp, Calendar, Activity, Trello, Timer, BookDashed } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'bg-blue-500', light: 'bg-blue-50 text-blue-600' },
  { id: 'planner', label: 'Planner', icon: Calendar, color: 'bg-violet-500', light: 'bg-violet-50 text-violet-600' },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare, color: 'bg-orange-500', light: 'bg-orange-50 text-orange-600' },
  { id: 'kanban', label: 'Board', icon: Trello, color: 'bg-cyan-500', light: 'bg-cyan-50 text-cyan-600' },
  { id: 'habits', label: 'Habits', icon: Activity, color: 'bg-emerald-500', light: 'bg-emerald-50 text-emerald-600' },
  { id: 'pomodoro', label: 'Focus', icon: Timer, color: 'bg-rose-500', light: 'bg-rose-50 text-rose-600' },
  { id: 'journal', label: 'Journal', icon: BookDashed, color: 'bg-amber-500', light: 'bg-amber-50 text-amber-600' },
  { id: 'learning', label: 'Learn', icon: Lightbulb, color: 'bg-yellow-500', light: 'bg-yellow-50 text-yellow-600' },
  { id: 'goals', label: 'Goals', icon: Target, color: 'bg-purple-500', light: 'bg-purple-50 text-purple-600' },
  { id: 'finance', label: 'Finance', icon: DollarSign, color: 'bg-green-500', light: 'bg-green-50 text-green-600' },
  { id: 'reading', label: 'Reading', icon: BookOpen, color: 'bg-indigo-500', light: 'bg-indigo-50 text-indigo-600' },
  { id: 'student', label: 'Student', icon: GraduationCap, color: 'bg-teal-500', light: 'bg-teal-50 text-teal-600' },
  { id: 'stocks', label: 'Market', icon: TrendingUp, color: 'bg-lime-600', light: 'bg-lime-50 text-lime-600' },
];

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  return (
    <div className="w-full relative z-40 px-4 md:px-6 lg:px-8 py-2">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <motion.button
                key={item.id}
                whileHover={{ y: -2, scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0",
                  isActive
                    ? "text-white shadow-lg"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/80"
                )}
              >
                {/* Active colored background */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavBg"
                    className={cn("absolute inset-0 rounded-xl", item.color)}
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}
                  />
                )}

                <div className="relative z-10 flex items-center gap-2">
                  <div className={cn(
                    "p-1 rounded-lg transition-colors",
                    isActive ? "" : item.light
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="hidden sm:inline">{item.label}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}