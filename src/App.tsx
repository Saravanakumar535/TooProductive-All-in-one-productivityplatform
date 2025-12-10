import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { TaskManager } from './components/TaskManager';
import { ReadingTracker } from './components/ReadingTracker';
import { FinanceTracker } from './components/FinanceTracker';
import { LearningLog } from './components/LearningLog';
import { Goals } from './components/Goals';
import { Student } from './components/Student';
import { AIAssistant } from './components/AIAssistant';
import { AuthModal } from './components/AuthModal';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';

export type View = 'dashboard' | 'tasks' | 'reading' | 'finance' | 'learning' | 'goals' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  useEffect(() => {
    // Check for existing user session
    const savedUser = localStorage.getItem('tooproductive_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setShowAuthModal(true);
    }
  }, []);

  const handleLogin = (email: string, password: string) => {
    // Mock authentication
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name: email.split('@')[0],
    };
    localStorage.setItem('tooproductive_user', JSON.stringify(newUser));
    setUser(newUser);
    setShowAuthModal(false);
  };

  const handleSignup = (email: string, password: string, name: string) => {
    // Mock authentication
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
    };
    localStorage.setItem('tooproductive_user', JSON.stringify(newUser));
    setUser(newUser);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('tooproductive_user');
    setUser(null);
    setShowAuthModal(true);
  };

  if (!user) {
    return (
      <AuthModal
        isOpen={showAuthModal}
        onLogin={handleLogin}
        onSignup={handleSignup}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header 
        user={user} 
        onLogout={handleLogout}
        onToggleAI={() => setShowAIAssistant(!showAIAssistant)}
      />
      
      <div className="flex">
        <Sidebar 
          currentView={currentView}
          onViewChange={setCurrentView}
        />
        
        <main className="flex-1 p-4 md:p-8 ml-0 md:ml-64">
          <div className="max-w-7xl mx-auto">
            {currentView === 'dashboard' && <Dashboard onViewChange={setCurrentView} />}
            {currentView === 'tasks' && <TaskManager />}
            {currentView === 'reading' && <ReadingTracker />}
            {currentView === 'finance' && <FinanceTracker />}
            {currentView === 'learning' && <LearningLog />}
            {currentView === 'goals' && <Goals />}
            {currentView === 'student' && <Student />}
          </div>
        </main>
      </div>

      {showAIAssistant && (
        <AIAssistant onClose={() => setShowAIAssistant(false)} />
      )}
    </div>
  );
}