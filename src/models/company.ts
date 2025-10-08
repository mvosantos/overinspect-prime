export interface Company {
  id: string;
  name: string;
  doc_number?: string | null; // CPF/CNPJ
  address?: string | null;
  url_address?: string | null;
  created_at?: string;
  updated_at?: string;
}

// named export only (type-only)
