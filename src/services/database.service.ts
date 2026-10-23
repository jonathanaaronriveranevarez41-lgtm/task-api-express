import { env } from '../config/env.js';
import mongoose from 'mongoose';

interface ConnectOptions {
  uri?: string;
  dbName?: string;
}

export const connectDatabase = async (options?: ConnectOptions): Promise<void> => {
  try {
    const mongoUri = options?.uri ?? env.MONGODB_URI;
    const databaseName = options?.dbName ?? env.MONGODB_DB_NAME;

    await mongoose.connect(mongoUri, {
      dbName: databaseName,
    });

    console.log(`Conectado exitosamente a MongoDB Atlas (${databaseName})`);
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('Desconexión de MongoDB exitosa.');
  } catch (error) {
    console.error('Error al desconectar de la base de datos:', error);
    throw error;
  }
};

export const checkDatabaseHealth = (): boolean => {
  // readyState === 1 significa que está conectado a la base de datos
  return mongoose.connection.readyState === 1;
};
