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
   GET ALL HABITS
================================ */

router.get('/', async (req, res) => {
  try {
    const userId = await getUserId();

    const habits = await prisma.habit.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    const today = new Date().toDateString();

    const updatedHabits = await Promise.all(
      habits.map(async (habit) => {
        const lastCompleted = habit.lastCompletedDate
          ? new Date(habit.lastCompletedDate).toDateString()
          : null;

        if (habit.completed && lastCompleted !== today) {
          const daysDifference = habit.lastCompletedDate
            ? Math.floor(
              (new Date().getTime() -
                new Date(habit.lastCompletedDate).getTime()) /
              (1000 * 3600 * 24)
            )
            : 0;

          let newCurrentStreak = habit.currentStreak;
          if (daysDifference > 1) {
            newCurrentStreak = 0;
          }

          return await prisma.habit.update({
            where: { id: habit.id },
            data: {
              completed: false,
              currentStreak: newCurrentStreak
            }
          });
        }

        return habit;
      })
    );

    res.json(updatedHabits);
  } catch (error) {
    console.error('GET HABITS ERROR:', error);
    res.status(500).json({ error: 'Failed to fetch habits' });
  }
});

/* ================================
   CREATE HABIT
================================ */

router.post('/', async (req, res) => {
  try {
    const userId = await getUserId();
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Habit name required" });
    }

    const habit = await prisma.habit.create({
      data: {
        name,
        currentStreak: 0,
        longestStreak: 0,
        completed: false,
        userId
      }
    });

    res.status(201).json(habit);
  } catch (error) {
    console.error('CREATE HABIT ERROR:', error);
    res.status(500).json({ error: 'Failed to create habit' });
  }
});

/* ================================
   TOGGLE HABIT
================================ */

router.put('/:id/toggle', async (req, res) => {
  try {
    const userId = await getUserId();
    const { id } = req.params;

    const habit = await prisma.habit.findUnique({ where: { id } });

    if (!habit || habit.userId !== userId) {
      return res.status(404).json({ error: "Habit not found" });
    }

    const today = new Date().toDateString();
    const lastCompleted = habit.lastCompletedDate
      ? new Date(habit.lastCompletedDate).toDateString()
      : null;

    let newCurrentStreak = habit.currentStreak;
    let newLongestStreak = habit.longestStreak;
    const newCompleted = !habit.completed;

    if (newCompleted) {
      if (lastCompleted !== today) {
        newCurrentStreak = habit.currentStreak + 1;
      }
      newLongestStreak = Math.max(newLongestStreak, newCurrentStreak);
    } else {
      if (lastCompleted === today) {
        newCurrentStreak = Math.max(0, habit.currentStreak - 1);
      }
    }

    const updated = await prisma.habit.update({
      where: { id },
      data: {
        completed: newCompleted,
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastCompletedDate: newCompleted ? new Date() : null
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('TOGGLE ERROR:', error);
    res.status(500).json({ error: "Failed to toggle habit" });
  }
});

/* ================================
   DELETE HABIT
================================ */

router.delete('/:id', async (req, res) => {
  try {
    const userId = await getUserId();
    const { id } = req.params;

    const habit = await prisma.habit.findUnique({ where: { id } });

    if (!habit || habit.userId !== userId) {
      return res.status(404).json({ error: "Habit not found" });
    }

    await prisma.habit.delete({ where: { id } });

    res.json({ message: "Habit deleted successfully" });
  } catch (error) {
    console.error('DELETE ERROR:', error);
    res.status(500).json({ error: "Failed to delete habit" });
  }
});

export default router;
