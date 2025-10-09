import { fetchServiceTypes } from './api';

export interface ServiceTypeField {
  name: string;
  label: string;
  input_type?: string; // Optional input type
  options?: string[]; // Optional options for the field
}

export interface ServiceType {
  id: string;
  name: string;
  fields: ServiceTypeField[];
}

export async function getServiceTypes(): Promise<ServiceType[]> {
  const response = await fetchServiceTypes();
  return response.map((type: any) => ({
    id: type.id,
    name: type.name,
    fields: type.fields.map((field: any) => ({
      name: field.name,
      label: field.label,
      input_type: field.input_type || 'string', // Default to 'string' if not provided
      options: field.options || [],
    })),
  }));
}