import dotenv from 'dotenv';

dotenv.config();

export interface EnvConfig {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  pgHost: string;
  pgPort: number;
  pgUser: string;
  pgPassword: string;
  pgDatabase: string;
}

const getNumber = (value: string | undefined, fallback: number): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

export const env: EnvConfig = {
  port: getNumber(process.env.PORT, 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  pgHost: process.env.PG_HOST || 'localhost',
  pgPort: getNumber(process.env.PG_PORT, 5432),
  pgUser: process.env.PG_USER || 'scmtp_user',
  pgPassword: process.env.PG_PASSWORD || 'scmtp_pass',
  pgDatabase: process.env.PG_DATABASE || 'scmtp_user_service'
};


