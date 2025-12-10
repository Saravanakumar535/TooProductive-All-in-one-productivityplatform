import { useState, useEffect } from 'react';
import { Plus, BookOpen, Clock, Calendar, TrendingUp, Trash2, Play, Pause, CheckCircle2, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

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
const SUBJECT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export function Student() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [activeView, setActiveView] = useState<'subjects' | 'timetable' | 'tracking'>('subjects');
  
  // Subject form
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: '',
    totalTopics: '',
    examDate: '',
  });

  // Timetable form
  const [showTimetableForm, setShowTimetableForm] = useState(false);
  const [newSlot, setNewSlot] = useState({
    day: 'Monday',
    startTime: '',
    endTime: '',
    subjectId: '',
  });

  // Study timer
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);

  useEffect(() => {
    const savedSubjects = localStorage.getItem('tooproductive_student_subjects');
    if (savedSubjects) setSubjects(JSON.parse(savedSubjects));

    const savedSessions = localStorage.getItem('tooproductive_student_sessions');
    if (savedSessions) setSessions(JSON.parse(savedSessions));

    const savedTimetable = localStorage.getItem('tooproductive_student_timetable');
    if (savedTimetable) setTimetable(JSON.parse(savedTimetable));
  }, []);

  useEffect(() => {
    localStorage.setItem('tooproductive_student_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('tooproductive_student_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('tooproductive_student_timetable', JSON.stringify(timetable));
  }, [timetable]);

  // Timer effect
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

  const addSubject = () => {
    if (!newSubject.name || !newSubject.totalTopics) return;

    const subject: Subject = {
      id: Date.now().toString(),
      name: newSubject.name,
      color: SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length],
      totalHours: 0,
      totalTopics: parseInt(newSubject.totalTopics),
      completedTopics: 0,
      examDate: newSubject.examDate || undefined,
    };

    setSubjects([...subjects, subject]);
    setNewSubject({ name: '', totalTopics: '', examDate: '' });
    setShowSubjectForm(false);
  };

  const deleteSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
    setSessions(sessions.filter(s => s.subjectId !== id));
    setTimetable(timetable.filter(t => t.subjectId !== id));
  };

  const updateSubjectProgress = (id: string, completedTopics: number) => {
    setSubjects(subjects.map(s =>
      s.id === id ? { ...s, completedTopics: Math.min(completedTopics, s.totalTopics) } : s
    ));
  };

  const startTimer = (subjectId: string) => {
    setActiveTimer(subjectId);
    setTimerSeconds(0);
  };

  const stopTimer = () => {
    if (activeTimer && timerSeconds > 0) {
      const duration = Math.floor(timerSeconds / 60);
      const session: StudySession = {
        id: Date.now().toString(),
        subjectId: activeTimer,
        duration,
        date: new Date().toISOString(),
      };
      setSessions([session, ...sessions]);

      // Update subject total hours
      setSubjects(subjects.map(s =>
        s.id === activeTimer ? { ...s, totalHours: s.totalHours + duration / 60 } : s
      ));
    }
    setActiveTimer(null);
    setTimerSeconds(0);
  };

  const addTimetableSlot = () => {
    if (!newSlot.subjectId || !newSlot.startTime || !newSlot.endTime) return;

    const slot: TimetableSlot = {
      id: Date.now().toString(),
      day: newSlot.day,
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
      subjectId: newSlot.subjectId,
    };

    setTimetable([...timetable, slot]);
    setNewSlot({ day: 'Monday', startTime: '', endTime: '', subjectId: '' });
    setShowTimetableForm(false);
  };

  const deleteTimetableSlot = (id: string) => {
    setTimetable(timetable.filter(t => t.id !== id));
  };

  // Calculate stats
  const totalStudyHours = subjects.reduce((sum, s) => sum + s.totalHours, 0);
  const totalTopics = subjects.reduce((sum, s) => sum + s.totalTopics, 0);
  const completedTopics = subjects.reduce((sum, s) => sum + s.completedTopics, 0);
  const overallProgress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

  // Get upcoming exam
  const upcomingExams = subjects
    .filter(s => s.examDate)
    .map(s => ({
      ...s,
      daysUntil: Math.ceil((new Date(s.examDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
    }))
    .filter(s => s.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  // Time distribution data
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
    <div className="space-y-6">
      <div>
        <h1 className="text-slate-900 mb-2">Student Dashboard</h1>
        <p className="text-slate-600">Manage your studies, track time, and plan your timetable</p>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveView('subjects')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeView === 'subjects'
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Subjects & Progress
        </button>
        <button
          onClick={() => setActiveView('tracking')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeView === 'tracking'
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Time Tracking
        </button>
        <button
          onClick={() => setActiveView('timetable')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeView === 'timetable'
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Timetable
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-slate-600">Total Subjects</span>
          </div>
          <div className="text-slate-900">{subjects.length}</div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-slate-600">Study Hours</span>
          </div>
          <div className="text-slate-900">{totalStudyHours.toFixed(1)}h</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-slate-600">Syllabus Progress</span>
          </div>
          <div className="text-slate-900">{overallProgress.toFixed(0)}%</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${
              upcomingExams.length > 0 && upcomingExams[0].daysUntil <= 7 
                ? 'bg-red-100' 
                : 'bg-orange-100'
            }`}>
              <Calendar className={`w-5 h-5 ${
                upcomingExams.length > 0 && upcomingExams[0].daysUntil <= 7 
                  ? 'text-red-600' 
                  : 'text-orange-600'
              }`} />
            </div>
            <span className="text-slate-600">Next Exam</span>
          </div>
          <div className="text-slate-900">
            {upcomingExams.length > 0 ? `${upcomingExams[0].daysUntil} days` : 'None'}
          </div>
        </div>
      </div>

      {/* Subjects View */}
      {activeView === 'subjects' && (
        <>
          {/* Exam Countdown */}
          {upcomingExams.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingExams.slice(0, 3).map(exam => (
                <div
                  key={exam.id}
                  className={`rounded-xl p-6 shadow-sm ${
                    exam.daysUntil <= 7 
                      ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white' 
                      : 'bg-gradient-to-br from-orange-500 to-yellow-500 text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm opacity-90">Upcoming Exam</span>
                  </div>
                  <div className="mb-1">{exam.name}</div>
                  <div className="text-sm opacity-90">
                    {exam.daysUntil === 0 ? 'Today!' : exam.daysUntil === 1 ? 'Tomorrow' : `in ${exam.daysUntil} days`}
                  </div>
                  <div className="text-xs opacity-75 mt-1">
                    {new Date(exam.examDate!).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <h2 className="text-slate-900">Subjects & Syllabus Coverage</h2>
            <button
              onClick={() => setShowSubjectForm(!showSubjectForm)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Subject
            </button>
          </div>

          {/* Add Subject Form */}
          {showSubjectForm && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-slate-900 mb-4">Add New Subject</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  placeholder="Subject Name (e.g., Mathematics)"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={newSubject.totalTopics}
                    onChange={(e) => setNewSubject({ ...newSubject, totalTopics: e.target.value })}
                    placeholder="Total Topics/Chapters"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  <input
                    type="date"
                    value={newSubject.examDate}
                    onChange={(e) => setNewSubject({ ...newSubject, examDate: e.target.value })}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={addSubject}
                    className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
                  >
                    Add Subject
                  </button>
                  <button
                    onClick={() => setShowSubjectForm(false)}
                    className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Subjects List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {subjects.length === 0 ? (
              <div className="col-span-2 bg-white rounded-xl p-12 text-center shadow-sm">
                <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No subjects yet. Add your first subject!</p>
              </div>
            ) : (
              subjects.map(subject => {
                const progress = (subject.completedTopics / subject.totalTopics) * 100;
                return (
                  <div key={subject.id} className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: subject.color }}
                        />
                        <div>
                          <h3 className="text-slate-900">{subject.name}</h3>
                          <p className="text-sm text-slate-600">
                            {subject.totalHours.toFixed(1)}h studied
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteSubject(subject.id)}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {subject.examDate && (
                      <div className="mb-3 p-2 bg-orange-50 rounded-lg flex items-center gap-2 text-sm text-orange-700">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Exam: {new Date(subject.examDate).toLocaleDateString()}
                          {(() => {
                            const days = Math.ceil((new Date(subject.examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            return days >= 0 ? ` (${days} days)` : ' (Past)';
                          })()}
                        </span>
                      </div>
                    )}

                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm text-slate-600 mb-1">
                        <span>Syllabus Coverage</span>
                        <span>{subject.completedTopics} / {subject.totalTopics} topics</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{ 
                            width: `${progress}%`,
                            backgroundColor: subject.color,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        max={subject.totalTopics}
                        value={subject.completedTopics}
                        onChange={(e) => updateSubjectProgress(subject.id, parseInt(e.target.value) || 0)}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                      <button
                        onClick={() => updateSubjectProgress(subject.id, subject.totalTopics)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Complete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Time Tracking View */}
      {activeView === 'tracking' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Study Timer */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-slate-900 mb-4">Study Timer</h3>
                
                {activeTimer ? (
                  <div className="text-center">
                    <div className="text-slate-900 mb-2">
                      {formatTime(timerSeconds)}
                    </div>
                    <div className="text-slate-600 mb-4">
                      Studying: {subjects.find(s => s.id === activeTimer)?.name}
                    </div>
                    <button
                      onClick={stopTimer}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 mx-auto"
                    >
                      <Pause className="w-5 h-5" />
                      Stop & Save
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-slate-600">Select a subject to start tracking study time:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {subjects.map(subject => (
                        <button
                          key={subject.id}
                          onClick={() => startTimer(subject.id)}
                          className="p-4 border-2 border-slate-200 rounded-lg hover:border-purple-600 transition-colors flex items-center gap-2"
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: subject.color }}
                          />
                          <span className="text-slate-900">{subject.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Sessions */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-slate-900 mb-4">Recent Study Sessions</h3>
                <div className="space-y-2">
                  {sessions.slice(0, 10).map(session => {
                    const subject = subjects.find(s => s.id === session.subjectId);
                    if (!subject) return null;
                    return (
                      <div key={session.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: subject.color }}
                          />
                          <div>
                            <div className="text-slate-900">{subject.name}</div>
                            <div className="text-sm text-slate-500">
                              {new Date(session.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-slate-700">{session.duration} min</div>
                      </div>
                    );
                  })}
                  {sessions.length === 0 && (
                    <p className="text-slate-500 text-center py-4">No study sessions yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Time Distribution Chart */}
            {timeDistribution.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-slate-900 mb-4">Time Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={timeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="hours"
                    >
                      {timeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value}h`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {timeDistribution.map(item => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-slate-700">{item.name}</span>
                      </div>
                      <span className="text-sm text-slate-900">{item.hours}h</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Timetable View */}
      {activeView === 'timetable' && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-slate-900">Weekly Timetable</h2>
            <button
              onClick={() => setShowTimetableForm(!showTimetableForm)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Slot
            </button>
          </div>

          {/* Add Timetable Form */}
          {showTimetableForm && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-slate-900 mb-4">Add Timetable Slot</h3>
              <div className="space-y-3">
                <select
                  value={newSlot.day}
                  onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  {DAYS.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                <div className="flex gap-3">
                  <input
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  <input
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <select
                  value={newSlot.subjectId}
                  onChange={(e) => setNewSlot({ ...newSlot, subjectId: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                  ))}
                </select>
                <div className="flex gap-3">
                  <button
                    onClick={addTimetableSlot}
                    className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
                  >
                    Add Slot
                  </button>
                  <button
                    onClick={() => setShowTimetableForm(false)}
                    className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Timetable Grid */}
          <div className="bg-white rounded-xl p-6 shadow-sm overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-8 gap-2">
                <div className="p-3 font-medium text-slate-700">Time</div>
                {DAYS.map(day => (
                  <div key={day} className="p-3 font-medium text-slate-700 text-center">
                    {day.slice(0, 3)}
                  </div>
                ))}
              </div>

              {timetable.length === 0 ? (
                <div className="col-span-8 text-center py-12">
                  <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No timetable slots yet. Add your first slot!</p>
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
                      <div key={slot.id} className="grid grid-cols-8 gap-2 mb-2">
                        {index === 0 && (
                          <div className="p-3 text-sm text-slate-600">
                            {slot.startTime} - {slot.endTime}
                          </div>
                        )}
                        {index > 0 && <div />}
                        
                        {DAYS.map(d => (
                          <div key={d}>
                            {d === day ? (
                              <div
                                className="p-3 rounded-lg text-white text-sm relative group"
                                style={{ backgroundColor: subject.color }}
                              >
                                <div>{subject.name}</div>
                                <div className="text-xs opacity-90">
                                  {slot.startTime} - {slot.endTime}
                                </div>
                                <button
                                  onClick={() => deleteTimetableSlot(slot.id)}
                                  className="absolute top-1 right-1 p-1 bg-white/20 rounded hover:bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="w-3 h-3" />
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

          {/* Timetable List View (Mobile Friendly) */}
          <div className="md:hidden space-y-4">
            {DAYS.map(day => {
              const daySlots = timetable
                .filter(slot => slot.day === day)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));

              if (daySlots.length === 0) return null;

              return (
                <div key={day} className="bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="text-slate-900 mb-3">{day}</h3>
                  <div className="space-y-2">
                    {daySlots.map(slot => {
                      const subject = subjects.find(s => s.id === slot.subjectId);
                      if (!subject) return null;

                      return (
                        <div
                          key={slot.id}
                          className="p-3 rounded-lg flex items-center justify-between"
                          style={{ backgroundColor: `${subject.color}20` }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: subject.color }}
                            />
                            <div>
                              <div className="text-slate-900">{subject.name}</div>
                              <div className="text-sm text-slate-600">
                                {slot.startTime} - {slot.endTime}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteTimetableSlot(slot.id)}
                            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
