export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthCredentials {
  name?: string;
  email: string;
  password: string;
}

export type AuthMode = 'login' | 'register';
