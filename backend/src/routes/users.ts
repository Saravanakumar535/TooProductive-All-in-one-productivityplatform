import { Router } from 'express';
import { prisma } from '../index';

const router = Router();

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Login a user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (user && user.passwordHash === password) {
            // Simplified auth for MVP. In reality, use bcrypt and jwt.
            res.json(user);
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// Register a new user
router.post('/register', async (req, res) => {
    const { email, name, password, persona } = req.body;
    try {
        const user = await prisma.user.create({
            data: {
                email,
                name,
                passwordHash: password, // For MVP only
                persona: persona || "GENERAL"
            },
        });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user. Email might be in use.' });
    }
});

// Get user profile (with persona/stats)
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: { id },
        });
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

export default router;
