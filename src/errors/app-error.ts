import type { FieldIssue } from '../types/api-error.js';

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly code: string = 'INTERNAL_SERVER_ERROR',
    public readonly details?: FieldIssue[]
  ) {
    super(message);
    this.name = 'AppError';

    // Mantiene el prototipo correcto al extender la clase Error en TypeScript
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
