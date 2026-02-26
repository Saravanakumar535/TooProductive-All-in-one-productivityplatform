import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { TaskManager } from './components/TaskManager';
import { ReadingTracker } from './components/ReadingTracker';
import { FinanceTracker } from './components/FinanceTracker';
import { LearningLog } from './components/LearningLog';
import { Goals } from './components/Goals';
import { Student } from './components/Student';
import { Stocks } from './components/Stocks';
import { AuthPage } from './components/AuthPage';
import { AIAssistant } from './components/AIAssistant';
import { NewsFeed } from './components/NewsFeed';
import { ProductivityHub } from './components/ProductivityHub';
import { ProfilePage } from './components/ProfilePage';
import { Footer } from './components/Footer';
import { DailyPlanner } from './components/DailyPlanner';
import { KanbanBoard } from './components/KanbanBoard';
import { HabitTracker } from './components/HabitTracker';
import { Pomodoro } from './components/Pomodoro';
import { Journal } from './components/Journal';

export type View = 'home' | 'news' | 'productivity' | 'profile' | 'dashboard' | 'tasks' | 'reading' | 'finance' | 'learning' | 'goals' | 'student' | 'stocks' | 'planner' | 'kanban' | 'habits' | 'pomodoro' | 'journal';

export interface User {
  id: string;
  email: string;
  name: string;
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [user, setUser] = useState<User | null>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('tooproductive_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Invalid credentials');
      }

      const user = await res.json();
      localStorage.setItem('tooproductive_user', JSON.stringify(user));
      setUser(user);
      setCurrentView('home');
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        throw new Error('Cannot connect to the server. Please ensure the backend is running.');
      }
      throw err;
    }
  };

  const handleSignup = async (email: string, password: string, name: string, role: string) => {
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, persona: role || 'GENERAL' })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Registration failed. Please try again.');
      }

      const user = await res.json();
      localStorage.setItem('tooproductive_user', JSON.stringify(user));
      setUser(user);
      setCurrentView('home');
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        throw new Error('Cannot connect to the server. Please ensure the backend is running.');
      }
      throw err;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tooproductive_user');
    setUser(null);
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view as View);
  };

  // Not logged in — show Auth page
  if (!user) {
    return <AuthPage onLogin={handleLogin} onSignup={handleSignup} />;
  }

  // Determine if we're in a productivity sub-tool
  const productivityViews = ['dashboard', 'tasks', 'reading', 'finance', 'learning', 'goals', 'student', 'stocks', 'planner', 'kanban', 'habits', 'pomodoro', 'journal'];
  const isProductivityTool = productivityViews.includes(currentView);

  const renderContent = () => {
    switch (currentView) {
      case 'home':
      case 'news':
        return <NewsFeed />;
      case 'productivity':
        return <ProductivityHub onViewChange={setCurrentView} />;
      case 'profile':
        return <ProfilePage user={user} />;
      case 'dashboard':
        return <Dashboard onViewChange={setCurrentView} />;
      case 'tasks':
        return <TaskManager userId={user.id} />;
      case 'kanban':
        return <KanbanBoard />;
      case 'habits':
        return <HabitTracker />;
      case 'pomodoro':
        return <Pomodoro />;
      case 'journal':
        return <Journal />;
      case 'planner':
        return <DailyPlanner />;
      case 'reading':
        return <ReadingTracker />;
      case 'stocks':
        return <Stocks />;
      case 'finance':
        return <FinanceTracker />;
      case 'learning':
        return <LearningLog />;
      case 'goals':
        return <Goals />;
      case 'student':
        return <Student />;
      default:
        return <NewsFeed />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-sans flex flex-col">
      <Header
        user={user}
        currentView={currentView}
        onViewChange={handleViewChange}
        onLogout={handleLogout}
        onToggleAI={() => setShowAIAssistant(!showAIAssistant)}
      />

      {/* Back to Productivity Hub button when in a sub-tool */}
      {isProductivityTool && (
        <div className="relative z-10 px-4 md:px-8 lg:px-10 pt-4">
          <div className="max-w-[1400px] mx-auto">
            <button
              onClick={() => setCurrentView('productivity')}
              className="flex items-center gap-2 text-text-muted hover:text-text-secondary text-sm transition-colors"
            >
              <span>←</span> Back to Productivity Tools
            </button>
          </div>
        </div>
      )}

      <main className="relative z-10 flex-1 px-4 md:px-8 lg:px-10 py-6">
        <div className="max-w-[1400px] mx-auto w-full">
          {renderContent()}
        </div>
      </main>

      <Footer />

      {showAIAssistant && (
        <AIAssistant onClose={() => setShowAIAssistant(false)} />
      )}
    </div>
  );
}