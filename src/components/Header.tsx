import { Sparkles, LogOut, Menu } from 'lucide-react';
import { User } from '../App';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onToggleAI: () => void;
}

export function Header({ user, onLogout, onToggleAI }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="px-4 md:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center">
              <span className="font-bold">TP</span>
            </div>
            <div>
              <div className="font-bold text-slate-900">TooProductive</div>
              <div className="text-sm text-slate-500">Welcome back, {user.name}!</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onToggleAI}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden md:inline">AI Assistant</span>
            </button>
            
            <button
              onClick={onLogout}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
