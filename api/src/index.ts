import express, { Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth-routes';

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ CORS Configuration
app.use(cors({
  origin: ['https://educaplatform-web.vercel.app', 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
