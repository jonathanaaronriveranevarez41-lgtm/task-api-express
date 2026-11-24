import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

vi.mock('../services/database.service.js', () => ({
  checkDatabaseHealth: vi.fn()
}));

import { app } from '../app.js';
import { env } from '../config/env.js';
import { checkDatabaseHealth } from '../services/database.service.js';

const mockedCheckDatabaseHealth = vi.mocked(checkDatabaseHealth);

describe('health endpoints', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('reports the API version and environment in the expected envelope', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: {
        status: 'up',
        version: env.APP_VERSION,
        environment: env.NODE_ENV
      }
    });
  });

  it('reports database health as up or down with the matching HTTP status', async () => {
    mockedCheckDatabaseHealth.mockReturnValueOnce(true);
    const healthyResponse = await request(app).get('/health/database');

    expect(healthyResponse.status).toBe(200);
    expect(healthyResponse.body).toEqual({ data: { status: 'up' } });

    mockedCheckDatabaseHealth.mockReturnValueOnce(false);
    const unhealthyResponse = await request(app).get('/health/database');

    expect(unhealthyResponse.status).toBe(503);
    expect(unhealthyResponse.body).toEqual({ data: { status: 'down' } });
  });
});
