// This file exports TypeScript types and interfaces used throughout the application.

export interface MenuItem {
  title: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  href?: string;
  permission?: string;
}

export interface MenuGroup {
  title: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  items: MenuItem[];
}

export interface ServiceTypeField {
  name: string;
  label: string;
  input_type?: string; // Can be 'string', 'number', 'boolean', etc.
  options?: string[]; // Optional array of options for select inputs
}

export interface ServiceType {
  id: string;
  name: string;
  fields: ServiceTypeField[];
}