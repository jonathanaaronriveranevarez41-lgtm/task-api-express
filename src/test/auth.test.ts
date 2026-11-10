import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import mongoose from 'mongoose';

describe('Auth & API Integration Tests', () => {
  let accessToken = '';
  const testUser = {
    name: 'Usuario Test',
    email: `test_${Date.now()}@example.com`,
    password: 'PasswordSeguro123!'
  };

  beforeAll(async () => {
    // Conexión opcional o reutilización si se maneja en base de datos de pruebas
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI ?? 'mongodb://localhost:27017/task-api-test');
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('GET /api-docs.json debería devolver el documento OpenAPI', async () => {
    const response = await request(app).get('/api-docs.json');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('openapi', '3.1.0');
    expect(response.body).toHaveProperty('info');
  });

  it('POST /api/auth/register debería registrar un nuevo usuario', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data.user).toHaveProperty('email', testUser.email);
  });

  it('POST /api/auth/login debería iniciar sesión y retornar un token', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('accessToken');
    accessToken = response.body.data.accessToken;
  });

  it('GET /api/auth/me debería retornar la identidad del usuario autenticado', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.user).toHaveProperty('email', testUser.email);
  });
});
