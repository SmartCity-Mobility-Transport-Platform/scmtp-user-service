import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { runMigrations } from './db/pool';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';

async function bootstrap(): Promise<void> {
  await runMigrations();

  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'scmtp-user-service' });
  });

  app.use('/auth', authRoutes);
  app.use('/users', userRoutes);

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


