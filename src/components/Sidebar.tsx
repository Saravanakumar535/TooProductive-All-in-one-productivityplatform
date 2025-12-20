import { LayoutDashboard, CheckSquare, BookOpen, DollarSign, Lightbulb, Target, GraduationCap, TrendingUp } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'reading', label: 'Reading Hub', icon: BookOpen },
  { id: 'stocks', label: 'Stocks', icon: TrendingUp },
  { id: 'finance', label: 'Finance', icon: DollarSign },
  { id: 'learning', label: 'Learning Log', icon: Lightbulb },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'student', label: 'Student Hub', icon: GraduationCap },
];

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-[61px] h-[calc(100vh-61px)] w-64 bg-white border-r border-gray-200 hidden md:block">
      <nav className="p-3">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm ${
                    isActive
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
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