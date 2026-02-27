import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// Get all notes for a user
router.get('/', async (req, res) => {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: 'Valid userId query parameter is required' });
    }

    try {
        const notes = await prisma.note.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
        });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

// Create a new note
router.post('/', async (req, res) => {
    const { title, content, userId } = req.body;

    if (!title || !content || !userId) {
        return res.status(400).json({ error: 'Title, content, and userId are required' });
    }

    try {
        const note = await prisma.note.create({
            data: {
                title,
                content,
                userId,
            },
        });
        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create note' });
    }
});

// Update a note
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    try {
        const note = await prisma.note.update({
            where: { id },
            data: { title, content },
        });
        res.json(note);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update note' });
    }
});

// Delete a note
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.note.delete({
            where: { id },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

export default router;
