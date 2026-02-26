import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Tag, Edit2, X, Check } from 'lucide-react';
import { MotionSection } from './ui/MotionSection';
import { motion, AnimatePresence } from 'framer-motion';
import { GradientButton } from './ui/GradientButton';
import { cn } from '../lib/utils';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  createdAt: string;
}

interface TaskManagerProps {
  userId: string;
}

export function TaskManager({ userId }: TaskManagerProps) {

  /* ================= STATE ================= */

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskPriority, setNewTaskPriority] =
    useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState<string>(''); // ✅ FIXED
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState<string>('');
  const [editTaskPriority, setEditTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editTaskCategory, setEditTaskCategory] = useState<string>('');

  /* ================= FETCH TASKS ================= */

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`/api/tasks?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  }, [userId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  /* ================= ADD TASK ================= */

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      setLoading(true);

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          priority: newTaskPriority,
          category: newTaskCategory || 'General',
          userId
        })
      });

      if (!res.ok) throw new Error('Add failed');

      const createdTask = await res.json();

      setTasks(prev => [createdTask, ...prev]);

      setNewTaskTitle('');
      setNewTaskCategory('');
      setNewTaskPriority('medium');

    } catch (err) {
      console.error('Add failed:', err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= TOGGLE ================= */

  const toggleTask = async (id: string) => {
    const target = tasks.find(t => t.id === id);
    if (!target) return;

    const updatedStatus = !target.completed;

    // Optimistic update
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, completed: updatedStatus } : task
      )
    );

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: updatedStatus })
      });

      if (!res.ok) throw new Error();
    } catch (err) {
      console.error('Toggle failed:', err);

      // revert if failed
      setTasks(prev =>
        prev.map(task =>
          task.id === id ? { ...task, completed: target.completed } : task
        )
      );
    }
  };

  /* ================= EDIT ================= */

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTaskTitle(task.title);
    setEditTaskPriority(task.priority || 'medium');
    setEditTaskCategory(task.category);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
  };

  const saveEditTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editTaskTitle.trim()) return;

    // Optimistic update
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, title: editTaskTitle, priority: editTaskPriority, category: editTaskCategory } : task
      )
    );
    setEditingTaskId(null);

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTaskTitle,
          priority: editTaskPriority,
          category: editTaskCategory
        })
      });

      if (!res.ok) throw new Error();
    } catch (err) {
      console.error('Update failed:', err);
      fetchTasks(); // Revert on fail
    }
  };

  /* ================= DELETE ================= */

  const deleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error();

      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  /* ================= FILTERING ================= */

  const categories = [
    'All',
    ...Array.from(new Set(tasks.map(t => t.category)))
  ];

  const filteredTasks =
    filterCategory === 'all'
      ? tasks
      : tasks.filter(t => t.category === filterCategory);

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercentage =
    tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  const priorityColors = {
    low: 'bg-cyan-50 text-accent-cyan border-accent-cyan/20',
    medium: 'bg-orange-50 text-accent-orange border-accent-orange/20',
    high: 'bg-rose-50 text-accent-red border-accent-red/20'
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-8 pb-12 w-full max-w-5xl mx-auto">

      {/* HEADER */}
      <MotionSection delay={0.1}>
        <h1 className="text-4xl font-bold text-text-primary">
          Task <span className="text-gradient-brand">Matrix</span>
        </h1>
      </MotionSection>

      {/* PROGRESS */}
      <MotionSection delay={0.2}>
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex justify-between mb-4">
            <span className="text-text-muted">Completion Engine</span>
            <span className="text-text-primary font-bold">
              {completedCount} / {tasks.length} executed
            </span>
          </div>

          <div className="w-full bg-bg-tertiary h-4 rounded-full border border-border-subtle">
            <motion.div
              key={progressPercentage}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.6 }}
              className="h-full rounded-full bg-gradient-to-r from-brand-cyan to-brand-purple"
            />
          </div>
        </div>
      </MotionSection>

      {/* ADD TASK */}
      <MotionSection delay={0.3}>
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <input
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Define actionable item..."
            className="w-full px-4 py-3 bg-bg-tertiary border border-border-subtle text-text-primary rounded-xl"
          />

          <div className="flex gap-3">
            <input
              value={newTaskCategory}
              onChange={(e) => setNewTaskCategory(e.target.value)}
              placeholder="Category"
              className="flex-1 px-4 py-3 bg-bg-tertiary border border-border-subtle text-text-primary rounded-xl"
            />

            <select
              value={newTaskPriority}
              onChange={(e) =>
                setNewTaskPriority(e.target.value as 'low' | 'medium' | 'high')
              }
              className="px-4 py-3 bg-bg-secondary border border-border-subtle text-text-primary rounded-xl focus:outline-none focus:border-accent-blue"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">Critical</option>
            </select>

            <GradientButton onClick={addTask} disabled={loading}>
              <Plus className="w-5 h-5" /> Execute
            </GradientButton>
          </div>
        </div>
      </MotionSection>

      {/* FILTER BUTTONS */}
      <MotionSection delay={0.4}>
        <div className="flex gap-3 flex-wrap">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setFilterCategory(category)}
              className={cn(
                "px-4 py-2 rounded-full text-sm border",
                filterCategory === category
                  ? "bg-brand-purple/20 text-text-primary border-brand-purple"
                  : "bg-bg-tertiary text-text-muted border-border-subtle"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </MotionSection>

      {/* TASK LIST */}
      <MotionSection delay={0.5}>
        <AnimatePresence>
          {filteredTasks.map(task => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-5 rounded-xl border bg-bg-tertiary border-border-subtle flex justify-between items-start gap-4 mt-4"
            >
              {editingTaskId === task.id ? (
                <div className="flex-1 space-y-3">
                  <input
                    value={editTaskTitle}
                    onChange={(e) => setEditTaskTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-bg-secondary border border-border-subtle text-text-primary rounded-lg focus:outline-none focus:border-accent-blue"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <input
                      value={editTaskCategory}
                      onChange={(e) => setEditTaskCategory(e.target.value)}
                      className="w-1/2 px-3 py-2 bg-bg-secondary border border-border-subtle text-text-primary rounded-lg text-sm focus:outline-none focus:border-accent-blue"
                      placeholder="Category"
                    />
                    <select
                      value={editTaskPriority}
                      onChange={(e) => setEditTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                      className="w-1/2 px-3 py-2 bg-bg-secondary border border-border-subtle text-text-primary rounded-lg text-sm focus:outline-none focus:border-accent-blue"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">Critical</option>
                    </select>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={cancelEditing} className="px-3 py-1.5 text-xs text-text-muted hover:text-text-primary hover:bg-bg-elevated rounded-lg flex items-center transition-colors">
                      <X className="w-3 h-3 mr-1" /> Cancel
                    </button>
                    <button onClick={(e) => saveEditTask(task.id, e)} className="px-3 py-1.5 text-xs bg-brand-purple/20 text-brand-purple border border-brand-purple/30 hover:bg-brand-purple/40 rounded-lg flex items-center transition-colors">
                      <Check className="w-3 h-3 mr-1" /> Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => toggleTask(task.id)}
                  >
                    <div className={cn(
                      "text-lg",
                      task.completed
                        ? "line-through text-text-muted"
                        : "text-text-primary"
                    )}>
                      {task.title}
                    </div>

                    <div className="flex gap-3 mt-2">
                      <span className={cn(
                        "text-xs px-3 py-1 rounded-full border",
                        priorityColors[task.priority] || priorityColors["medium"]
                      )}>
                        {(task.priority || "medium").toUpperCase()}
                      </span>

                      <span className="text-xs text-brand-pink flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {task.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); startEditing(task); }}
                      className="p-2 text-text-muted hover:text-brand-cyan hover:bg-brand-cyan/10 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                      className="p-2 text-text-muted hover:text-brand-pink hover:bg-brand-pink/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </MotionSection>

    </div>
  );
}
