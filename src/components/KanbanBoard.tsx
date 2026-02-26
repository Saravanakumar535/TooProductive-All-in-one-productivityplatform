import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MotionSection } from './ui/MotionSection';
import { GradientButton } from './ui/GradientButton';
import { Plus, MoreHorizontal, Trash2, Edit2, X, Check } from 'lucide-react';
import { cn } from '../lib/utils';

export interface KanbanCardType {
    id: string;
    column: string;
    title: string;
    priority: string;
    tags: string; // Stored as string[] or JSON string
}

const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-bg-tertiary0/20 text-text-muted' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-brand-cyan/20 text-brand-cyan' },
    { id: 'review', title: 'Review', color: 'bg-brand-purple/20 text-brand-purple' },
    { id: 'done', title: 'Done', color: 'bg-brand-pink/20 text-brand-pink' }
];

interface KanbanBoardProps {
    userId?: string;
}

export function KanbanBoard({ userId = "kanbanUser" }: KanbanBoardProps) {
    const [cards, setCards] = useState<KanbanCardType[]>([]);
    const [loading, setLoading] = useState(false);

    const [addingToColumn, setAddingToColumn] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState('');
    const [newPriority, setNewPriority] = useState('Medium');
    const [newTags, setNewTags] = useState(''); // comma-separated

    const [editingCardId, setEditingCardId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editPriority, setEditPriority] = useState('Medium');
    const [editTags, setEditTags] = useState('');

    /* ================= FETCH CARDS ================= */
    const fetchCards = useCallback(async () => {
        try {
            const res = await fetch(`/api/kanban?userId=${userId}`);
            if (!res.ok) throw new Error('Fetch failed');
            const data = await res.json();
            setCards(data);
        } catch (error) {
            console.error(error);
        }
    }, [userId]);

    useEffect(() => {
        fetchCards();
    }, [fetchCards]);

    /* ================= ADD CARD ================= */
    const addCard = async (colId: string) => {
        if (!newTitle.trim()) {
            setAddingToColumn(null);
            return;
        }
        try {
            const tagsArray = newTags.split(',').map(t => t.trim()).filter(Boolean);
            const tagsStr = JSON.stringify(tagsArray);

            const res = await fetch('/api/kanban', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newTitle,
                    column: colId,
                    priority: newPriority,
                    tags: tagsStr,
                    userId
                })
            });

            if (!res.ok) throw new Error();
            const created = await res.json();
            setCards(prev => [created, ...prev]);

            setAddingToColumn(null);
            setNewTitle('');
            setNewPriority('Medium');
            setNewTags('');
        } catch (error) {
            console.error("Add failed:", error);
        }
    };

    /* ================= DELETE CARD ================= */
    const deleteCard = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const res = await fetch(`/api/kanban/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error();
            setCards(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    /* ================= EDIT CARD ================= */
    const startEditing = (card: KanbanCardType, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingCardId(card.id);
        setEditTitle(card.title);
        setEditPriority(card.priority || 'Medium');
        try {
            const parsedTags = JSON.parse(card.tags || '[]');
            setEditTags(parsedTags.join(', '));
        } catch {
            setEditTags(card.tags || '');
        }
    };

    const saveEdit = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!editTitle.trim()) return;

        const tagsArray = editTags.split(',').map(t => t.trim()).filter(Boolean);
        const tagsStr = JSON.stringify(tagsArray);

        // Optimistic
        setCards(prev => prev.map(c =>
            c.id === id ? { ...c, title: editTitle, priority: editPriority, tags: tagsStr } : c
        ));
        setEditingCardId(null);

        try {
            const res = await fetch(`/api/kanban/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editTitle,
                    priority: editPriority,
                    tags: tagsStr
                })
            });
            if (!res.ok) throw new Error();
        } catch (err) {
            console.error("Edit failed:", err);
            fetchCards();
        }
    };

    const parseTags = (tagsStr: string) => {
        try {
            return JSON.parse(tagsStr || '[]');
        } catch {
            return [];
        }
    };

    return (
        <div className="space-y-8 w-full max-w-7xl h-[calc(100vh-140px)] flex flex-col mx-auto pb-4">
            <MotionSection delay={0.1}>
                <div className="flex justify-between items-end">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-bold tracking-tight text-text-primary inline-block">
                            Work <span className="text-gradient-brand">Board</span>
                        </h1>
                        <p className="text-text-muted text-lg">Agile project management for professionals.</p>
                    </div>
                    <GradientButton>
                        <Plus className="w-5 h-5" /> Sprint Planning
                    </GradientButton>
                </div>
            </MotionSection>

            <MotionSection delay={0.2} className="flex-1 min-h-0 flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
                {columns.map((col, index) => (
                    <div key={col.id} className="w-[320px] flex-shrink-0 flex flex-col h-full bg-bg-secondary rounded-2xl border border-border-subtle p-4">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <h3 className="font-bold text-text-primary tracking-wide">{col.title}</h3>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${col.color}`}>
                                    {cards.filter(c => c.column === col.id).length}
                                </span>
                            </div>
                            <button className="text-text-muted hover:text-text-primary transition-colors">
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                            <AnimatePresence>
                                {cards.filter(c => c.column === col.id).map((card, i) => (
                                    <motion.div
                                        key={card.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: 0.05 * Math.min(i, 5) }}
                                        whileHover={{ y: editingCardId === card.id ? 0 : -2 }}
                                        className="relative group glass-panel p-4 rounded-xl border border-border-subtle cursor-grab active:cursor-grabbing hover:border-brand-purple/50 transition-colors"
                                    >
                                        {editingCardId === card.id ? (
                                            <div className="space-y-3">
                                                <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full bg-bg-tertiary border border-border-subtle rounded-lg px-2 py-1 text-sm text-text-primary" autoFocus />
                                                <div className="flex gap-2">
                                                    <input value={editTags} onChange={e => setEditTags(e.target.value)} placeholder="Tags (comma separated)" className="w-1/2 bg-bg-tertiary border border-border-subtle rounded-lg px-2 py-1 text-xs text-text-primary" />
                                                    <select value={editPriority} onChange={e => setEditPriority(e.target.value)} className="w-1/2 bg-bg-tertiary border border-border-subtle rounded-lg px-2 py-1 text-xs text-text-primary">
                                                        <option value="Low">Low</option>
                                                        <option value="Medium">Medium</option>
                                                        <option value="High">High</option>
                                                        <option value="Critical">Critical</option>
                                                    </select>
                                                </div>
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={(e) => { e.stopPropagation(); setEditingCardId(null); }} className="text-text-muted hover:text-text-primary px-2 py-1 text-xs rounded-lg transition-colors"><X className="w-3 h-3" /></button>
                                                    <button onClick={(e) => saveEdit(card.id, e)} className="text-brand-purple bg-brand-purple/20 border border-brand-purple/30 hover:bg-brand-purple/40 px-2 py-1 text-xs rounded-lg transition-colors"><Check className="w-3 h-3" /></button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex flex-wrap gap-2">
                                                        {parseTags(card.tags).map((t: string) => (
                                                            <span key={t} className="text-[10px] uppercase tracking-wider font-bold bg-bg-elevated text-text-muted px-2 py-0.5 rounded-md">
                                                                {t}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                        <button onClick={(e) => startEditing(card, e)} className="text-text-muted hover:text-brand-cyan"><Edit2 className="w-3.5 h-3.5" /></button>
                                                        <button onClick={(e) => deleteCard(card.id, e)} className="text-text-muted hover:text-brand-pink"><Trash2 className="w-3.5 h-3.5" /></button>
                                                    </div>
                                                </div>
                                                <h4 className="text-sm font-medium text-text-primary mb-4 pr-6">{card.title}</h4>
                                                <div className="flex justify-between items-center">
                                                    <span className={`text-[10px] uppercase font-bold tracking-wider ${card.priority === 'Critical' ? 'text-brand-pink' : card.priority === 'High' ? 'text-brand-purple' : 'text-brand-cyan'}`}>
                                                        {card.priority}
                                                    </span>
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-brand-cyan to-brand-purple flex items-center justify-center text-[10px] text-text-primary font-bold shadow-md">
                                                        US
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {addingToColumn === col.id ? (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-white border border-accent-purple/30 rounded-xl shadow-lg space-y-3">
                                    <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Card title..." className="w-full bg-bg-tertiary border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-purple" autoFocus />
                                    <input value={newTags} onChange={e => setNewTags(e.target.value)} placeholder="Tags (comma separated)" className="w-full bg-bg-tertiary border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-purple" />
                                    <select value={newPriority} onChange={e => setNewPriority(e.target.value)} className="w-full bg-bg-tertiary border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-purple">
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Critical">Critical</option>
                                    </select>
                                    <div className="flex gap-2">
                                        <button onClick={() => setAddingToColumn(null)} className="flex-1 py-1.5 text-xs text-text-muted hover:text-text-primary hover:bg-bg-elevated rounded-lg transition-colors">Cancel</button>
                                        <button onClick={() => addCard(col.id)} className="flex-1 py-1.5 text-xs bg-brand-purple hover:bg-brand-purple/80 text-text-primary rounded-lg transition-colors">Add</button>
                                    </div>
                                </motion.div>
                            ) : (
                                <button onClick={() => { setAddingToColumn(col.id); setNewTitle(''); setNewTags(''); setNewPriority('Medium'); }} className="w-full py-3 rounded-xl border border-dashed border-border-subtle text-text-muted hover:text-text-primary hover:border-border-default transition-all text-sm font-medium flex items-center justify-center gap-2 mt-4 bg-bg-tertiary hover:bg-bg-elevated">
                                    <Plus className="w-4 h-4" /> Add Card
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </MotionSection>
        </div>
    );
}

