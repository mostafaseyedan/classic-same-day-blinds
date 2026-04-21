export type ProductReferenceCategory =
  | "mini-blinds"
  | "aluminum-blinds"
  | "wood-blinds"
  | "vertical-blinds";

export interface ProductReferenceAttributeSet {
  category: ProductReferenceCategory;
  displayLabel: string;
  merchandisingBadges: string[];
  commonColors: string[];
  materials: string[];
  controlOptions: string[];
  sizeNotes: string[];
}

export interface LegacyContentBlock {
  key: string;
  title: string;
  summary: string;
  bullets: string[];
}

export interface MerchandisingIdea {
  key: string;
  audience: string;
  headline: string;
  emphasis: string;
}

export interface OrderSchemaField {
  key: string;
  label: string;
  required: boolean;
  notes?: string;
}

export interface SampleOrderSchemaReference {
  statuses: string[];
  orderFields: OrderSchemaField[];
  itemFields: OrderSchemaField[];
}

export interface VisualizerProductReference {
  key: string;
  label: string;
  category: ProductReferenceCategory;
  defaultColors: string[];
  previewMode: "horizontal" | "vertical";
  notes: string;
}
