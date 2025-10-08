export interface ApiPaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: unknown[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface CrudService<T, CreateDto = Partial<T>, UpdateDto = Partial<T>> {
  list<P extends Record<string, unknown> = Record<string, unknown>>(params?: P): Promise<ApiPaginatedResponse<T>>;
  get(id: string | number): Promise<T | null>;
  create(payload: CreateDto): Promise<T>;
  update(id: string | number, payload: UpdateDto): Promise<T>;
  remove(id: string | number): Promise<void | unknown>;
}

// Generic list params with an extensible Filters generic
export type ListParams<Filters extends Record<string, unknown> = Record<string, string | undefined>> = {
  page?: number;
  per_page?: number;
  limit?: number;
  search?: string;
  filters?: Filters;
  sort?: string | null;
  direction?: 'asc' | 'desc' | null;
};

export interface ApiError {
  status?: number;
  message: string;
  details?: unknown;
}
