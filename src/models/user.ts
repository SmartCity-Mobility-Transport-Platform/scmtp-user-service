export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  userId: string;
  name: string | null;
  phone: string | null;
  preferences: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}


