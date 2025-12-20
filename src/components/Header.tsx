import { Sparkles, LogOut, Menu } from 'lucide-react';
import { User } from '../App';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onToggleAI: () => void;
}

export function Header({ user, onLogout, onToggleAI }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="px-4 md:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-black text-white w-9 h-9 rounded-md flex items-center justify-center">
              <span className="font-bold text-sm">TP</span>
            </div>
            <div>
              <div className="font-bold text-gray-900 tracking-tight">TooProductive</div>
              <div className="text-xs text-gray-500 hidden sm:block">Hi, {user.name}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={onToggleAI}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden md:inline text-sm">AI Assistant</span>
            </button>
            
            <button
              onClick={onLogout}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
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