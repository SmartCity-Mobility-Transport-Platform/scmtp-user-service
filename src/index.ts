import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { runMigrations } from './db/pool';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import { initKafkaProducer, disconnectKafkaProducer } from './kafka/producer';

async function bootstrap(): Promise<void> {
  await runMigrations();

  // Initialize Kafka producer (non-blocking)
  await initKafkaProducer().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Failed to initialize Kafka producer:', err);
  });

  const app = express();

  // CORS configuration - allow frontend origins
  app.use(cors({
    origin: ['http://localhost:3001', 'http://localhost:3002', 'http://127.0.0.1:3001', 'http://127.0.0.1:3002'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'scmtp-user-service' });
  });

  app.use('/auth', authRoutes);
  app.use('/users', userRoutes);

  // Graceful shutdown
  const gracefulShutdown = async (signal: string): Promise<void> => {
    // eslint-disable-next-line no-console
    console.log(`${signal} received, shutting down gracefully...`);
    await disconnectKafkaProducer();
    process.exit(0);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`scmtp-user-service listening on port ${env.port}`);
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start scmtp-user-service', err);
  process.exit(1);
});


