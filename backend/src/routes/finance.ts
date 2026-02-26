import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// In a real app, you would get this from the JWT token via middleware
// For now, we'll fetch the first user to act as the authenticated user
const getUserId = async () => {
    const user = await prisma.user.findFirst();
    if (!user) throw new Error("No user found in database");
    return user.id;
};

// GET /api/finance
router.get('/', async (req, res) => {
    try {
        const userId = await getUserId();
        const expenses = await prisma.expense.findMany({
            where: { userId },
            orderBy: { date: 'desc' }
        });
        res.json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});

// POST /api/finance
router.post('/', async (req, res) => {
    try {
        const userId = await getUserId();
        const { description, amount, category, type, date } = req.body;

        const expense = await prisma.expense.create({
            data: {
                description,
                amount: parseFloat(amount),
                category,
                type,
                date: date ? new Date(date) : new Date(),
                userId
            }
        });
        res.status(201).json(expense);
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ error: 'Failed to create expense' });
    }
});

// DELETE /api/finance/:id
router.delete('/:id', async (req, res) => {
    try {
        const userId = await getUserId();
        const { id } = req.params;

        // Verify ownership
        const existing = await prisma.expense.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        await prisma.expense.delete({
            where: { id }
        });

        res.status(204).end();
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ error: 'Failed to delete expense' });
    }
});

export default router;
