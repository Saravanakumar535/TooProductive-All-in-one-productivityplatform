import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

const getUserId = async () => {
    const user = await prisma.user.findFirst();
    if (!user) throw new Error("No user found in database");
    return user.id;
};

// GET /api/goals - Fetch all goals and current XP
router.get('/', async (req, res) => {
    try {
        const userId = await getUserId();
        const goals = await prisma.goal.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        const user = await prisma.user.findUnique({ where: { id: userId } });

        res.json({ goals, xp: user?.xp || 0 });
    } catch (error) {
        console.error('Error fetching goals:', error);
        res.status(500).json({ error: 'Failed to fetch goals' });
    }
});

// POST /api/goals
router.post('/', async (req, res) => {
    try {
        const userId = await getUserId();
        const { title, description, targetValue, unit, category, xpReward } = req.body;

        const goal = await prisma.goal.create({
            data: {
                title,
                description,
                targetValue: parseInt(targetValue),
                currentValue: 0,
                unit,
                category,
                xpReward: parseInt(xpReward),
                userId
            }
        });
        res.status(201).json(goal);
    } catch (error) {
        console.error('Error creating goal:', error);
        res.status(500).json({ error: 'Failed to create goal' });
    }
});

// PUT /api/goals/:id - Update progress
router.put('/:id', async (req, res) => {
    try {
        const userId = await getUserId();
        const { id } = req.params;
        const { currentValue } = req.body;

        const existing = await prisma.goal.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        const newValue = Math.min(parseInt(currentValue), existing.targetValue);
        const isNowCompleted = newValue >= existing.targetValue;

        const updateData: any = { currentValue: newValue };

        if (!existing.completed && isNowCompleted) {
            updateData.completed = true;
            updateData.completedAt = new Date();

            // Add XP to user
            await prisma.user.update({
                where: { id: userId },
                data: { xp: { increment: existing.xpReward } }
            });
        }

        const updated = await prisma.goal.update({
            where: { id },
            data: updateData
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update goal' });
    }
});

// DELETE /api/goals/:id
router.delete('/:id', async (req, res) => {
    try {
        const userId = await getUserId();
        const { id } = req.params;

        const existing = await prisma.goal.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        await prisma.goal.delete({ where: { id } });
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete goal' });
    }
});

export default router;
