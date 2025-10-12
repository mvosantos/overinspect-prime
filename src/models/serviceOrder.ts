import type { BusinessUnit } from "./businessUnit";
import type { CargoType } from "./CargoType";
import type { City } from "./City";
import type { Client } from "./Client";
import type { Currency } from "./Currency";
import type { Exporter } from "./Exporter";
import type { Measure } from "./Measure";
import type { OperationType } from "./OperationType";
import type { PackingType } from "./PackingType";
import type { Product } from "./Product";
import type { Region } from "./Region";
import type { SamplingType } from "./SamplingType";
import type { Service } from "./service";
import type { Shipper } from "./Shipper";
import type { Site } from "./Site";
import type { Subsidiary } from "./subsidiary";
import type { Trader } from "./Trader";
import type { User, UserUpdate } from "./User";
import type { WeighingRule } from "./WeighingRule";
import type { WeightType } from "./WeightType";

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


export interface ServiceOrderService {
  readonly id: string;
  service_id?: string;
  service?: Service;
  unit_price?: string;
  quantity?: string;
  total_price?: string;
  scope?: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;  
}

export interface PaymentsOrderService {
  readonly id: string;
  description?: string;
  document_type_id?: string;
  document_type?: DocumentType;
  document_number?: string;
  unit_price?: string;
  quantity?: string;
  total_price?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface SchedulesOrderService {
  readonly id: string;
  user_id: string;
  user?: UserUpdate;
  date: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface AttachmentsOrderService {
  readonly id: string;
  type_id?: string;
  name?: string;
  filename?: string;
  path: string;
  fileObject?: File;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface StatusHistoryOrderService {
  readonly id: string;
  created_at: Date;
  comment?: string;
  old_status?: ServiceOrderStatus;
  new_status: ServiceOrderStatus;
  user: User;
}

export type ServiceOrder = {
  readonly id: string;
  user_id: string;
  user?: User;
  company_id: string;
  client_id?: string;
  client?: Client;
  subsidiary_id?: string;
  subsidiary?: Subsidiary;
  business_unit_id?: string;
  business_unit?: BusinessUnit;
  service_type_id?: string;
  service_type?: ServiceType;
  product_id?: string;
  product?: Product;
  exporter_id?: string;
  exporter?: Exporter;
  service_order_status_id?: string;
  service_order_status?: ServiceOrderStatus;
  service_order_status_comment: string;
  first_site_id?: string;
  first_site?: Site;
  second_site_id?: string;
  second_site?: Site;
  third_site_id?: string;
  third_site?: Site;
  cargo_id?: string;
  cargo?: CargoType;
  currency_id?: string;
  currency?: Currency;
  region_id?: string;
  region?: Region;
  city_id?: string;
  city?: City;
  metric_unit_id?: string;
  metric_unit?: Measure;
  operation_type_id?: string;
  operation_type?: OperationType;
  packing_type_id?: string;
  packing_type?: PackingType;
  trader_id?: string;
  trader?: Trader;
  shipper_id?: string;
  shipper?: Shipper;
  stuffing_site_id?: string;
  stuffing_site?: Site;
  departure_site_id?: string;
  departure_site?: Site;
  weight_type_id?: string;
  weight_type?: WeightType;
  sampling_type_id?: string;
  sampling_type?: SamplingType;
  weighing_rule_id?: string;
  weighing_rule?: WeighingRule;
  invoice_metric_unit_id?: string;
  invoice_metric_unit?: Measure;
  landing_metric_unit_id?: string;
  landing_metric_unit?: Measure;
  max_weight_allowed_unit_id?: string;
  max_weight_allowed_unit?: Measure;
  max_weight_allowed_type_id?: string;
  max_weight_allowed_type?: Measure;
  number: string;
  vessel_name?: string;
  ref_number?: string;
  order_identifier?: string;
  inspection_type?: string;
  operation_starts_at?: string; // formato ISO: YYYY-MM-DD
  operation_finishes_at?: string;
  report_sent_at?: string;
  invoice_sent_at?: string;
  invoice_payed_at?: string;
  comments?: string;
  container_number?: string;
  invoice_number?: string;
  invoice_value?: number;
  client_ref_number?: string;
  bl_date?: string;
  cargo_arrival_date?: string;
  booking_number?: string;
  contract_number?: string;
  harvest?: string;
  num_containers?: number;
  num_shipments?: number;
  qtd_products?: number;
  destination?: string;
  gross_volume_invoice?: number;
  net_volume_invoice?: number;
  tare_volume_invoice?: number;
  gross_volume_landed?: number;
  net_volume_landed?: number;
  tare_volume_landed?: number;
  limit_type?: string;
  gain_loss_tolerance?: number;
  client_invoice_number?: string;
  nomination_date?: string;
  operation_finish_date?: string;
  max_weight_allowed?: number;
  loss_gain_weight_difference?: number;
  services?: ServiceOrderService[];
  payments?: PaymentsOrderService[];
  schedules?: SchedulesOrderService[];
  attachments?: AttachmentsOrderService[];
  service_order_status_history?: StatusHistoryOrderService[];
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
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

// Submission payload shape used by create/update flows. Use Partial entries for nested arrays
// Note: submission shape for create/update is constructed in the form module to
// closely match the runtime form shape. If you need a shared alias, reintroduce
// it here but ensure it's imported/used to avoid noUnusedLocals errors.

// Small, explicit DTOs for create/update payloads. Keep them compact to avoid
// deep type instantiation when used as form generics.
export type FormServiceItemSubmission = {
  service_id?: string | null;
  unit_price?: string;
  quantity?: string;
  total_price?: string;
  scope?: string;
};

export type FormPaymentItemSubmission = {
  id?: string;
  description?: string;
  document_type_id?: string | null;
  document_number?: string;
  unit_price?: string;
  quantity?: string;
  total_price?: string;
};

export type FormScheduleItemSubmission = {
  id?: string;
  user_id?: string | null;
  date?: string | Date | null;
};

export type ServiceOrderSubmission = Record<string, unknown> & {
  services?: FormServiceItemSubmission[];
  payments?: FormPaymentItemSubmission[];
  schedules?: FormScheduleItemSubmission[];
  attachments?: AttachmentsOrderService[];
  service_order_status_history?: StatusHistoryOrderService[];
};
