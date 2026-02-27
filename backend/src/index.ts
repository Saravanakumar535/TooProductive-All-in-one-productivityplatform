import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

// CORS — allow frontend origin in production, everything in dev
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(u => u.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // In development allow everything
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());

// Import routes
import userRoutes from './routes/users';
import taskRoutes from './routes/tasks';
import noteRoutes from './routes/notes';
import stockRoutes from './routes/stocks';
import financeRoutes from './routes/finance';
import studentRoutes from './routes/student';
import learningRoutes from './routes/learning';
import goalsRoutes from './routes/goals';
import kanbanRoutes from './routes/kanban';
import habitsRouter from './routes/habits';
import journalRoutes from './routes/journal';
import dashboardRoutes from './routes/dashboard';
import newsRoutes from './routes/news';

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/habits', habitsRouter);
app.use('/api/kanban', kanbanRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/news', newsRoutes);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root
app.get('/', (_req: Request, res: Response) => {
  res.send('Productivity Platform API is running');
});

// Always start the server (Render, Railway, etc. need this)
app.listen(port, () => {
  console.log(`[server]: Server is running on port ${port}`);
});

export default app;
