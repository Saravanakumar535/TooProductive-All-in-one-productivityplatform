import { Router } from 'express';
import { prisma } from '../index';

const router = Router();

/* =========================
   GET CARDS
========================= */
router.get('/', async (req, res) => {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: 'Valid userId query parameter is required' });
    }

    try {
        const cards = await prisma.kanbanCard.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        res.json(cards);
    } catch (error) {
        console.error("GET KANBAN CARD ERROR:", error);
        res.status(500).json({ error: 'Failed to fetch kanban cards' });
    }
});

/* =========================
   CREATE CARD
========================= */
router.post('/', async (req, res) => {
    const { title, column, priority, tags, userId, email, name } = req.body;

    if (!title || !userId) {
        return res.status(400).json({ error: 'Title and userId are required' });
    }

    try {
        let user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    id: userId,
                    email: email || `${userId}@temp.com`,
                    name: name || "Temporary User"
                }
            });
        }

        const card = await prisma.kanbanCard.create({
            data: {
                title,
                column: column || 'todo',
                priority: priority || 'Medium',
                tags: tags || '[]',
                userId: user.id
            }
        });

        res.status(201).json(card);

    } catch (error) {
        console.error("CREATE KANBAN ERROR:", error);
        res.status(500).json({ error: 'Failed to create kanban card' });
    }
});

/* =========================
   UPDATE CARD
========================= */
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, column, priority, tags } = req.body;

    try {
        const card = await prisma.kanbanCard.update({
            where: { id },
            data: {
                ...(title !== undefined && title !== null && { title }),
                ...(column !== undefined && column !== null && { column }),
                ...(priority !== undefined && priority !== null && { priority }),
                ...(tags !== undefined && tags !== null && { tags }),
            },
        });

        res.json(card);

    } catch (error) {
        console.error("UPDATE KANBAN CARD ERROR:", error);
        res.status(500).json({ error: 'Failed to update kanban card' });
    }
});

/* =========================
   DELETE CARD
========================= */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.kanbanCard.delete({
            where: { id },
        });

        res.status(204).send();

    } catch (error) {
        console.error("DELETE KANBAN CARD ERROR:", error);
        res.status(500).json({ error: 'Failed to delete kanban card' });
    }
});

export default router;
