import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import testRoutes from './routes/test';
import workerRoutes from './routes/workers';
import geospatialRoutes from './routes/geospatial';
import jobRoutes from './routes/jobs';
import paymentRoutes from './routes/payments';
import reviewRoutes from './routes/reviews';
import fileRoutes from './routes/files';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

// API root endpoint
app.get('/api', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      message: 'SAHAKAR // SERVICES Backend API',
      version: '1.0.0',
      documentation: '/api/docs',
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/admin/workers', workerRoutes);
app.use('/api/geospatial', geospatialRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/files', fileRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
