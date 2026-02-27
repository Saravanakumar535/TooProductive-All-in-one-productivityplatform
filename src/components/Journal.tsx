import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MotionSection } from './ui/MotionSection';
import { BookDashed, Save, Calendar as CalIcon, Trash2, PenLine, Plus, X } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────
interface JournalEntry {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

// ── Storage helpers ────────────────────────────────────────────────
const STORAGE_KEY = 'tooproductive_journal';

function loadEntries(): JournalEntry[] {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
}

function saveEntries(entries: JournalEntry[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export function Journal() {
    const [entries, setEntries] = useState<JournalEntry[]>(() => loadEntries());
    const [saving, setSaving] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

    const refresh = useCallback(() => {
        const fresh = loadEntries();
        setEntries(fresh);
    }, []);

    const startNew = () => {
        setEditingId(null);
        setTitle('');
        setContent('');
        setSelectedEntry(null);
    };

    const editEntry = (entry: JournalEntry) => {
        setEditingId(entry.id);
        setTitle(entry.title);
        setContent(entry.content);
        setSelectedEntry(null);
    };

    const saveEntry = async () => {
        if (!title.trim() || !content.trim()) return;
        setSaving(true);
        await new Promise(r => setTimeout(r, 300)); // UX: brief save animation

        const now = new Date().toISOString();
        let updated: JournalEntry[];

        if (editingId) {
            updated = loadEntries().map(e =>
                e.id === editingId ? { ...e, title, content, updatedAt: now } : e
            );
        } else {
            const newEntry: JournalEntry = {
                id: uid(),
                title,
                content,
                createdAt: now,
                updatedAt: now,
            };
            updated = [newEntry, ...loadEntries()];
        }

        saveEntries(updated);
        setEntries(updated);
        setTitle('');
        setContent('');
        setEditingId(null);
        setSaving(false);
    };

    const deleteEntry = (id: string) => {
        const updated = loadEntries().filter(e => e.id !== id);
        saveEntries(updated);
        setEntries(updated);
        if (selectedEntry?.id === id) setSelectedEntry(null);
        if (editingId === id) {
            setEditingId(null);
            setTitle('');
            setContent('');
        }
    };

    const isEditing = editingId !== null || (!selectedEntry && (title || content));

    return (
        <div className="space-y-8 w-full max-w-5xl mx-auto pb-12">
            <MotionSection delay={0.1}>
                <div className="flex justify-between items-end">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-bold tracking-tight text-text-primary inline-block">
                            Daily <span className="text-gradient-brand">Journal</span>
                        </h1>
                        <p className="text-text-muted text-lg">Capture thoughts, reflections, and ideas.</p>
                    </div>

                    <div className="flex gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={startNew}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-tertiary border border-border-subtle text-text-primary text-sm hover:bg-bg-elevated transition-colors"
                        >
                            <Plus size={16} /> New Entry
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={saveEntry}
                            disabled={saving || !title.trim() || !content.trim()}
                            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)' }}
                        >
                            {saving ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                />
                            ) : (
                                <Save size={16} />
                            )}
                            {editingId ? 'Update Entry' : 'Save Entry'}
                        </motion.button>
                    </div>
                </div>
            </MotionSection>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* ── Left: Editor / Viewer ── */}
                <MotionSection delay={0.2} className="lg:col-span-3">
                    <div className="glass-panel p-8 rounded-3xl border border-border-subtle shadow-2xl space-y-6 relative overflow-hidden h-[600px] flex flex-col">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-cyan to-brand-purple" />

                        {selectedEntry && !isEditing ? (
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedEntry.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex flex-col h-full"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <h2 className="text-3xl font-bold text-text-primary leading-tight">
                                            {selectedEntry.title}
                                        </h2>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => editEntry(selectedEntry)}
                                                className="p-2 rounded-lg bg-bg-tertiary hover:bg-bg-elevated text-accent-cyan transition-colors"
                                            >
                                                <PenLine size={16} />
                                            </button>
                                            <button
                                                onClick={() => deleteEntry(selectedEntry.id)}
                                                className="p-2 rounded-lg bg-bg-tertiary hover:bg-red-50 text-accent-red transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 text-sm text-text-muted font-medium pb-6 border-b border-border-subtle">
                                        <div className="flex items-center gap-2 bg-bg-tertiary px-3 py-1.5 rounded-lg border border-border-subtle">
                                            <CalIcon className="w-4 h-4 text-brand-cyan" />
                                            {formatDate(selectedEntry.createdAt)}
                                        </div>
                                        {selectedEntry.updatedAt !== selectedEntry.createdAt && (
                                            <div className="flex items-center gap-2 bg-bg-tertiary px-3 py-1.5 rounded-lg border border-border-subtle text-text-secondary">
                                                Edited {formatDate(selectedEntry.updatedAt)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 overflow-y-auto custom-scrollbar pt-2">
                                        <p className="text-text-muted text-lg leading-relaxed whitespace-pre-wrap">
                                            {selectedEntry.content}
                                        </p>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        ) : (
                            <>
                                {editingId && (
                                    <div className="flex items-center gap-2 text-xs text-accent-blue font-semibold bg-indigo-50 px-3 py-1.5 rounded-lg w-fit">
                                        <PenLine size={12} /> Editing entry
                                        <button onClick={() => { setEditingId(null); setTitle(''); setContent(''); }}
                                            className="ml-2 hover:text-text-primary transition-colors">
                                            <X size={12} />
                                        </button>
                                    </div>
                                )}

                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Entry Title..."
                                    className="text-3xl font-bold bg-transparent border-none text-text-primary focus:outline-none placeholder:text-text-secondary w-full"
                                />

                                <div className="flex gap-4 text-sm text-text-muted font-medium pb-6 border-b border-border-subtle">
                                    <div className="flex items-center gap-2 bg-bg-tertiary px-3 py-1.5 rounded-lg border border-border-subtle">
                                        <CalIcon className="w-4 h-4 text-brand-cyan" />
                                        {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>

                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Start writing..."
                                    className="w-full flex-1 bg-transparent border-none text-text-muted focus:outline-none resize-none placeholder:text-text-secondary text-lg leading-relaxed custom-scrollbar"
                                />
                            </>
                        )}

                        {!selectedEntry && !isEditing && entries.length === 0 && (
                            <div className="flex-1 flex flex-col items-center justify-center text-text-secondary gap-4">
                                <BookDashed size={48} className="opacity-30" />
                                <p className="text-lg">Click an entry to read it, or start a new one.</p>
                            </div>
                        )}
                    </div>
                </MotionSection>

                {/* ── Right: Past Entries List ── */}
                <MotionSection delay={0.3} className="space-y-6 lg:col-span-1">
                    <div className="glass-panel p-6 rounded-2xl border border-border-subtle space-y-4">
                        <div className="flex items-center gap-3 pb-4 border-b border-border-subtle">
                            <BookDashed className="w-5 h-5 text-text-muted" />
                            <h3 className="font-bold text-text-primary text-sm tracking-wide">PAST ENTRIES</h3>
                        </div>

                        {entries.length === 0 ? (
                            <p className="text-text-secondary text-sm text-center py-4">No entries yet.<br />Write your first one!</p>
                        ) : (
                            <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                                <AnimatePresence>
                                    {entries.map((entry) => (
                                        <motion.div
                                            key={entry.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.08)' }}
                                            onClick={() => {
                                                setSelectedEntry(entry);
                                                setEditingId(null);
                                                setTitle('');
                                                setContent('');
                                            }}
                                            className={`p-3 rounded-xl border cursor-pointer transition-all group relative ${selectedEntry?.id === entry.id
                                                ? 'border-accent-blue/40 bg-indigo-50'
                                                : 'border-transparent hover:border-border-subtle bg-bg-secondary'
                                                }`}
                                        >
                                            <div className="text-xs text-brand-cyan font-bold mb-1">
                                                {formatDate(entry.createdAt)}
                                            </div>
                                            <div className="text-sm text-text-muted font-medium truncate pr-6">
                                                {entry.title}
                                            </div>
                                            <div className="text-xs text-text-secondary truncate mt-0.5">
                                                {entry.content.slice(0, 50)}...
                                            </div>

                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteEntry(entry.id); }}
                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:text-red-400 text-text-secondary"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </MotionSection>
            </div>
        </div>
    );
}
