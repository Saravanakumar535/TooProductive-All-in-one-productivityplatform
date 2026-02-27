import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

/* ================================
   GET DASHBOARD STATS
   Returns all aggregated stats in one call
================================ */

router.get('/', async (req, res) => {
    try {
        // Get or create default user
        let user = await prisma.user.findFirst();
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: 'default@example.com',
                    passwordHash: '',
                    name: 'Default User'
                }
            });
        }

        const userId = user.id;

        // Parallel fetch all data
        const [tasks, habits, goals, learningEntries, journalEntries] = await Promise.all([
            prisma.task.findMany({ where: { userId } }),
            prisma.habit.findMany({ where: { userId } }),
            prisma.goal.findMany({ where: { userId } }),
            prisma.learningEntry.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
            prisma.journal.findMany({ where: { userId } }),
        ]);

        // ── Task Stats ──
        const tasksCompleted = tasks.filter(t => t.completed).length;
        const totalTasks = tasks.length;

        // ── Habit Stats ──
        const habitsCompleted = habits.filter(h => h.completed).length;
        const totalHabits = habits.length;
        const longestHabitStreak = habits.reduce((max, h) => Math.max(max, h.longestStreak), 0);
        const currentHabitStreak = habits.reduce((max, h) => Math.max(max, h.currentStreak), 0);

        // ── Goal Stats ──
        const goalsAchieved = goals.filter(g => g.completed).length;
        const totalGoals = goals.length;

        // ── Learning Stats ──
        const totalLearningMins = learningEntries.reduce((sum, e) => sum + e.duration, 0);

        // Calculate learning streak (consecutive days)
        const today = new Date();
        let learningStreak = 0;
        const sortedLogs = [...learningEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        for (let i = 0; i < sortedLogs.length; i++) {
            const entryDate = new Date(sortedLogs[i].date);
            const expected = new Date(today);
            expected.setDate(today.getDate() - i);
            if (entryDate.toDateString() === expected.toDateString()) {
                learningStreak++;
            } else {
                break;
            }
        }

        // ── Journal Stats ──
        const totalJournalEntries = journalEntries.length;

        // ── Weekly Output Velocity Chart ──
        // Build last 7 days buckets
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const last7: { day: string; date: string; tasks: number; learning: number; habits: number }[] = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dayKey = d.toDateString();
            const dayLabel = days[d.getDay()];

            const tasksOnDay = tasks.filter(t => {
                if (!t.updatedAt) return false;
                return new Date(t.updatedAt).toDateString() === dayKey && t.completed;
            }).length;

            const learningMinsOnDay = learningEntries
                .filter(e => new Date(e.date).toDateString() === dayKey)
                .reduce((sum, e) => sum + e.duration, 0);

            const habitsOnDay = habits.filter(h => {
                if (!h.lastCompletedDate) return false;
                return new Date(h.lastCompletedDate).toDateString() === dayKey;
            }).length;

            last7.push({
                day: dayLabel,
                date: dayKey,
                tasks: tasksOnDay,
                learning: Math.round(learningMinsOnDay / 10), // scale: mins/10 for chart
                habits: habitsOnDay,
            });
        }

        res.json({
            user: { xp: user.xp, level: user.level, name: user.name },
            stats: {
                tasksCompleted,
                totalTasks,
                habitsCompleted,
                totalHabits,
                currentHabitStreak,
                longestHabitStreak,
                goalsAchieved,
                totalGoals,
                totalLearningMins,
                learningStreak,
                totalJournalEntries,
            },
            weeklyActivity: last7,
        });

    } catch (error) {
        console.error('DASHBOARD ERROR:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

export default router;
