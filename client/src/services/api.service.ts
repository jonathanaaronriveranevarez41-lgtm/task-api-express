import type { AuthCredentials, User } from '../models/auth.interface';
import type { Task, TaskStatus } from '../models/task.interface';
import type { TaskSort } from '../models/task-view.types';

const configuredApiUrl =
  import.meta.env.VITE_API_URL?.trim() || 'http://localhost:3000';
const parsedApiUrl = new URL(configuredApiUrl);

if (
  (parsedApiUrl.protocol !== 'http:' && parsedApiUrl.protocol !== 'https:') ||
  parsedApiUrl.username ||
  parsedApiUrl.password
) {
  throw new Error('VITE_API_URL debe ser una URL HTTP(S) sin credenciales.');
}

const API_BASE_URL = configuredApiUrl.replace(/\/+$/, '');

export class ApiRequestError extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

interface ApiErrorEnvelope {
  error?: {
    message?: unknown;
  };
}

interface UserEnvelope {
  data: {
    user: User;
  };
}

interface LoginEnvelope {
  data: {
    user: User;
    accessToken: string;
    tokenType: 'Bearer';
    expiresIn: string;
  };
}

export interface TaskListResult {
  data: Task[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface TaskListQuery {
  page: number;
  limit: number;
  status?: TaskStatus;
  search?: string;
  sortBy: TaskSort;
}

interface ApiTaskListQuery {
  page: number;
  limit: number;
  status?: TaskStatus;
  search?: string;
  sortBy: 'createdAt' | 'updatedAt' | 'title';
  order: 'asc' | 'desc';
}

async function requestApi<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    token?: string;
    body?: unknown;
  } = {},
): Promise<T> {
  const headers = new Headers({ Accept: 'application/json' });
  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }
  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body:
        options.body === undefined
          ? undefined
          : JSON.stringify(options.body),
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        'No se pudo conectar con la API. Comprueba que esté activa y que CORS_ORIGIN coincida con el dominio del frontend.',
      );
    }
    throw error;
  }

  let payload: unknown;
  if (response.status !== 204) {
    const text = await response.text();
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        throw new Error(
          `La API devolvió una respuesta no válida (HTTP ${response.status}).`,
        );
      }
    }
  }

  if (!response.ok) {
    const errorPayload = payload as ApiErrorEnvelope | undefined;
    const message =
      typeof errorPayload?.error?.message === 'string'
        ? errorPayload.error.message
        : `La API respondió con HTTP ${response.status}.`;
    throw new ApiRequestError(message, response.status);
  }

  return payload as T;
}

export async function registerAccount(
  credentials: AuthCredentials,
): Promise<void> {
  await requestApi<UserEnvelope>('/api/auth/register', {
    method: 'POST',
    body: credentials,
  });
}

export function loginAccount(
  credentials: AuthCredentials,
): Promise<LoginEnvelope> {
  return requestApi<LoginEnvelope>('/api/auth/login', {
    method: 'POST',
    body: {
      email: credentials.email,
      password: credentials.password,
    },
  });
}

export function getCurrentUser(token: string): Promise<UserEnvelope> {
  return requestApi<UserEnvelope>('/api/auth/me', { token });
}

export function getTasks(
  token: string,
  query: TaskListQuery,
): Promise<TaskListResult> {
  const sortBy =
    query.sortBy === 'created-desc'
      ? 'createdAt'
      : query.sortBy === 'title-asc'
        ? 'title'
        : 'updatedAt';
  const order = query.sortBy === 'title-asc' ? 'asc' : 'desc';
  const apiQuery: ApiTaskListQuery = {
    page: query.page,
    limit: query.limit,
    sortBy,
    order,
    ...(query.status ? { status: query.status } : {}),
    ...(query.search ? { search: query.search } : {}),
  };

  return requestApi<TaskListResult>(
    `/api/tasks?${new URLSearchParams(
      Object.entries(apiQuery).map(([key, value]) => [key, String(value)]),
    )}`,
    { token },
  );
}

export function createTask(
  token: string,
  title: string,
): Promise<{ data: Task }> {
  return requestApi('/api/tasks', {
    method: 'POST',
    token,
    body: { title },
  });
}

export function updateTask(
  token: string,
  id: string,
  changes: { title?: string; status?: TaskStatus },
): Promise<{ data: Task }> {
  return requestApi(`/api/tasks/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    token,
    body: changes,
  });
}

export function completeTask(
  token: string,
  id: string,
): Promise<{ data: Task }> {
  return requestApi(`/api/tasks/${encodeURIComponent(id)}/complete`, {
    method: 'PATCH',
    token,
  });
}

export function deleteTask(token: string, id: string): Promise<void> {
  return requestApi(`/api/tasks/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    token,
  });
}
