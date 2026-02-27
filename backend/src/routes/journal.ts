import { Router } from 'express';
import { prisma } from '../lib/prisma';

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
   GET ALL JOURNAL ENTRIES
================================ */

router.get('/', async (req, res) => {
    try {
        const userId = await getUserId();

        const entries = await prisma.journal.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        res.json(entries);
    } catch (error) {
        console.error('GET JOURNAL ERROR:', error);
        res.status(500).json({ error: 'Failed to fetch journal entries' });
    }
});

/* ================================
   CREATE JOURNAL ENTRY
================================ */

router.post('/', async (req, res) => {
    try {
        const userId = await getUserId();
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        const entry = await prisma.journal.create({
            data: {
                title,
                content,
                userId
            }
        });

        res.status(201).json(entry);
    } catch (error) {
        console.error('CREATE JOURNAL ERROR:', error);
        res.status(500).json({ error: 'Failed to create journal entry' });
    }
});

/* ================================
   UPDATE JOURNAL ENTRY
================================ */

router.put('/:id', async (req, res) => {
    try {
        const userId = await getUserId();
        const { id } = req.params;
        const { title, content } = req.body;

        const existing = await prisma.journal.findUnique({ where: { id } });

        if (!existing || existing.userId !== userId) {
            return res.status(404).json({ error: 'Journal entry not found' });
        }

        const updated = await prisma.journal.update({
            where: { id },
            data: { title, content }
        });

        res.json(updated);
    } catch (error) {
        console.error('UPDATE JOURNAL ERROR:', error);
        res.status(500).json({ error: 'Failed to update journal entry' });
    }
});

/* ================================
   DELETE JOURNAL ENTRY
================================ */

router.delete('/:id', async (req, res) => {
    try {
        const userId = await getUserId();
        const { id } = req.params;

        const existing = await prisma.journal.findUnique({ where: { id } });

        if (!existing || existing.userId !== userId) {
            return res.status(404).json({ error: 'Journal entry not found' });
        }

        await prisma.journal.delete({ where: { id } });

        res.status(204).end();
    } catch (error) {
        console.error('DELETE JOURNAL ERROR:', error);
        res.status(500).json({ error: 'Failed to delete journal entry' });
    }
});

export default router;
