import { useState, useEffect } from 'react';
import { Plus, Target, Trophy, Star, Trash2, Award } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  category: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  xpReward: number;
}

export function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [userXP, setUserXP] = useState(0);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetValue: '',
    unit: '',
    category: '',
  });

  useEffect(() => {
    const savedGoals = localStorage.getItem('tooproductive_goals');
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }

    const savedXP = localStorage.getItem('tooproductive_xp');
    if (savedXP) {
      setUserXP(parseInt(savedXP));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tooproductive_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('tooproductive_xp', userXP.toString());
  }, [userXP]);

  const addGoal = () => {
    if (!newGoal.title || !newGoal.targetValue || !newGoal.unit || !newGoal.category) return;

    const targetValue = parseInt(newGoal.targetValue);
    const xpReward = Math.floor(targetValue / 2) + 50; // XP based on difficulty

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      targetValue,
      currentValue: 0,
      unit: newGoal.unit,
      category: newGoal.category,
      completed: false,
      createdAt: new Date().toISOString(),
      xpReward,
    };

    setGoals([goal, ...goals]);
    setNewGoal({ title: '', description: '', unit: '', targetValue: '', category: '' });
    setShowAddForm(false);
  };

  const updateProgress = (id: string, value: number) => {
    setGoals(goals.map(goal => {
      if (goal.id === id) {
        const newValue = Math.min(value, goal.targetValue);
        const wasCompleted = goal.completed;
        const isNowCompleted = newValue >= goal.targetValue;

        // Award XP if goal just completed
        if (!wasCompleted && isNowCompleted) {
          setUserXP(prev => prev + goal.xpReward);
          return {
            ...goal,
            currentValue: newValue,
            completed: true,
            completedAt: new Date().toISOString(),
          };
        }

        return { ...goal, currentValue: newValue };
      }
      return goal;
    }));
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const level = Math.floor(userXP / 1000) + 1;
  const xpForNextLevel = level * 1000;
  const xpProgress = (userXP % 1000) / 10;

  const completedGoals = goals.filter(g => g.completed).length;
  const totalGoals = goals.length;

  const categories = ['Health', 'Career', 'Learning', 'Finance', 'Personal', 'Other'];

  const categoryColors: Record<string, string> = {
    Health: 'bg-green-100 text-green-700',
    Career: 'bg-blue-100 text-blue-700',
    Learning: 'bg-purple-100 text-purple-700',
    Finance: 'bg-orange-100 text-orange-700',
    Personal: 'bg-pink-100 text-pink-700',
    Other: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 mb-2">Gamified Goals</h1>
          <p className="text-slate-600">Set and achieve your goals to earn XP</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Goal
        </button>
      </div>

      {/* Level & XP Card */}
      <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <div className="text-sm opacity-90">Your Level</div>
              <div>Level {level}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Total XP</div>
            <div>{userXP} XP</div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-sm mb-1 opacity-90">
            <span>Progress to Level {level + 1}</span>
            <span>{userXP % 1000} / 1000 XP</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div
              className="bg-white h-3 rounded-full transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-slate-600">Active Goals</span>
          </div>
          <div className="text-slate-900">{totalGoals - completedGoals}</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-slate-600">Completed</span>
          </div>
          <div className="text-slate-900">{completedGoals}</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-slate-600">Success Rate</span>
          </div>
          <div className="text-slate-900">
            {totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Add Goal Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-slate-900 mb-4">Add New Goal</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={newGoal.title}
              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              placeholder="Goal title"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <textarea
              value={newGoal.description}
              onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              placeholder="Description (optional)"
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <div className="flex gap-3">
              <input
                type="number"
                value={newGoal.targetValue}
                onChange={(e) => setNewGoal({ ...newGoal, targetValue: e.target.value })}
                placeholder="Target value"
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <input
                type="text"
                value={newGoal.unit}
                onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                placeholder="Unit (e.g., books, hours, km)"
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <select
                value={newGoal.category}
                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="">Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={addGoal}
                className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Add Goal
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-3">
        {goals.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No goals yet. Create your first goal!</p>
          </div>
        ) : (
          goals.map(goal => {
            const progress = (goal.currentValue / goal.targetValue) * 100;
            return (
              <div
                key={goal.id}
                className={`bg-white rounded-xl p-6 shadow-sm ${
                  goal.completed ? 'border-2 border-green-300' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-slate-900">{goal.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        categoryColors[goal.category] || categoryColors.Other
                      }`}>
                        {goal.category}
                      </span>
                      {goal.completed && (
                        <span className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                          <Trophy className="w-3 h-3" />
                          Completed!
                        </span>
                      )}
                    </div>
                    {goal.description && (
                      <p className="text-slate-600 text-sm mb-2">{goal.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-slate-600">{goal.xpReward} XP reward</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm text-slate-600 mb-1">
                    <span>Progress</span>
                    <span>{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        goal.completed 
                          ? 'bg-gradient-to-r from-green-500 to-green-600' 
                          : 'bg-gradient-to-r from-purple-600 to-blue-600'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {!goal.completed && (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max={goal.targetValue}
                      value={goal.currentValue}
                      onChange={(e) => updateProgress(goal.id, parseInt(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                      placeholder="Update progress"
                    />
                    <button
                      onClick={() => updateProgress(goal.id, goal.targetValue)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                    >
                      Mark Complete
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
