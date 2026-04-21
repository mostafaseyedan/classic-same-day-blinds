export type ProductFamilySlug =
  | "vinyl-blinds"
  | "vinyl-plus-blinds"
  | "aluminum-blinds"
  | "faux-wood-blinds"
  | "vertical-blinds"
  | "roller-shades";

export type MeasurementModel = "stock-size" | "custom-size";
export type FulfillmentMethod = "parcel" | "same-day-dfw" | "pickup" | "freight" | "quote-required";

export interface ProductOptionGroup {
  key: string;
  label: string;
  values: string[];
}

export interface FulfillmentProfile {
  method: FulfillmentMethod;
  leadTimeLabel: string;
  supportsSameDayDfw: boolean;
}

export interface CatalogProductFamily {
  slug: ProductFamilySlug;
  name: string;
  merchandisingLabel: string;
  measurementModel: MeasurementModel;
  optionGroups: ProductOptionGroup[];
  materials: string[];
  fulfillment: FulfillmentProfile;
}

export interface ProductSizeOption {
  width: number;
  height: number;
  price: number;
  sku?: string;
}

export interface CompetitorMatch {
  internalSku: string;
  competitor: "blinds.com" | "lowes" | "home-depot" | "amazon";
  competitorUrl: string;
  competitorName: string;
  lastSeenPrice?: number;
  matchConfidence?: number;
}
