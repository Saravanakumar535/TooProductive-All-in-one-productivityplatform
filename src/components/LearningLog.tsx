import { useState, useEffect } from 'react';
import { Plus, BookOpen, Calendar, Flame, Trash2 } from 'lucide-react';

interface LearningEntry {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  duration: number; // in minutes
}

export function LearningLog() {
  const [entries, setEntries] = useState<LearningEntry[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: '',
    description: '',
    category: '',
    duration: '',
  });

  useEffect(() => {
    const savedEntries = localStorage.getItem('tooproductive_learning');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tooproductive_learning', JSON.stringify(entries));
  }, [entries]);

  const addEntry = () => {
    if (!newEntry.title || !newEntry.description || !newEntry.category || !newEntry.duration) return;

    const entry: LearningEntry = {
      id: Date.now().toString(),
      title: newEntry.title,
      description: newEntry.description,
      category: newEntry.category,
      date: new Date().toISOString(),
      duration: parseInt(newEntry.duration),
    };

    setEntries([entry, ...entries]);
    setNewEntry({ title: '', description: '', category: '', duration: '' });
    setShowAddForm(false);
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  // Calculate streak
  const calculateStreak = () => {
    if (entries.length === 0) return 0;

    const today = new Date();
    let streak = 0;
    const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      if (entryDate.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const totalMinutes = entries.reduce((sum, e) => sum + e.duration, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const streak = calculateStreak();

  const categories = Array.from(new Set(entries.map(e => e.category)));
  const commonCategories = ['Programming', 'Language', 'Design', 'Business', 'Science', 'Other'];

  // Group entries by date
  const entriesByDate = entries.reduce((acc, entry) => {
    const date = new Date(entry.date).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, LearningEntry[]>);

  const categoryColors: Record<string, string> = {
    Programming: 'bg-blue-100 text-blue-700',
    Language: 'bg-green-100 text-green-700',
    Design: 'bg-purple-100 text-purple-700',
    Business: 'bg-orange-100 text-orange-700',
    Science: 'bg-pink-100 text-pink-700',
    Other: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 mb-2">Daily Learning Log</h1>
          <p className="text-slate-600">Track what you learn every day</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Entry
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Flame className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-slate-600">Current Streak</span>
          </div>
          <div className="text-slate-900">{streak} days</div>
          <div className="text-sm text-slate-500 mt-1">Keep learning every day!</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-slate-600">Total Entries</span>
          </div>
          <div className="text-slate-900">{entries.length}</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-slate-600">Time Invested</span>
          </div>
          <div className="text-slate-900">{totalHours}h {totalMinutes % 60}m</div>
        </div>
      </div>

      {/* Add Entry Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-slate-900 mb-4">Add Learning Entry</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={newEntry.title}
              onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
              placeholder="What did you learn?"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <textarea
              value={newEntry.description}
              onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
              placeholder="Describe what you learned in detail..."
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <div className="flex gap-3">
              <select
                value={newEntry.category}
                onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="">Select Category</option>
                {commonCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="number"
                value={newEntry.duration}
                onChange={(e) => setNewEntry({ ...newEntry, duration: e.target.value })}
                placeholder="Duration (minutes)"
                className="w-40 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={addEntry}
                className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Add Entry
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

      {/* Entries Timeline */}
      <div className="space-y-6">
        {Object.keys(entriesByDate).length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No learning entries yet. Start your journey!</p>
          </div>
        ) : (
          Object.entries(entriesByDate).map(([date, dateEntries]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-5 h-5 text-slate-400" />
                <h3 className="text-slate-900">{date}</h3>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
              <div className="space-y-3">
                {dateEntries.map(entry => (
                  <div key={entry.id} className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-slate-900">{entry.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded ${
                            categoryColors[entry.category] || categoryColors.Other
                          }`}>
                            {entry.category}
                          </span>
                        </div>
                        <p className="text-slate-600 mb-2">{entry.description}</p>
                        <div className="text-sm text-slate-500">
                          Duration: {entry.duration} minutes
                        </div>
                      </div>
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
