import api from './api';
import { isAxiosError } from 'axios';
import type { ApiPaginatedResponse, ApiError } from '../models/apiTypes';

export type RequestParams = Record<string, unknown> | undefined;

export class BaseService {
  protected readonly basePath: string;
  protected readonly retries: number;
  protected readonly retryDelayMs: number;

  constructor(basePath: string, opts?: { retries?: number; retryDelayMs?: number }) {
    this.basePath = basePath;
    this.retries = opts?.retries ?? 0;
    this.retryDelayMs = opts?.retryDelayMs ?? 300;
  }

  protected async request<T>(fn: () => Promise<{ data: T }>, attempt = 0): Promise<T> {
    try {
      const res = await fn();
      return res.data as T;
    } catch (err: unknown) {
      // safe guards for axios error shape
      let status: number | undefined = undefined;
      let message = 'Unknown error';
      let details: unknown = undefined;

      if (isAxiosError(err)) {
        status = err.response?.status;
        const data = err.response?.data as Record<string, unknown> | undefined;
        message = (data && typeof data.message === 'string') ? (data.message as string) : err.message ?? message;
        details = data;
      } else if (err instanceof Error) {
        message = err.message;
      }

      const apiError: ApiError = { status, message, details };
      if (attempt < this.retries) {
        await new Promise((r) => setTimeout(r, this.retryDelayMs));
        return this.request(fn, attempt + 1);
      }
      throw apiError;
    }
  }

  async list<T>(params?: RequestParams): Promise<ApiPaginatedResponse<T>> {
    return this.request<ApiPaginatedResponse<T>>(() => api.get(this.basePath, { params }));
  }

  async get<T>(id: string | number): Promise<T | null> {
    try {
      return await this.request<T>(() => api.get(`${this.basePath}/${id}`));
    } catch (e) {
      // if 404, return null
      if ((e as ApiError)?.status === 404) return null;
      throw e;
    }
  }

  async create<T>(payload: unknown): Promise<T> {
    return this.request<T>(() => api.post(this.basePath, payload));
  }

  async update<T>(id: string | number, payload: unknown): Promise<T> {
    return this.request<T>(() => api.put(`${this.basePath}/${id}`, payload));
  }

  async remove(id: string | number): Promise<void> {
    await this.request(() => api.delete(`${this.basePath}/${id}`));
  }
}

export default BaseService;
