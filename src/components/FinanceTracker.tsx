import { useState, useEffect } from 'react';
import { Plus, TrendingDown, TrendingUp, DollarSign, Trash2, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { MotionSection } from './ui/MotionSection';
import { AnimatedCard } from './ui/AnimatedCard';
import { GradientButton } from './ui/GradientButton';
import { cn } from '../lib/utils';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
}

export function FinanceTracker() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: '',
    type: 'expense' as 'income' | 'expense',
  });

  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/finance');
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      }
    } catch (error) {
      console.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const addExpense = async () => {
    if (!newExpense.description || !newExpense.amount || !newExpense.category) return;

    try {
      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: newExpense.description,
          amount: newExpense.amount,
          category: newExpense.category,
          type: newExpense.type,
          date: new Date().toISOString()
        })
      });

      if (res.ok) {
        const expense = await res.json();
        setExpenses([expense, ...expenses]);
        setNewExpense({ description: '', amount: '', category: '', type: 'expense' });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Failed to add expense');
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const res = await fetch(`/api/finance/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setExpenses(expenses.filter(e => e.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete expense');
    }
  };

  const totalIncome = expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpenses;

  const categoryData = expenses
    .filter(e => e.type === 'expense')
    .reduce((acc, e) => {
      const existing = acc.find(item => item.category === e.category);
      if (existing) {
        existing.amount += e.amount;
      } else {
        acc.push({ category: e.category, amount: e.amount });
      }
      return acc;
    }, [] as Array<{ category: string; amount: number }>)
    .sort((a, b) => b.amount - a.amount);

  const commonCategories = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Shopping', 'Health', 'Other'];

  return (
    <div className="space-y-8 pb-12 w-full max-w-6xl mx-auto">
      <MotionSection delay={0.1}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold tracking-tight text-text-primary inline-block">
              Wealth <span className="text-gradient-brand">Command</span>
            </h1>
            <p className="text-text-muted text-lg">Financial telemetrics tracking.</p>
          </div>
          <GradientButton onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-5 h-5 mr-2" /> Log Transaction
          </GradientButton>
        </div>
      </MotionSection>

      {/* Summary Cards */}
      <MotionSection delay={0.2}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatedCard className="border border-border-subtle bg-bg-tertiary">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-text-muted font-medium tracking-wide">GROSS INCOME</span>
            </div>
            <div className="text-3xl font-bold text-text-primary tracking-tight">${totalIncome.toFixed(2)}</div>
          </AnimatedCard>

          <AnimatedCard className="border border-border-subtle bg-bg-tertiary">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-brand-pink/10 rounded-xl border border-brand-pink/20">
                <TrendingDown className="w-5 h-5 text-brand-pink" />
              </div>
              <span className="text-text-muted font-medium tracking-wide">TOTAL EXPENSES</span>
            </div>
            <div className="text-3xl font-bold text-text-primary tracking-tight">${totalExpenses.toFixed(2)}</div>
          </AnimatedCard>

          <AnimatedCard className="border border-border-subtle bg-bg-tertiary">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-brand-cyan/10 rounded-xl border border-brand-cyan/20">
                <DollarSign className={cn("w-5 h-5", balance >= 0 ? "text-brand-cyan" : "text-brand-pink")} />
              </div>
              <span className="text-text-muted font-medium tracking-wide">NET BALANCE</span>
            </div>
            <div className={cn("text-3xl font-bold tracking-tight", balance >= 0 ? "text-brand-cyan" : "text-brand-pink")}>
              ${Math.abs(balance).toFixed(2)}
            </div>
          </AnimatedCard>
        </div>
      </MotionSection>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-panel rounded-2xl p-6 border border-border-subtle mb-6 space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-text-primary">Log Transaction</h3>
              </div>
              <div className="space-y-4">
                <div className="flex p-1 bg-bg-tertiary backdrop-blur-md rounded-xl w-max border border-border-subtle relative">
                  <button
                    onClick={() => setNewExpense({ ...newExpense, type: 'expense' })}
                    className={cn(
                      "px-8 py-2.5 rounded-lg flex items-center justify-center font-bold tracking-wide transition-all relative z-10",
                      newExpense.type === 'expense' ? "text-text-primary" : "text-text-muted hover:text-text-primary"
                    )}
                  >
                    {newExpense.type === 'expense' && (
                      <motion.div layoutId="txType" className="absolute inset-0 bg-accent-pink/10 border border-accent-pink/20 rounded-lg shadow-sm" />
                    )}
                    EXPENSE
                  </button>
                  <button
                    onClick={() => setNewExpense({ ...newExpense, type: 'income' })}
                    className={cn(
                      "px-8 py-2.5 rounded-lg flex items-center justify-center font-bold tracking-wide transition-all relative z-10",
                      newExpense.type === 'income' ? "text-text-primary" : "text-text-muted hover:text-text-primary"
                    )}
                  >
                    {newExpense.type === 'income' && (
                      <motion.div layoutId="txType" className="absolute inset-0 bg-accent-green/10 border border-accent-green/20 rounded-lg shadow-sm" />
                    )}
                    INCOME
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    placeholder="Transaction descriptor"
                    className="w-full px-5 py-3 bg-bg-tertiary border border-border-subtle text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
                  />
                  <div className="flex gap-4">
                    <input
                      type="number"
                      step="0.01"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                      placeholder="Amount ($)"
                      className="w-1/2 px-5 py-3 bg-bg-tertiary border border-border-subtle text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
                    />
                    <select
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                      className="w-1/2 px-5 py-3 bg-bg-tertiary border border-border-subtle text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
                    >
                      <option value="">Category</option>
                      {commonCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <GradientButton onClick={addExpense} className="w-full md:w-auto">
                    Record Entry
                  </GradientButton>
                  <button onClick={() => setShowAddForm(false)} className="px-6 py-3 text-text-muted hover:text-text-primary transition-colors font-medium">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transactions List */}
        <MotionSection delay={0.3} className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-text-primary mb-2 border-b border-border-subtle pb-4 inline-block">Ledger Logs</h3>
          {loading ? (
            <div className="glass-panel p-16 text-center rounded-2xl border border-border-subtle flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-brand-cyan/20 border-t-brand-cyan rounded-full animate-spin mb-4" />
              <p className="text-text-muted font-medium">Syncing database records...</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="glass-panel p-16 text-center rounded-2xl border border-border-subtle">
              <DollarSign className="w-16 h-16 text-brand-purple/40 mx-auto mb-4" />
              <p className="text-text-muted font-medium">No transactions recorded. System nominal.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {expenses.map((expense, index) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={expense.id}
                  className="glass-panel rounded-2xl p-5 border border-border-subtle hover:border-border-subtle transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-xl border shadow-inner text-text-primary",
                      expense.type === 'income' ? 'bg-green-500/20 border-green-500/30' : 'bg-brand-pink/10 border-brand-pink/20 text-brand-pink'
                    )}>
                      {expense.type === 'income' ? <TrendingUp className="w-5 h-5 text-green-400" /> : <TrendingDown className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="text-text-primary font-bold tracking-wide">{expense.description}</div>
                      <div className="text-sm text-text-muted flex items-center gap-3 mt-1 font-medium">
                        <span className="px-2.5 py-1 bg-bg-tertiary text-text-muted rounded border border-border-subtle uppercase tracking-wider text-[10px]">{expense.category}</span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 opacity-50" />
                          {new Date(expense.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={cn("text-xl font-bold tracking-tight", expense.type === 'income' ? 'text-green-400' : 'text-brand-pink')}>
                      {expense.type === 'income' ? '+' : '-'}${expense.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="p-3 text-text-muted hover:text-brand-pink hover:bg-brand-pink/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </MotionSection>

        {/* Category Chart */}
        <MotionSection delay={0.4}>
          {categoryData.length > 0 && (
            <AnimatedCard tilt={false} className="h-full border border-border-subtle min-h-[400px] flex flex-col">
              <h3 className="text-xl font-bold text-text-primary mb-6">Expense Vector Map</h3>
              <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical" margin={{ left: 0, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
                    <XAxis type="number" stroke="rgba(255,255,255,0.2)" tick={{ fill: '#9ca3af' }} />
                    <YAxis type="category" dataKey="category" stroke="rgba(255,255,255,0.2)" tick={{ fill: '#9ca3af', fontSize: 12 }} width={90} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(17, 17, 26, 0.9)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: 'white'
                      }}
                      formatter={(value: number) => `$${value.toFixed(2)}`}
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    />
                    <Bar dataKey="amount" fill="#ec4899" radius={[0, 4, 4, 0]} barSize={20}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#ec4899' : '#8b5cf6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </AnimatedCard>
          )}
        </MotionSection>
      </div>
    </div>
  );
}

