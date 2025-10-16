export interface AttachmentType {
  id: string;
  company_id?: string | null;
  name: string;
  translations?: unknown | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  custom?: boolean;
  system_area_id?: string | null;
}

export type AttachmentTypeListResponse = {
  current_page: number;
  data: AttachmentType[];
  [key: string]: unknown;
};
