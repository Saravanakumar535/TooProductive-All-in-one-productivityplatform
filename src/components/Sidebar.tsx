import { LayoutDashboard, CheckSquare, BookOpen, Wallet, GraduationCap, Target, School } from 'lucide-react';
import { View } from '../App';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks' as View, label: 'Tasks', icon: CheckSquare },
    { id: 'reading' as View, label: 'Reading Tracker', icon: BookOpen },
    { id: 'finance' as View, label: 'Finance', icon: Wallet },
    { id: 'learning' as View, label: 'Learning Log', icon: GraduationCap },
    { id: 'goals' as View, label: 'Goals', icon: Target },
    { id: 'student' as View, label: 'Student', icon: School },
  ];

  return (
    <aside className="fixed left-0 top-[73px] h-[calc(100vh-73px)] w-64 bg-white border-r border-slate-200 hidden md:block">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}