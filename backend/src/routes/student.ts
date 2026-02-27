import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// Authenticated user helper (mock for now)
const getUserId = async () => {
    const user = await prisma.user.findFirst();
    if (!user) throw new Error("No user found in database");
    return user.id;
};

// GET /api/student/data - Fetch all student module data globally
router.get('/data', async (req, res) => {
    try {
        const userId = await getUserId();

        const subjects = await prisma.subject.findMany({ where: { userId } });
        const sessions = await prisma.studySession.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
            take: 50
        });
        const timetable = await prisma.timetableSlot.findMany({ where: { userId } });

        res.json({ subjects, sessions, timetable });
    } catch (error) {
        console.error('Error fetching student data:', error);
        res.status(500).json({ error: 'Failed to fetch student data' });
    }
});

// SUBJECTS
router.post('/subject', async (req, res) => {
    try {
        const userId = await getUserId();
        const { name, color, totalTopics, examDate } = req.body;

        const subject = await prisma.subject.create({
            data: {
                name,
                color,
                totalTopics: parseInt(totalTopics),
                examDate: examDate ? new Date(examDate) : null,
                userId
            }
        });
        res.status(201).json(subject);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create subject' });
    }
});

router.put('/subject/:id', async (req, res) => {
    try {
        const userId = await getUserId();
        const { id } = req.params;
        const { completedTopics, addHours } = req.body;

        const existing = await prisma.subject.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId) return res.status(404).json({ error: 'Subject not found' });

        const updateData: any = {};
        if (completedTopics !== undefined) updateData.completedTopics = parseInt(completedTopics);
        if (addHours !== undefined) updateData.totalHours = existing.totalHours + parseFloat(addHours);

        const updated = await prisma.subject.update({
            where: { id },
            data: updateData
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update subject' });
    }
});

router.delete('/subject/:id', async (req, res) => {
    try {
        const userId = await getUserId();
        const { id } = req.params;

        const existing = await prisma.subject.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId) return res.status(404).json({ error: 'Subject not found' });

        // Prisma relation uses cascade, so deleting subject deletes sessions/slots automatically
        await prisma.subject.delete({ where: { id } });
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete subject' });
    }
});

// STUDY SESSIONS
router.post('/session', async (req, res) => {
    try {
        const userId = await getUserId();
        const { subjectId, duration, date } = req.body;

        const session = await prisma.studySession.create({
            data: {
                subjectId,
                duration: parseInt(duration),
                date: new Date(date),
                userId
            }
        });

        // Auto-increment the subject's totalHours
        const existingSubject = await prisma.subject.findUnique({ where: { id: subjectId } });
        if (existingSubject) {
            await prisma.subject.update({
                where: { id: subjectId },
                data: { totalHours: existingSubject.totalHours + (duration / 60) }
            });
        }

        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create study session' });
    }
});

// TIMETABLE
router.post('/timetable', async (req, res) => {
    try {
        const userId = await getUserId();
        const { day, startTime, endTime, subjectId } = req.body;

        const slot = await prisma.timetableSlot.create({
            data: {
                day,
                startTime,
                endTime,
                subjectId,
                userId
            }
        });
        res.status(201).json(slot);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create timetable slot' });
    }
});

router.delete('/timetable/:id', async (req, res) => {
    try {
        const userId = await getUserId();
        const { id } = req.params;

        const existing = await prisma.timetableSlot.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId) return res.status(404).json({ error: 'Slot not found' });

        await prisma.timetableSlot.delete({ where: { id } });
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete timetable slot' });
    }
});

export default router;
