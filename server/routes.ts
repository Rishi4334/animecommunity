import type { Express } from "express";
import { createServer, type Server } from "http";
import cors from 'cors';
import { connectDatabase } from './config/database';
import authRoutes from './routes/authRoutes';
import animeRoutes from './routes/animeRoutes';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure CORS for Vercel frontend
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    // Allow all origins in development
    app.use(cors({
      origin: true,
      credentials: true,
    }));
  } else {
    // Strict CORS in production
    const allowedOrigins = process.env.FRONTEND_URL 
      ? process.env.FRONTEND_URL.split(',')
      : [];
    
    app.use(cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    }));
  }

  // Connect to MongoDB
  await connectDatabase();

  // Register routes
  app.use('/api/auth', authRoutes);
  app.use('/api/anime', animeRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/admin', adminRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);

  return httpServer;
}
