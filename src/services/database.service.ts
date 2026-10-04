import mongoose from 'mongoose';
import { loadEnvironment } from '../config/env.js';
import { AppError } from '../errors/app-error.js';

const env = loadEnvironment();

export interface DatabaseHealth {
  status: 'connected';
}

const databaseUnavailable = (): AppError => {
  return new AppError(
    'La base de datos no está disponible.',
    503,
    'DATABASE_UNAVAILABLE'
  );
};

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.mongodbUri, {
      dbName: env.mongodbDbName
    });
    console.log('Conexión con MongoDB establecida.');
  } catch (error) {
    console.error('Error al conectar con MongoDB:', error);
    process.exit(1);
  }
};

export const checkDatabaseHealth = async (): Promise<DatabaseHealth> => {
  const database = mongoose.connection.db;

  if (mongoose.connection.readyState !== 1 || !database) {
    throw databaseUnavailable();
  }

  try {
    await database.admin().ping();
    return { status: 'connected' };
  } catch {
    throw databaseUnavailable();
  }
};
