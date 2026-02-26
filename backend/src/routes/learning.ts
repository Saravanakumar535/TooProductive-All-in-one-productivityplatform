import { Router } from 'express';
import { prisma } from '../index';

const router = Router();

/* ================================
   HELPER: GET OR CREATE DEFAULT USER
================================ */

async function getUserId() {
    let user = await prisma.user.findFirst();

    if (!user) {
        user = await prisma.user.create({
            data: {
                email: "default@example.com",
                passwordHash: "",
                name: "Default User"
            }
        });
    }

    return user.id;
}

/* ================================
   GET ALL LEARNING ENTRIES
================================ */

router.get('/', async (req, res) => {
    try {
        const userId = await getUserId();

        const entries = await prisma.learningEntry.findMany({
            where: { userId },
            orderBy: { date: 'desc' }
        });

        res.json(entries);
    } catch (error) {
        console.error('GET LEARNING ERROR:', error);
        res.status(500).json({ error: 'Failed to fetch learning entries' });
    }
});

/* ================================
   CREATE LEARNING ENTRY
================================ */

router.post('/', async (req, res) => {
    try {
        const userId = await getUserId();
        const { title, description, category, duration, date } = req.body;

        if (!title || !description || !category || !duration) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const entry = await prisma.learningEntry.create({
            data: {
                title,
                description,
                category,
                duration: parseInt(duration),
                date: date ? new Date(date) : new Date(),
                userId
            }
        });

        // Award XP: 10 XP per 30 mins (min 10 XP)
        const xpGained = Math.max(10, Math.floor((parseInt(duration) / 30) * 10));
        await prisma.user.update({
            where: { id: userId },
            data: { xp: { increment: xpGained } }
        });

        res.status(201).json(entry);
    } catch (error) {
        console.error('CREATE LEARNING ERROR:', error);
        res.status(500).json({ error: 'Failed to create learning entry' });
    }
});

/* ================================
   UPDATE LEARNING ENTRY
================================ */

router.put('/:id', async (req, res) => {
    try {
        const userId = await getUserId();
        const { id } = req.params;
        const { title, description, category, duration } = req.body;

        const existing = await prisma.learningEntry.findUnique({ where: { id } });

        if (!existing || existing.userId !== userId) {
            return res.status(404).json({ error: 'Entry not found' });
        }

        const updated = await prisma.learningEntry.update({
            where: { id },
            data: {
                title: title ?? existing.title,
                description: description ?? existing.description,
                category: category ?? existing.category,
                duration: duration !== undefined ? parseInt(duration) : existing.duration
            }
        });

        res.json(updated);
    } catch (error) {
        console.error('UPDATE LEARNING ERROR:', error);
        res.status(500).json({ error: 'Failed to update learning entry' });
    }
});

/* ================================
   DELETE LEARNING ENTRY
================================ */

router.delete('/:id', async (req, res) => {
    try {
        const userId = await getUserId();
        const { id } = req.params;

        const existing = await prisma.learningEntry.findUnique({ where: { id } });

        if (!existing || existing.userId !== userId) {
            return res.status(404).json({ error: 'Entry not found' });
        }

        await prisma.learningEntry.delete({ where: { id } });

        res.status(204).end();
    } catch (error) {
        console.error('DELETE LEARNING ERROR:', error);
        res.status(500).json({ error: 'Failed to delete entry' });
    }
});

export default router;
