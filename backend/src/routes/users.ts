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
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (user && user.passwordHash === password) {
            // Simplified auth for MVP. In reality, use bcrypt and jwt.
            const { passwordHash, ...userWithoutPassword } = user;
            res.json(userWithoutPassword);
        } else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'An internal server error occurred during login' });
    }
});

// Register a new user
router.post('/register', async (req, res) => {
    const { email, name, password, persona } = req.body;
    if (!email || !password || !name) {
        return res.status(400).json({ error: 'Email, name, and password are required' });
    }
    try {
        const user = await prisma.user.create({
            data: {
                email,
                name,
                passwordHash: password, // For MVP only
                persona: persona || "GENERAL"
            },
        });
        const { passwordHash, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
    } catch (error: any) {
        console.error('Registration error:', error);
        if (error.code === 'P2002') {
            res.status(409).json({ error: 'This email is already registered. Please try logging in.' });
        } else {
            res.status(500).json({ error: 'Failed to create account. Please try again later.' });
        }
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
