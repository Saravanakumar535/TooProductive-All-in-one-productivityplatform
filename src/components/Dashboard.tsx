import { useState, useEffect } from 'react';
import { CheckSquare, BookOpen, Wallet, GraduationCap, Target, TrendingUp, Award, Flame } from 'lucide-react';
import { View } from '../App';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface DashboardProps {
  onViewChange: (view: View) => void;
}

export function Dashboard({ onViewChange }: DashboardProps) {
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    totalTasks: 0,
    booksRead: 0,
    pagesRead: 0,
    totalExpenses: 0,
    learningStreak: 0,
    goalsAchieved: 0,
    totalGoals: 0,
  });

  useEffect(() => {
    // Load stats from localStorage
    const tasks = JSON.parse(localStorage.getItem('tooproductive_tasks') || '[]');
    const books = JSON.parse(localStorage.getItem('tooproductive_books') || '[]');
    const expenses = JSON.parse(localStorage.getItem('tooproductive_expenses') || '[]');
    const learningLogs = JSON.parse(localStorage.getItem('tooproductive_learning') || '[]');
    const goals = JSON.parse(localStorage.getItem('tooproductive_goals') || '[]');

    const tasksCompleted = tasks.filter((t: any) => t.completed).length;
    const booksRead = books.filter((b: any) => b.status === 'completed').length;
    const pagesRead = books.reduce((sum: number, b: any) => sum + (b.currentPage || 0), 0);
    const totalExpenses = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
    const goalsAchieved = goals.filter((g: any) => g.completed).length;

    // Calculate learning streak
    const today = new Date();
    let streak = 0;
    const sortedLogs = learningLogs.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    for (let i = 0; i < sortedLogs.length; i++) {
      const logDate = new Date(sortedLogs[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (logDate.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }

    setStats({
      tasksCompleted,
      totalTasks: tasks.length,
      booksRead,
      pagesRead,
      totalExpenses,
      learningStreak: streak,
      goalsAchieved,
      totalGoals: goals.length,
    });
  }, []);

  const weeklyActivityData = [
    { day: 'Mon', tasks: 5, learning: 2 },
    { day: 'Tue', tasks: 8, learning: 3 },
    { day: 'Wed', tasks: 6, learning: 2 },
    { day: 'Thu', tasks: 10, learning: 4 },
    { day: 'Fri', tasks: 7, learning: 3 },
    { day: 'Sat', tasks: 4, learning: 5 },
    { day: 'Sun', tasks: 3, learning: 4 },
  ];

  const statCards = [
    {
      title: 'Tasks',
      value: `${stats.tasksCompleted}/${stats.totalTasks}`,
      subtitle: 'Completed',
      icon: CheckSquare,
      color: 'from-blue-500 to-blue-600',
      view: 'tasks' as View,
    },
    {
      title: 'Reading',
      value: stats.booksRead.toString(),
      subtitle: `${stats.pagesRead} pages read`,
      icon: BookOpen,
      color: 'from-green-500 to-green-600',
      view: 'reading' as View,
    },
    {
      title: 'Expenses',
      value: `$${stats.totalExpenses.toFixed(2)}`,
      subtitle: 'This month',
      icon: Wallet,
      color: 'from-orange-500 to-orange-600',
      view: 'finance' as View,
    },
    {
      title: 'Learning Streak',
      value: `${stats.learningStreak} days`,
      subtitle: 'Keep it up!',
      icon: Flame,
      color: 'from-red-500 to-red-600',
      view: 'learning' as View,
    },
    {
      title: 'Goals',
      value: `${stats.goalsAchieved}/${stats.totalGoals}`,
      subtitle: 'Achieved',
      icon: Target,
      color: 'from-purple-500 to-purple-600',
      view: 'goals' as View,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">Your productivity overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.title}
              onClick={() => onViewChange(stat.view)}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-slate-900 mb-1">{stat.value}</div>
              <div className="text-slate-600">{stat.title}</div>
              <div className="text-sm text-slate-500 mt-1">{stat.subtitle}</div>
            </button>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-slate-900 mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="tasks" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="learning" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-slate-900 mb-4">Recent Achievements</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-slate-900">Task Master</div>
                <div className="text-sm text-slate-600">Completed 50 tasks</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="p-2 bg-green-600 rounded-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-slate-900">Bookworm</div>
                <div className="text-sm text-slate-600">Read 5 books this month</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <div className="p-2 bg-orange-600 rounded-lg">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-slate-900">On Fire!</div>
                <div className="text-sm text-slate-600">7-day learning streak</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
