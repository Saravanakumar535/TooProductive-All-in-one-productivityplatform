import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
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

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Productivity Platform API is running');
});

// Start server only in local development
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
}

export default app;
