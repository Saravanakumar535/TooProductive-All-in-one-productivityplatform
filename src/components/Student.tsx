import { useState, useEffect } from 'react';
import { Plus, BookOpen, Clock, Calendar, TrendingUp, Trash2, Play, Pause, CheckCircle2, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { MotionSection } from './ui/MotionSection';
import { AnimatedCard } from './ui/AnimatedCard';
import { GradientButton } from './ui/GradientButton';
import { cn } from '../lib/utils';

interface Subject {
  id: string;
  name: string;
  color: string;
  totalHours: number;
  totalTopics: number;
  completedTopics: number;
  examDate?: string;
}

interface StudySession {
  id: string;
  subjectId: string;
  duration: number; // in minutes
  date: string;
}

interface TimetableSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subjectId: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SUBJECT_COLORS = [
  'var(--brand-cyan)',
  'var(--brand-purple)',
  'var(--brand-pink)',
  '#10b981', // green
  '#f59e0b', // orange
  '#ef4444', // red
];

export function Student() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [activeView, setActiveView] = useState<'subjects' | 'timetable' | 'tracking'>('subjects');

  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: '',
    totalTopics: '',
    examDate: '',
  });

  const [showTimetableForm, setShowTimetableForm] = useState(false);
  const [newSlot, setNewSlot] = useState({
    day: 'Monday',
    startTime: '',
    endTime: '',
    subjectId: '',
  });

  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const res = await fetch('/api/student/data');
        if (res.ok) {
          const data = await res.json();
          setSubjects(data.subjects);
          setSessions(data.sessions);
          setTimetable(data.timetable);
        }
      } catch (error) {
        console.error('Failed to fetch student data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeTimer) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer]);

  const addSubject = async () => {
    if (!newSubject.name || !newSubject.totalTopics) return;

    try {
      const res = await fetch('/api/student/subject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSubject.name,
          totalTopics: newSubject.totalTopics,
          examDate: newSubject.examDate,
          color: SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length]
        })
      });

      if (res.ok) {
        const subject = await res.json();
        setSubjects([...subjects, subject]);
        setNewSubject({ name: '', totalTopics: '', examDate: '' });
        setShowSubjectForm(false);
      }
    } catch (e) {
      console.error('Failed to create subject');
    }
  };

  const deleteSubject = async (id: string) => {
    try {
      const res = await fetch(`/api/student/subject/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSubjects(subjects.filter(s => s.id !== id));
        setSessions(sessions.filter(s => s.subjectId !== id));
        setTimetable(timetable.filter(t => t.subjectId !== id));
      }
    } catch (e) {
      console.error('Failed to delete subject');
    }
  };

  const updateSubjectProgress = async (id: string, completedTopics: number) => {
    const targetTopics = Math.min(completedTopics, subjects.find(s => s.id === id)?.totalTopics || completedTopics);

    // Optimistic cache update
    setSubjects(subjects.map(s => s.id === id ? { ...s, completedTopics: targetTopics } : s));

    try {
      await fetch(`/api/student/subject/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completedTopics: targetTopics })
      });
    } catch (e) {
      console.error('Failed to update progress');
    }
  };

  const startTimer = (subjectId: string) => {
    setActiveTimer(subjectId);
    setTimerSeconds(0);
  };

  const stopTimer = async () => {
    if (activeTimer && timerSeconds > 0) {
      const duration = Math.max(1, Math.floor(timerSeconds / 60)); // ensure at least 1 min

      try {
        const res = await fetch('/api/student/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subjectId: activeTimer,
            duration,
            date: new Date().toISOString()
          })
        });

        if (res.ok) {
          const session = await res.json();
          setSessions([session, ...sessions]);
          setSubjects(subjects.map(s =>
            s.id === activeTimer ? { ...s, totalHours: parseFloat((s.totalHours + duration / 60).toFixed(2)) } : s
          ));
        }
      } catch (e) {
        console.error('Failed to log session');
      }
    }
    setActiveTimer(null);
    setTimerSeconds(0);
  };

  const addTimetableSlot = async () => {
    if (!newSlot.subjectId || !newSlot.startTime || !newSlot.endTime) return;

    try {
      const res = await fetch('/api/student/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day: newSlot.day,
          startTime: newSlot.startTime,
          endTime: newSlot.endTime,
          subjectId: newSlot.subjectId
        })
      });

      if (res.ok) {
        const slot = await res.json();
        setTimetable([...timetable, slot]);
        setNewSlot({ day: 'Monday', startTime: '', endTime: '', subjectId: '' });
        setShowTimetableForm(false);
      }
    } catch (e) {
      console.error('Failed to create timetable slot');
    }
  };

  const deleteTimetableSlot = async (id: string) => {
    try {
      const res = await fetch(`/api/student/timetable/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTimetable(timetable.filter(t => t.id !== id));
      }
    } catch (e) {
      console.error('Failed to delete timetable slot');
    }
  };

  const totalStudyHours = subjects.reduce((sum, s) => sum + s.totalHours, 0);
  const totalTopics = subjects.reduce((sum, s) => sum + s.totalTopics, 0);
  const completedTopics = subjects.reduce((sum, s) => sum + s.completedTopics, 0);
  const overallProgress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

  const upcomingExams = subjects
    .filter(s => s.examDate)
    .map(s => ({
      ...s,
      daysUntil: Math.ceil((new Date(s.examDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
    }))
    .filter(s => s.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  const timeDistribution = subjects
    .filter(s => s.totalHours > 0)
    .map(s => ({
      name: s.name,
      hours: parseFloat(s.totalHours.toFixed(1)),
      color: s.color,
    }));

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 pb-12 w-full max-w-6xl mx-auto">
      <MotionSection delay={0.1}>
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-4xl font-bold tracking-tight text-text-primary inline-block">
            Academic <span className="text-gradient-brand">Command</span>
          </h1>
          <p className="text-text-muted text-lg">Curriculum structuring and telemetry.</p>
        </div>

        {/* View Toggle */}
        <div className="flex p-1 bg-bg-tertiary backdrop-blur-md rounded-xl w-max border border-border-subtle relative overflow-x-auto max-w-full">
          {[
            { id: 'subjects', label: 'Curriculum Base' },
            { id: 'tracking', label: 'Time Nodes' },
            { id: 'timetable', label: 'Schedules' }
          ].map(view => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id as any)}
              className={cn(
                "px-6 py-2.5 rounded-lg font-bold tracking-wide transition-all relative z-10 whitespace-nowrap",
                activeView === view.id ? "text-text-primary" : "text-text-muted hover:text-text-primary"
              )}
            >
              {activeView === view.id && (
                <motion.div layoutId="studentTabs" className="absolute inset-0 bg-bg-elevated border border-border-subtle rounded-lg" />
              )}
              {view.label}
            </button>
          ))}
        </div>
      </MotionSection>

      {/* Stats Cards */}
      <MotionSection delay={0.2}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatedCard className="border border-border-subtle bg-bg-tertiary">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-brand-cyan/10 rounded-xl border border-brand-cyan/20">
                <BookOpen className="w-5 h-5 text-brand-cyan" />
              </div>
              <span className="text-text-muted font-medium tracking-wide">ACTIVE MODULES</span>
            </div>
            <div className="text-4xl font-bold text-text-primary tracking-tight">{subjects.length}</div>
          </AnimatedCard>

          <AnimatedCard className="border border-border-subtle bg-bg-tertiary">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                <Clock className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-text-muted font-medium tracking-wide">TOTAL FOCUS</span>
            </div>
            <div className="text-4xl font-bold text-text-primary tracking-tight">{totalStudyHours.toFixed(1)}h</div>
          </AnimatedCard>

          <AnimatedCard className="border border-border-subtle bg-bg-tertiary">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-brand-purple/10 rounded-xl border border-brand-purple/20">
                <TrendingUp className="w-5 h-5 text-brand-purple" />
              </div>
              <span className="text-text-muted font-medium tracking-wide">SYLLABUS NET</span>
            </div>
            <div className="text-4xl font-bold text-text-primary tracking-tight">{overallProgress.toFixed(0)}%</div>
          </AnimatedCard>

          <AnimatedCard className={cn("border border-border-subtle bg-bg-tertiary", upcomingExams.length > 0 && upcomingExams[0].daysUntil <= 7 && "border-brand-pink/50 shadow-[0_0_20px_rgba(236,72,153,0.1)]")}>
            <div className="flex items-center gap-3 mb-4">
              <div className={cn("p-3 rounded-xl border", upcomingExams.length > 0 && upcomingExams[0].daysUntil <= 7 ? "bg-brand-pink/10 border-brand-pink/20" : "bg-orange-500/10 border-orange-500/20")}>
                <Calendar className={cn("w-5 h-5", upcomingExams.length > 0 && upcomingExams[0].daysUntil <= 7 ? "text-brand-pink" : "text-orange-400")} />
              </div>
              <span className="text-text-muted font-medium tracking-wide">NEXT DEADLINE</span>
            </div>
            <div className="text-4xl font-bold text-text-primary tracking-tight">
              {upcomingExams.length > 0 ? `${upcomingExams[0].daysUntil}d` : '---'}
            </div>
          </AnimatedCard>
        </div>
      </MotionSection>

      <AnimatePresence mode="wait">
        {/* Subjects View */}
        {activeView === 'subjects' && (
          <motion.div key="subjects" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
            {upcomingExams.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {upcomingExams.slice(0, 3).map((exam, i) => (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                    key={exam.id}
                    className={cn(
                      "rounded-3xl p-6 relative overflow-hidden group shadow-lg border",
                      exam.daysUntil <= 7 ? "bg-brand-pink/20 border-brand-pink/50 text-text-primary" : "bg-bg-tertiary border-border-subtle text-text-primary"
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                    <div className="flex items-center gap-3 mb-4 relative z-10">
                      <AlertCircle className={cn("w-6 h-6", exam.daysUntil <= 7 && "animate-pulse")} />
                      <span className="text-sm font-bold tracking-widest uppercase opacity-80">CRITICAL EVENT</span>
                    </div>
                    <div className="text-2xl font-black tracking-tight mb-2 relative z-10">{exam.name}</div>
                    <div className="text-sm opacity-90 font-mono relative z-10">
                      T-MINUS {exam.daysUntil === 0 ? 'ZERO (TODAY)' : exam.daysUntil === 1 ? '1 DAY' : `${exam.daysUntil} DAYS`}
                    </div>
                    <div className="text-xs opacity-50 mt-4 relative z-10 tracking-widest">
                      {new Date(exam.examDate!).toLocaleDateString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-text-primary border-b border-border-subtle pb-2">Academic Divisions</h2>
              <GradientButton onClick={() => setShowSubjectForm(!showSubjectForm)}>
                <Plus className="w-4 h-4 mr-2" /> Init Module
              </GradientButton>
            </div>

            <AnimatePresence>
              {showSubjectForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="glass-panel rounded-2xl p-6 border border-border-subtle space-y-4 mb-6">
                    <h3 className="text-xl font-bold text-text-primary">Initialize New Module</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <input
                        type="text"
                        value={newSubject.name}
                        onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                        placeholder="Module Label"
                        className="w-full px-5 py-3 bg-bg-tertiary border border-border-subtle text-text-primary rounded-xl focus:outline-none focus:border-brand-cyan"
                      />
                      <input
                        type="number"
                        value={newSubject.totalTopics}
                        onChange={(e) => setNewSubject({ ...newSubject, totalTopics: e.target.value })}
                        placeholder="Total Units"
                        className="w-full px-5 py-3 bg-bg-tertiary border border-border-subtle text-text-primary rounded-xl focus:outline-none focus:border-brand-cyan"
                      />
                      <input
                        type="date"
                        value={newSubject.examDate}
                        onChange={(e) => setNewSubject({ ...newSubject, examDate: e.target.value })}
                        className="w-full px-5 py-3 bg-bg-tertiary border border-border-subtle text-text-muted rounded-xl focus:outline-none focus:border-brand-cyan uppercase font-mono text-sm"
                      />
                      <div className="flex gap-4">
                        <GradientButton onClick={addSubject} className="flex-1">Deploy</GradientButton>
                        <button onClick={() => setShowSubjectForm(false)} className="px-4 text-text-muted hover:text-text-primary">Cancel</button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {subjects.length === 0 ? (
                <div className="col-span-1 lg:col-span-2 glass-panel rounded-2xl p-20 text-center border border-border-subtle">
                  <BookOpen className="w-20 h-20 text-brand-purple/40 mx-auto mb-6" />
                  <p className="text-text-muted font-medium text-lg">No academic modules initialized.</p>
                </div>
              ) : (
                subjects.map(subject => {
                  const progress = (subject.completedTopics / subject.totalTopics) * 100;
                  return (
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} key={subject.id} className="glass-panel p-8 rounded-2xl border border-border-subtle relative overflow-hidden">
                      <div className="absolute top-0 right-0 left-0 h-1" style={{ backgroundColor: subject.color }} />

                      <div className="flex items-start justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-4">
                          <div className="w-5 h-5 rounded border border-border-subtle shadow-inner" style={{ backgroundColor: subject.color }} />
                          <div>
                            <h3 className="text-2xl font-bold text-text-primary">{subject.name}</h3>
                            <p className="text-sm font-mono text-text-muted mt-1">{subject.totalHours.toFixed(1)}H EXPOSURE</p>
                          </div>
                        </div>
                        <button onClick={() => deleteSubject(subject.id)} className="p-3 text-text-muted hover:text-brand-pink hover:bg-brand-pink/10 rounded-xl transition-all">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {subject.examDate && (
                        <div className="mb-6 p-4 bg-bg-tertiary border border-border-subtle rounded-xl flex items-center gap-3 text-sm text-text-muted">
                          <Calendar className="w-4 h-4 text-brand-purple" />
                          <span className="font-mono tracking-wide flex-1">
                            DEADLINE: {new Date(subject.examDate).toLocaleDateString()}
                          </span>
                          <span className="bg-brand-purple/20 text-text-primary px-3 py-1 rounded font-bold tracking-widest text-xs">
                            {(() => {
                              const days = Math.ceil((new Date(subject.examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                              return days >= 0 ? `T-${days}D` : 'EXPIRED';
                            })()}
                          </span>
                        </div>
                      )}

                      <div className="mb-8">
                        <div className="flex items-center justify-between text-xs font-bold tracking-widest text-text-muted mb-3">
                          <span>COMPLETION SECTOR</span>
                          <span className="text-text-primary">{subject.completedTopics} / {subject.totalTopics} UNITS</span>
                        </div>
                        <div className="w-full bg-bg-tertiary border border-border-subtle rounded-full h-3 p-0.5">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full rounded-full relative" style={{ backgroundColor: subject.color }}>
                            <div className="absolute inset-0 bg-white/20 w-full animate-pulse blur-[1px]" />
                          </motion.div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <input
                          type="number"
                          min="0"
                          max={subject.totalTopics}
                          value={subject.completedTopics}
                          onChange={(e) => updateSubjectProgress(subject.id, parseInt(e.target.value) || 0)}
                          className="flex-1 px-5 py-4 bg-bg-tertiary border border-border-subtle text-text-primary rounded-xl focus:outline-none focus:border-brand-cyan text-center font-bold text-lg"
                        />
                        <button
                          onClick={() => updateSubjectProgress(subject.id, subject.totalTopics)}
                          className="px-6 py-4 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl hover:bg-green-500/20 transition-colors flex items-center gap-2 font-bold tracking-wide"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          100%
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}

        {/* Time Tracking View */}
        {activeView === 'tracking' && (
          <motion.div key="tracking" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-panel rounded-3xl p-10 border border-border-subtle overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan/5 to-transparent" />
                <h3 className="text-2xl font-bold text-text-primary mb-8 relative z-10 flex items-center gap-3">
                  <Clock className="text-brand-cyan" /> Focus Timer
                </h3>

                {activeTimer ? (
                  <div className="text-center relative z-10 py-10">
                    <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-white tracking-tighter mb-4 font-mono">
                      {formatTime(timerSeconds)}
                    </div>
                    <div className="text-lg text-brand-cyan/80 mb-12 font-bold tracking-widest uppercase">
                      Engaged: {subjects.find(s => s.id === activeTimer)?.name}
                    </div>
                    <button
                      onClick={stopTimer}
                      className="px-10 py-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-full hover:bg-red-500 hover:text-text-primary transition-all transition-colors flex items-center gap-3 mx-auto font-bold tracking-widest text-lg group shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                    >
                      <Pause className="w-6 h-6 fill-current" />
                      TERMINATE & SAVE
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6 relative z-10">
                    <p className="text-text-muted font-medium tracking-wide">Select module grid to initiate focus session:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {subjects.map(subject => (
                        <button
                          key={subject.id}
                          onClick={() => startTimer(subject.id)}
                          className="p-6 bg-bg-tertiary border border-border-subtle rounded-xl hover:border-brand-cyan/50 hover:bg-bg-elevated transition-all flex items-center gap-4 group"
                        >
                          <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: subject.color }} />
                          <span className="text-text-primary font-bold text-lg group-hover:text-brand-cyan transition-colors">{subject.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="glass-panel rounded-2xl p-8 border border-border-subtle">
                <h3 className="text-xl font-bold text-text-primary mb-6 border-b border-border-subtle pb-4 inline-block">Temporal Logs</h3>
                <div className="space-y-3">
                  {sessions.slice(0, 10).map((session, i) => {
                    const subject = subjects.find(s => s.id === session.subjectId);
                    if (!subject) return null;
                    return (
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} key={session.id} className="flex items-center justify-between p-4 bg-bg-tertiary rounded-xl border border-border-subtle hover:border-border-subtle transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-3 h-3 rounded-full shadow-inner" style={{ backgroundColor: subject.color }} />
                          <div>
                            <div className="text-text-primary font-bold tracking-wide">{subject.name}</div>
                            <div className="text-xs text-brand-cyan/70 font-mono mt-1">
                              {new Date(session.date).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-brand-cyan font-bold bg-brand-cyan/10 px-3 py-1.5 rounded">{session.duration}m</div>
                      </motion.div>
                    );
                  })}
                  {sessions.length === 0 && (
                    <p className="text-text-muted text-center py-8 font-medium">Terminal empty. No sessions logged.</p>
                  )}
                </div>
              </div>
            </div>

            {timeDistribution.length > 0 && (
              <AnimatedCard tilt={false} className="h-full border border-border-subtle flex flex-col min-h-[500px]">
                <h3 className="text-xl font-bold text-text-primary mb-8">Allocation Map</h3>
                <div className="flex-1 w-full relative mb-8">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={timeDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="hours"
                        stroke="none"
                      >
                        {timeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(17,17,26,0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                        formatter={(value: number) => `${value} HRS`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center glowing eye */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-brand-cyan/5 border border-brand-cyan/20 flex items-center justify-center flex-col">
                      <Clock className="w-6 h-6 text-brand-cyan mb-1" />
                      <span className="text-brand-cyan font-mono text-xs font-bold">FOCUS</span>
                    </div>
                  </div>
                </div>
                <div className="mt-auto space-y-3">
                  {timeDistribution.map(item => (
                    <div key={item.name} className="flex items-center justify-between p-3 bg-bg-tertiary rounded-xl border border-border-subtle">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded shadow-inner" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-text-muted font-bold tracking-wide">{item.name}</span>
                      </div>
                      <span className="text-sm font-mono text-text-primary bg-bg-tertiary px-2 py-1 rounded">{item.hours}H</span>
                    </div>
                  ))}
                </div>
              </AnimatedCard>
            )}
          </motion.div>
        )}

        {/* Timetable View */}
        {activeView === 'timetable' && (
          <motion.div key="timetable" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-text-primary border-b border-border-subtle pb-2">Scheduling Grid</h2>
              <GradientButton onClick={() => setShowTimetableForm(!showTimetableForm)}>
                <Plus className="w-4 h-4 mr-2" /> Program Slot
              </GradientButton>
            </div>

            <AnimatePresence>
              {showTimetableForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="glass-panel rounded-2xl p-6 border border-border-subtle space-y-4 mb-6">
                    <h3 className="text-xl font-bold text-text-primary">Program Time Frame</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <select
                        value={newSlot.day}
                        onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
                        className="w-full px-5 py-3 bg-bg-tertiary border border-border-subtle text-text-primary rounded-xl focus:outline-none focus:border-brand-cyan"
                      >
                        {DAYS.map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                      <input
                        type="time"
                        value={newSlot.startTime}
                        onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                        className="w-full px-5 py-3 bg-bg-tertiary border border-border-subtle text-text-primary rounded-xl focus:outline-none focus:border-brand-cyan"
                      />
                      <input
                        type="time"
                        value={newSlot.endTime}
                        onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                        className="w-full px-5 py-3 bg-bg-tertiary border border-border-subtle text-text-primary rounded-xl focus:outline-none focus:border-brand-cyan"
                      />
                      <select
                        value={newSlot.subjectId}
                        onChange={(e) => setNewSlot({ ...newSlot, subjectId: e.target.value })}
                        className="w-full px-5 py-3 bg-bg-tertiary border border-border-subtle text-text-primary rounded-xl focus:outline-none focus:border-brand-cyan"
                      >
                        <option value="">Select Module</option>
                        {subjects.map(subject => (
                          <option key={subject.id} value={subject.id}>{subject.name}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <GradientButton onClick={addTimetableSlot} className="flex-1">Add</GradientButton>
                        <button onClick={() => setShowTimetableForm(false)} className="px-4 text-text-muted hover:text-text-primary">x</button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="glass-panel rounded-3xl p-6 border border-border-subtle overflow-x-auto custom-scrollbar">
              <div className="min-w-[900px]">
                <div className="grid grid-cols-8 gap-4 mb-4">
                  <div className="pb-4 border-b border-border-subtle font-bold tracking-widest text-brand-cyan text-sm uppercase">Time Node</div>
                  {DAYS.map(day => (
                    <div key={day} className="pb-4 border-b border-border-subtle font-bold tracking-widest text-text-muted text-center text-sm uppercase">
                      {day}
                    </div>
                  ))}
                </div>

                {timetable.length === 0 ? (
                  <div className="col-span-8 text-center py-20">
                    <Calendar className="w-16 h-16 text-brand-purple/30 mx-auto mb-4" />
                    <p className="text-text-muted font-medium">Grid is unpopulated. Add slots to configure weekly schema.</p>
                  </div>
                ) : (
                  DAYS.map(day => {
                    const daySlots = timetable
                      .filter(slot => slot.day === day)
                      .sort((a, b) => a.startTime.localeCompare(b.startTime));

                    return daySlots.map((slot, index) => {
                      const subject = subjects.find(s => s.id === slot.subjectId);
                      if (!subject) return null;

                      return (
                        <div key={slot.id} className="grid grid-cols-8 gap-4 mb-3 border-b border-border-subtle pb-3">
                          {index === 0 && (
                            <div className="py-3 text-sm font-mono text-text-muted">
                              {slot.startTime} <br className="hidden md:block" /><span className="text-text-secondary">to</span> {slot.endTime}
                            </div>
                          )}
                          {index > 0 && <div />}

                          {DAYS.map(d => (
                            <div key={d}>
                              {d === day ? (
                                <div
                                  className="p-4 rounded-xl text-text-primary text-sm relative group cursor-pointer shadow-lg hover:-translate-y-1 transition-transform border border-border-subtle"
                                  style={{ backgroundColor: `${subject.color}` }}
                                >
                                  <div className="font-bold tracking-wide mb-1 leading-tight">{subject.name}</div>
                                  <div className="text-xs font-mono font-medium opacity-80">
                                    {slot.startTime}-{slot.endTime}
                                  </div>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); deleteTimetableSlot(slot.id); }}
                                    className="absolute top-2 right-2 p-1.5 bg-black/30 rounded-lg hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-all text-text-primary border border-border-subtle"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div />
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    });
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

