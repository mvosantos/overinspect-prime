// Mapping from service_type_id to operation section info
export type OperationSectionConfig = {
  key: string; // unique key for section
  label: string;
  component?: string; // optional component name (informational)
  apiBase: string; // base endpoint for the section (relative to API)
};

const OPERATION_SECTIONS: Record<string, OperationSectionConfig> = {
  // Goods Survey
  '0197d1dd-4afe-7ed7-b883-4f04c97f6ded': {
    key: 'goods',
    label: 'Goods',
    component: 'GoodsSection',
    apiBase: '/operation/good',
  },
  // Tallies
  'abb07b90-6cb4-46fc-b5d3-f049b42f78f7': {
    key: 'tallies',
    label: 'Tallies',
    component: 'TalliesSection',
    apiBase: '/operation/tally',
  },
};

export default OPERATION_SECTIONS;
