import { Router } from 'express';
import { prisma } from '../index';

const router = Router();

/* =========================
   GET TASKS
========================= */
router.get('/', async (req, res) => {
  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Valid userId query parameter is required' });
  }

  try {
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const formattedTasks = tasks.map(task => ({
      ...task,
      priority: task.priority.toLowerCase()
    }));

    res.json(formattedTasks);
  } catch (error) {
    console.error("GET TASK ERROR:", error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

/* =========================
   CREATE TASK
========================= */
router.post('/', async (req, res) => {
  const { title, description, priority, category, dueDate, userId, email, name } = req.body;

  if (!title || !userId) {
    return res.status(400).json({ error: 'Title and userId are required' });
  }

  try {
    // 🔥 Ensure user exists
    let user = await prisma.user.findUnique({
      where: { id: userId }
    });

    // If user does not exist → create automatically
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          email: email || `${userId}@temp.com`,
          name: name || "Temporary User"
        }
      });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || '',
        priority: priority ? priority.toUpperCase() : 'MEDIUM',
        category: category || 'General',
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: user.id
      }
    });

    res.status(201).json(task);

  } catch (error) {
    console.error("CREATE TASK ERROR:", error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

/* =========================
   UPDATE TASK
========================= */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, completed, priority, category, dueDate } = req.body;

  try {
    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && title !== null && { title }),
        ...(description !== undefined && { description }),
        ...(completed !== undefined && completed !== null && { completed }),
        ...(priority !== undefined && priority !== null && { priority: priority.toUpperCase() }),
        ...(category !== undefined && category !== null && { category }),
        ...(dueDate !== undefined && {
          dueDate: dueDate ? new Date(dueDate) : null
        }),
      },
    });

    res.json(task);

  } catch (error) {
    console.error("UPDATE TASK ERROR:", error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

/* =========================
   DELETE TASK
========================= */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.task.delete({
      where: { id },
    });

    res.status(204).send();

  } catch (error) {
    console.error("DELETE TASK ERROR:", error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;