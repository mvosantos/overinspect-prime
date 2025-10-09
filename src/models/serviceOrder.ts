export type ServiceOrderStatus = {
  id: string;
  name: string;
  color?: string | null;
  enable_editing?: boolean;
  enable_attach?: boolean;
};

export type ServiceType = {
  id: string;
  name: string;
};

export type Attachment = {
  id: string;
  file: string;
  filename: string;
  content_type?: string | null;
};

export type ServiceOrder = {
  id: string;
  number?: string | null;
  ref_number?: string | null;
  created_at?: string | null;
  service_order_status?: ServiceOrderStatus | null;
  service_type?: ServiceType | null;
  attachments?: Attachment[];
  [key: string]: unknown;
};

export type ListParams = {
  page?: number;
  limit?: number;
  search?: string;
  filters?: Record<string, unknown>;
  sort?: string | null;
  direction?: 'asc' | 'desc' | null;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
};
