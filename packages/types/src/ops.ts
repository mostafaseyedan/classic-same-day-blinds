export type OpsQueueName =
  | "quote-review"
  | "inventory-watch"
  | "sample-fulfillment"
  | "business-development"
  | "membership-review"
  | "competitor-refresh"
  | "notifications";

export type OpsWorkstream =
  | "competitor-pricing"
  | "quotes"
  | "reviews"
  | "crm"
  | "inventory-alerts"
  | "samples"
  | "conferences"
  | "memberships";

export type CompetitorSource =
  | "blinds-com"
  | "lowes"
  | "select-blinds"
  | "blinds-to-go"
  | "home-depot"
  | "budget-blinds"
  | "hd-supply";

export type CompetitorMatchStatus = "matched" | "needs-review" | "ignored";
export type CompetitorAlertSeverity = "critical" | "warning";
export type CompetitorRefreshStatus = "healthy" | "degraded" | "failed";

export interface QuoteRequest {
  customerName: string;
  email: string;
  companyName?: string;
  purchaseOrderNumber?: string;
  notes?: string;
}

export interface InvoiceRequest {
  customerName: string;
  email: string;
  companyName?: string;
  purchaseOrderNumber?: string;
  orderId?: string;
  cartId?: string;
  notes?: string;
}

export interface RestockAlertRequest {
  customerName?: string;
  email: string;
  productId: string;
  productName: string;
}

export interface SampleRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  productType: string;
  preferredColor: string;
  notes?: string;
}

export interface ConferenceInterestRequest {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  conference: string;
  message?: string;
}

export interface MembershipInquiryRequest {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  tier: string;
  message?: string;
}

export interface IntakeAcceptedResponse<TPayload> {
  accepted: true;
  queue: OpsQueueName;
  referenceId: string;
  receivedAt: string;
  payload: TPayload;
}

export interface HealthCheckResponse {
  service: string;
  status: "ok";
  timestamp: string;
}

export interface CompetitorPricePoint {
  label: string;
  internalPrice: number;
  competitorPrice: number;
  currencyCode: string;
}

export interface CompetitorProductMatch {
  id: string;
  internalSku: string;
  internalProductName: string;
  internalCategory: string;
  competitor: CompetitorSource;
  competitorProductName: string;
  competitorUrl: string;
  matchStatus: CompetitorMatchStatus;
  confidence: number;
  sizeLabel: string;
  currentPrice: CompetitorPricePoint;
  priceDelta: number;
  lastCheckedAt: string;
  lastSuccessAt: string;
  scrapeStatus: CompetitorRefreshStatus;
  alertSeverity?: CompetitorAlertSeverity;
  notes?: string;
  medusaProductId?: string;
  storefrontSlug?: string;
}

export interface CompetitorPricingAlert {
  id: string;
  matchId: string;
  severity: CompetitorAlertSeverity;
  internalSku: string;
  internalProductName: string;
  competitor: CompetitorSource;
  competitorProductName: string;
  competitorUrl: string;
  message: string;
  sizeLabel: string;
  priceDelta: number;
  lastCheckedAt: string;
  storefrontSlug?: string;
}

export interface CompetitorRefreshRun {
  id: string;
  startedAt: string;
  completedAt: string;
  status: CompetitorRefreshStatus;
  matchesChecked: number;
  alertsRaised: number;
  failures: number;
  notes: string[];
}

export interface CompetitorPricingSummary {
  totalMatches: number;
  activeAlerts: number;
  criticalAlerts: number;
  averageConfidence: number;
  lastRefreshAt: string;
  staleMatches: number;
}

export interface CompetitorPricingDashboardResponse {
  workstream: "competitor-pricing";
  summary: CompetitorPricingSummary;
  refresh: CompetitorRefreshRun;
  alerts: CompetitorPricingAlert[];
  matches: CompetitorProductMatch[];
}

export interface CustomerOpsRequestRecord {
  id: string;
  type: "quote" | "invoice";
  email: string;
  status: string;
  submittedAt: string;
  customerName?: string;
  companyName?: string;
  purchaseOrderNumber?: string;
  cartId?: string;
  orderId?: string;
  notes?: string;
}

export type CustomerOpsRequestStatus =
  | "received"
  | "reviewed"
  | "approved"
  | "completed";

export type NotificationKind =
  | "quote-received-customer"
  | "quote-received-admin"
  | "invoice-received-customer"
  | "invoice-received-admin"
  | "order-confirmation-customer"
  | "order-confirmation-admin"
  | "restock-alert-admin"
  | "account-deletion-admin";

export type NotificationStatus = "pending" | "sent" | "failed";

export interface NotificationRecord {
  id: string;
  kind: NotificationKind;
  toEmail: string;
  subject: string;
  html: string;
  status: NotificationStatus;
  createdAt: string;
  processedAt?: string;
  failureReason?: string;
}

export interface PlatformCapabilities {
  stripeConfigured: boolean;
  resendConfigured: boolean;
  savedPaymentMethodsEnabled: boolean;
  emailNotificationsEnabled: boolean;
}

export interface CustomerPaymentMethodSummary {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  funding?: string | null;
  isDefault: boolean;
}

export interface CustomerPaymentMethodsResponse {
  enabled: boolean;
  customerEmail?: string;
  stripeCustomerId?: string;
  paymentMethods: CustomerPaymentMethodSummary[];
}

export interface CustomerPaymentSetupIntentResponse {
  enabled: boolean;
  customerEmail?: string;
  stripeCustomerId?: string;
  clientSecret?: string;
}
