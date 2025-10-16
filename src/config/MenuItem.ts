import {
  BookOpenCheck,
  Building,
  Building2,
  ChartNoAxesGantt,
  CheckCheck,
  CloudMoon,
  Map,
  MapPinHouse,
  MapPinned,
  ReceiptText,
  Settings,
  Ship,
  User,
  Users,
  Workflow,
  Weight,
  Pickaxe,
  Container,
  PencilRuler,
  RulerDimensionLine,
  FilePlus,
  Axe,
  BriefcaseBusiness,
  FileText,
  CircleDollarSign,
  Ship as ShipIcon,
  type LucideIcon,
  Sailboat,
} from "lucide-react";

export interface MenuItem {
  title: string;
  href: string;
  icon: LucideIcon; 
  permission?: string;
  items?: never;
}

export interface MenuGroup {
  title: string;
  icon: LucideIcon; 
  permission?: string | null;
  items: MenuItem[];
}

export const menuItems: MenuGroup[] = [
  {
    title: "management:management",
    icon: Settings,
    permission: null,
    items: [
      {
        title: "management:companies",
        href: "/management/companies",
        icon: Building,
        permission: "admin.company.index"
      },
      {
        title: "management:subsidiaries",
        href: "/management/subsidiaries",
        icon: Building2,
        permission: "admin.subsidiary.index"
      },
      {
        title: "management:inspection_sites",
        href: "/management/inspection-sites",
        icon: MapPinHouse,
        permission: "admin.inspection_site.index"
      },
      {
        title: "management:business_units",
        href: "/management/business-units",
        icon: BriefcaseBusiness,
        permission: "admin.business-unit.index"
      },
      {
        title: "management:users",
        href: "/management/users",
        icon: User,
        permission: "user.index"
      }
    ]
  },
  {
    title: "records:records",
    icon: FileText,
    permission: null,
    items: [
      {
        title: "clients:clients",
        href: "/records/clients",
        icon: Users,
        permission: "inspection.client.index"
      },
      {
        title: "records:exporters",
        href: "/records/exporters",
        icon: Ship,
        permission: "inspection.exporter.index"
      },
      {
        title: "records:service_types",
        href: "/records/service_types",
        icon: Workflow,
        permission: "inspection.service-type.index"
      },
      {
        title: "records:services",
        href: "/records/services",
        icon: Axe,
        permission: "inspection.service.index"
      },
      {
        title: "records:products",
        href: "/records/products",
        icon: ChartNoAxesGantt,
        permission: "inspection.product.index"
      },
      {
        title: "records:climates",
        href: "/records/weather",
        icon: CloudMoon,
        permission: "inspection.weather.index"
      },
      {
        title: "records:regions",
        href: "/records/regions",
        icon: Map,
        permission: "admin.region.index"
      },
      {
        title: "records:cities",
        href: "/records/cities",
        icon: MapPinned,
        permission: "admin.city.index"
      },
      {
        title: "records:inspection_sites",
        href: "/records/inspection-sites",
        icon: MapPinHouse,
        permission: "inspection.inspection-site.index"
      },
      {
        title: "records:inspection_locations",
        href: "/records/sites",
        icon: MapPinHouse,
        permission: "inspection.site.index"
      },
      {
        title: "records:traders",
        href: "/records/traders",
        icon: Building2,
        permission: "inspection.trader.index"
      },
      {
        title: "records:shippers",
        href: "/records/shippers",
        icon: ShipIcon,
        permission: "inspection.shipper.index"
      },
      {
        title: "records:vessel_types",
        href: "/records/vessel-types",
        icon: Sailboat,
        permission: "inspection.vessel-type.index"
      },      
      {
        title: "records:weight_types",
        href: "/records/weight-types",
        icon: Weight,
        permission: "inspection.weight-type.index"
      },
      {
        title: "records:weighing_rules",
        href: "/records/weighing-rules",
        icon: PencilRuler,
        permission: "inspection.weighing-rule.index"
      },
      {
        title: "records:operation_types",
        href: "/records/operation-types",
        icon: Pickaxe,
        permission: "inspection.operation-type.index"
      },
      {
        title: "records:packing_types",
        href: "/records/packing-types",
        icon: Container,
        permission: "inspection.packing-type.index"
      },
      {
        title: "records:sampling_types",
        href: "/records/sampling-types",
        icon: ChartNoAxesGantt,
        permission: "inspection.sampling-type.index"
      },
      {
        title: "records:measures",
        href: "/records/measures",
        icon: RulerDimensionLine,
        permission: "admin.measure.index"
      },
      {
        title: "records:cargo_types",
        href: "/records/cargo-types",
        icon: Container,
        permission: "inspection.cargo.index"
      },
      {
        title: "records:document_types",
        href: "/records/document-types",
        icon: FileText,
        permission: "admin.document-type.index"
      },
      {
        title: "records:currencies",
        href: "/records/currencies",
        icon: CircleDollarSign,
        permission: "admin.currency.index"
      }
    ]
  },
  {
    title: "service_orders:service_orders",
    icon: BookOpenCheck,
    permission: null,
    items: [
      {
        title: "records:new_service_order",
        href: "/service-orders/new",
        icon: FilePlus,
        permission: "inspection.service-order.store"
      },
      {
        title: "records:list_orders",
        href: "/service-orders/list",
        icon: BookOpenCheck,
        permission: "inspection.service-order.index"
      },
      {
        title: "records:reports",
        href: "/service-orders/reports",
        icon: ReceiptText,
        permission: "inspection.service-order.index" 
      },
      {
        title: "service_order_status:list",
        href: "/service-orders/status",
        icon: CheckCheck,
        permission: "inspection.service-order-status.index"
      },
      {
        title: "records:parameters",
        href: "/service-orders/parameters",
        icon: Settings,
        permission: "inspection.service-order.index" 
      }
    ]
  }
];

// Tipo auxiliar para verificação
export type MenuItemType = MenuGroup | MenuItem;
export function isMenuGroup(item: MenuItemType): item is MenuGroup {
  return (item as MenuGroup).items !== undefined;
}