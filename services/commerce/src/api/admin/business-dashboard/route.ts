import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Client } from "pg";

type MoneyRow = {
  period_revenue: string | number | null;
  period_orders: string | number | null;
};

type CountRow = {
  active_customers: string | number | null;
};

type CatalogSummaryRow = {
  product_types: string | number | null;
  active_products: string | number | null;
  published_products: string | number | null;
  variants: string | number | null;
};

type CompetitorPricingSummaryRow = {
  total_matches: string | number | null;
  active_alerts: string | number | null;
  critical_alerts: string | number | null;
};

type RequestSummaryRow = {
  open_requests: string | number | null;
  received_requests: string | number | null;
  quote_requests: string | number | null;
  invoice_requests: string | number | null;
};

type CustomerSummaryRow = {
  total_customers: string | number | null;
  registered_customers: string | number | null;
  guest_customers: string | number | null;
  new_customers: string | number | null;
};

type PricingGapRow = {
  id: string;
  internal_product_name: string;
  competitor: string;
  competitor_product_name: string;
  size_label: string;
  internal_price: string | number | null;
  competitor_price: string | number | null;
  price_delta: string | number | null;
  alert_severity: string | null;
};

type LatestRequestRow = {
  id: string;
  type: string;
  email: string;
  status: string;
  submitted_at: Date;
  customer_name: string | null;
  company_name: string | null;
  product_name: string | null;
};

type SeriesRow = {
  period: Date | string;
  value: string | number | null;
};

type NameValueRow = {
  name: string | null;
  value: string | number | null;
};

type RecentOrderRow = {
  id: string;
  display_id: number | null;
  email: string;
  status: string;
  total: string | number | null;
  currency_code: string;
  created_at: Date;
};

type BusinessDashboardResponse = {
  generatedAt: string;
  currencyCode: string;
  timeframes: {
    commerce: TimeframeResponse;
    customers: TimeframeResponse;
    revenue: TimeframeResponse;
    units: TimeframeResponse;
  };
  kpis: {
    activeCustomers: number;
  };
  commercePulse: {
    revenue: number;
    orders: number;
  };
  catalogSummary: {
    productTypes: number;
    activeProducts: number;
    publishedProducts: number;
    variants: number;
  };
  competitorPricingSummary: {
    totalMatches: number;
    activeAlerts: number;
    criticalAlerts: number;
  };
  requestSummary: {
    openRequests: number;
    receivedRequests: number;
    quoteRequests: number;
    invoiceRequests: number;
  };
  customerSummary: {
    totalCustomers: number;
    registeredCustomers: number;
    guestCustomers: number;
    newCustomers: number;
  };
  topPricingGaps: Array<{
    id: string;
    internalProductName: string;
    competitor: string;
    competitorProductName: string;
    sizeLabel: string;
    internalPrice: number;
    competitorPrice: number;
    priceDelta: number;
    alertSeverity?: string;
  }>;
  latestRequests: Array<{
    id: string;
    type: string;
    email: string;
    status: string;
    submittedAt: string;
    customerName?: string;
    companyName?: string;
    productName?: string;
  }>;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  monthlyUnitsSold: Array<{ month: string; units: number }>;
  categorySales: Array<{ category: string; revenue: number }>;
  topProducts: Array<{ product: string; revenue: number }>;
  customerGeography: Array<{ region: string; orders: number }>;
  recentOrders: Array<{
    id: string;
    displayId?: number;
    email: string;
    status: string;
    total: number;
    currencyCode: string;
    createdAt: string;
  }>;
};

type TimeframeKey = "7d" | "30d" | "90d" | "12m";
type TimeframeResponse = {
  key: TimeframeKey;
  label: string;
};

const TIMEFRAMES: Record<TimeframeKey, {
  label: string;
  bucket: "day" | "week" | "month";
  startOffset: string;
  step: string;
}> = {
  "7d": {
    label: "Last 7 days",
    bucket: "day",
    startOffset: "6 days",
    step: "1 day",
  },
  "30d": {
    label: "Last 30 days",
    bucket: "day",
    startOffset: "29 days",
    step: "1 day",
  },
  "90d": {
    label: "Last 90 days",
    bucket: "week",
    startOffset: "12 weeks",
    step: "1 week",
  },
  "12m": {
    label: "Last 12 months",
    bucket: "month",
    startOffset: "11 months",
    step: "1 month",
  },
};

function readTimeframe(value: unknown): TimeframeKey {
  if (typeof value === "string" && value in TIMEFRAMES) {
    return value as TimeframeKey;
  }
  return "12m";
}

function toNumber(value: string | number | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function periodLabel(value: Date | string, bucket: "day" | "week" | "month"): string {
  const date = value instanceof Date ? value : new Date(value);
  if (bucket === "month") {
    return new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit" }).format(date);
  }
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

function mapSeries(rows: SeriesRow[], key: "revenue" | "units", bucket: "day" | "week" | "month") {
  return rows.map((row) => ({
    month: periodLabel(row.period, bucket),
    [key]: toNumber(row.value),
  }));
}

export async function GET(req: MedusaRequest, res: MedusaResponse<BusinessDashboardResponse>) {
  const commerceTimeframeKey = readTimeframe(req.query.commerceTimeframe);
  const customerTimeframeKey = readTimeframe(req.query.customerTimeframe);
  const revenueTimeframeKey = readTimeframe(req.query.revenueTimeframe);
  const unitsTimeframeKey = readTimeframe(req.query.unitsTimeframe);
  const commerceTimeframe = TIMEFRAMES[commerceTimeframeKey];
  const customerTimeframe = TIMEFRAMES[customerTimeframeKey];
  const revenueTimeframe = TIMEFRAMES[revenueTimeframeKey];
  const unitsTimeframe = TIMEFRAMES[unitsTimeframeKey];
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    const [
      moneyResult,
      customerResult,
      catalogSummaryResult,
      competitorPricingSummaryResult,
      requestSummaryResult,
      customerSummaryResult,
      topPricingGapsResult,
      latestRequestsResult,
      monthlyRevenueResult,
      monthlyUnitsResult,
      categorySalesResult,
      topProductsResult,
      geographyResult,
      recentOrdersResult,
    ] = await Promise.all([
      client.query<MoneyRow>(
        `
          with params as (
            select date_trunc($1::text, now()) - $2::interval as start_at
          ),
          order_totals as (
            select
              o.id,
              o.created_at,
              coalesce(
                latest_summary.totals->>'current_order_total',
                latest_summary.totals->>'original_order_total',
                latest_summary.totals->>'paid_total',
                '0'
              )::numeric as total
            from "order" o
            left join lateral (
              select totals
              from order_summary
              where order_id = o.id
                and deleted_at is null
              order by version desc
              limit 1
            ) latest_summary on true
            where o.deleted_at is null
              and o.is_draft_order = false
              and o.canceled_at is null
              and o.created_at >= (select start_at from params)
          )
          select
            coalesce(sum(total), 0) as period_revenue,
            count(*) as period_orders
          from order_totals
        `,
        [commerceTimeframe.bucket, commerceTimeframe.startOffset],
      ),
      client.query<CountRow>(
        `
          select count(*) as active_customers
          from customer
          where deleted_at is null
            and has_account = true
        `,
      ),
      client.query<CatalogSummaryRow>(
        `
          select
            (select count(*) from product_type where deleted_at is null) as product_types,
            (select count(*) from product where deleted_at is null) as active_products,
            (select count(*) from product where deleted_at is null and status = 'published') as published_products,
            (select count(*) from product_variant where deleted_at is null) as variants
        `,
      ),
      client.query<CompetitorPricingSummaryRow>(
        `
          select
            count(*) as total_matches,
            count(*) filter (where alert_severity is not null) as active_alerts,
            count(*) filter (where alert_severity = 'critical') as critical_alerts
          from ops.competitor_matches
        `,
      ),
      client.query<RequestSummaryRow>(
        `
          select
            count(*) filter (where type in ('quote', 'invoice') and status <> 'completed') as open_requests,
            count(*) filter (where type in ('quote', 'invoice') and status = 'received') as received_requests,
            count(*) filter (where type = 'quote') as quote_requests,
            count(*) filter (where type = 'invoice') as invoice_requests
          from ops.customer_requests
        `,
      ),
      client.query<CustomerSummaryRow>(
        `
          select
            count(*) as total_customers,
            count(*) filter (where has_account = true) as registered_customers,
            count(*) filter (where has_account = false) as guest_customers,
            count(*) filter (where created_at >= date_trunc($1::text, now()) - $2::interval) as new_customers
          from customer
          where deleted_at is null
        `,
        [customerTimeframe.bucket, customerTimeframe.startOffset],
      ),
      client.query<PricingGapRow>(
        `
          select
            id,
            internal_product_name,
            competitor,
            competitor_product_name,
            size_label,
            internal_price,
            competitor_price,
            price_delta,
            alert_severity
          from ops.competitor_matches
          where price_delta <> 0
          order by abs(price_delta) desc
          limit 10
        `,
      ),
      client.query<LatestRequestRow>(
        `
          select
            id,
            type,
            email,
            status,
            submitted_at,
            customer_name,
            company_name,
            product_name
          from ops.customer_requests
          where type in ('quote', 'invoice')
          order by submitted_at desc
          limit 6
        `,
      ),
      client.query<SeriesRow>(
        `
          with params as (
            select date_trunc($1::text, now()) - $2::interval as start_at
          ),
          periods as (
            select generate_series(
              (select start_at from params),
              date_trunc($1::text, now()),
              $3::interval
            ) as period
          ),
          order_totals as (
            select
              date_trunc($1::text, o.created_at) as period,
              coalesce(
                latest_summary.totals->>'current_order_total',
                latest_summary.totals->>'original_order_total',
                latest_summary.totals->>'paid_total',
                '0'
              )::numeric as total
            from "order" o
            left join lateral (
              select totals
              from order_summary
              where order_id = o.id
                and deleted_at is null
              order by version desc
              limit 1
            ) latest_summary on true
            where o.deleted_at is null
              and o.is_draft_order = false
              and o.canceled_at is null
              and o.created_at >= (select start_at from params)
          )
          select periods.period, coalesce(sum(order_totals.total), 0) as value
          from periods
          left join order_totals on order_totals.period = periods.period
          group by periods.period
          order by periods.period
        `,
        [revenueTimeframe.bucket, revenueTimeframe.startOffset, revenueTimeframe.step],
      ),
      client.query<SeriesRow>(
        `
          with params as (
            select date_trunc($1::text, now()) - $2::interval as start_at
          ),
          periods as (
            select generate_series(
              (select start_at from params),
              date_trunc($1::text, now()),
              $3::interval
            ) as period
          ),
          units as (
            select date_trunc($1::text, o.created_at) as period,
                   oi.quantity::numeric as units
            from "order" o
            join order_item oi
              on oi.order_id = o.id
             and oi.deleted_at is null
            where o.deleted_at is null
              and o.is_draft_order = false
              and o.canceled_at is null
              and o.created_at >= (select start_at from params)
          )
          select periods.period, coalesce(sum(units.units), 0) as value
          from periods
          left join units on units.period = periods.period
          group by periods.period
          order by periods.period
        `,
        [unitsTimeframe.bucket, unitsTimeframe.startOffset, unitsTimeframe.step],
      ),
      client.query<NameValueRow>(
        `
          select
            coalesce(pc.name, 'Uncategorized') as name,
            coalesce(sum(oi.quantity * oi.unit_price), 0) as value
          from "order" o
          join order_item oi on oi.order_id = o.id and oi.deleted_at is null
          join order_line_item oli on oli.id = oi.item_id and oli.deleted_at is null
          left join product_category_product pcp on pcp.product_id = oli.product_id
          left join product_category pc on pc.id = pcp.product_category_id and pc.deleted_at is null
          where o.deleted_at is null
            and o.is_draft_order = false
            and o.canceled_at is null
            and o.created_at >= now() - interval '90 days'
          group by coalesce(pc.name, 'Uncategorized')
          order by value desc
          limit 8
        `,
      ),
      client.query<NameValueRow>(
        `
          select
            coalesce(oli.product_title, oli.title, 'Unknown product') as name,
            coalesce(sum(oi.quantity * oi.unit_price), 0) as value
          from "order" o
          join order_item oi on oi.order_id = o.id and oi.deleted_at is null
          join order_line_item oli on oli.id = oi.item_id and oli.deleted_at is null
          where o.deleted_at is null
            and o.is_draft_order = false
            and o.canceled_at is null
            and o.created_at >= now() - interval '90 days'
          group by coalesce(oli.product_title, oli.title, 'Unknown product')
          order by value desc
          limit 8
        `,
      ),
      client.query<NameValueRow>(
        `
          select
            coalesce(nullif(trim(oa.province), ''), nullif(trim(oa.country_code), ''), 'Unknown') as name,
            count(*) as value
          from "order" o
          left join order_address oa
            on oa.id = o.shipping_address_id
           and oa.deleted_at is null
          where o.deleted_at is null
            and o.is_draft_order = false
            and o.canceled_at is null
            and o.created_at >= now() - interval '180 days'
          group by coalesce(nullif(trim(oa.province), ''), nullif(trim(oa.country_code), ''), 'Unknown')
          order by value desc
          limit 8
        `,
      ),
      client.query<RecentOrderRow>(
        `
          select
            o.id,
            o.display_id,
            o.email,
            o.status::text as status,
            o.currency_code,
            coalesce(
              latest_summary.totals->>'current_order_total',
              latest_summary.totals->>'original_order_total',
              latest_summary.totals->>'paid_total',
              '0'
            )::numeric as total,
            o.created_at
          from "order" o
          left join lateral (
            select totals
            from order_summary
            where order_id = o.id
              and deleted_at is null
            order by version desc
            limit 1
          ) latest_summary on true
          where o.deleted_at is null
            and o.is_draft_order = false
          order by o.created_at desc
          limit 8
        `,
      ),
    ]);

    const money = moneyResult.rows[0];
    const catalogSummary = catalogSummaryResult.rows[0];
    const competitorPricingSummary = competitorPricingSummaryResult.rows[0];
    const requestSummary = requestSummaryResult.rows[0];
    const customerSummary = customerSummaryResult.rows[0];
    const currencyCode = recentOrdersResult.rows[0]?.currency_code ?? "usd";

    return res.json({
      generatedAt: new Date().toISOString(),
      currencyCode,
      timeframes: {
        commerce: {
          key: commerceTimeframeKey,
          label: commerceTimeframe.label,
        },
        customers: {
          key: customerTimeframeKey,
          label: customerTimeframe.label,
        },
        revenue: {
          key: revenueTimeframeKey,
          label: revenueTimeframe.label,
        },
        units: {
          key: unitsTimeframeKey,
          label: unitsTimeframe.label,
        },
      },
      kpis: {
        activeCustomers: toNumber(customerResult.rows[0]?.active_customers),
      },
      commercePulse: {
        revenue: toNumber(money?.period_revenue),
        orders: toNumber(money?.period_orders),
      },
      catalogSummary: {
        productTypes: toNumber(catalogSummary?.product_types),
        activeProducts: toNumber(catalogSummary?.active_products),
        publishedProducts: toNumber(catalogSummary?.published_products),
        variants: toNumber(catalogSummary?.variants),
      },
      competitorPricingSummary: {
        totalMatches: toNumber(competitorPricingSummary?.total_matches),
        activeAlerts: toNumber(competitorPricingSummary?.active_alerts),
        criticalAlerts: toNumber(competitorPricingSummary?.critical_alerts),
      },
      requestSummary: {
        openRequests: toNumber(requestSummary?.open_requests),
        receivedRequests: toNumber(requestSummary?.received_requests),
        quoteRequests: toNumber(requestSummary?.quote_requests),
        invoiceRequests: toNumber(requestSummary?.invoice_requests),
      },
      customerSummary: {
        totalCustomers: toNumber(customerSummary?.total_customers),
        registeredCustomers: toNumber(customerSummary?.registered_customers),
        guestCustomers: toNumber(customerSummary?.guest_customers),
        newCustomers: toNumber(customerSummary?.new_customers),
      },
      topPricingGaps: topPricingGapsResult.rows.map((row) => ({
        id: row.id,
        internalProductName: row.internal_product_name,
        competitor: row.competitor,
        competitorProductName: row.competitor_product_name,
        sizeLabel: row.size_label,
        internalPrice: toNumber(row.internal_price),
        competitorPrice: toNumber(row.competitor_price),
        priceDelta: toNumber(row.price_delta),
        alertSeverity: row.alert_severity ?? undefined,
      })),
      latestRequests: latestRequestsResult.rows.map((row) => ({
        id: row.id,
        type: row.type,
        email: row.email,
        status: row.status,
        submittedAt: row.submitted_at.toISOString(),
        customerName: row.customer_name ?? undefined,
        companyName: row.company_name ?? undefined,
        productName: row.product_name ?? undefined,
      })),
      monthlyRevenue: mapSeries(monthlyRevenueResult.rows, "revenue", revenueTimeframe.bucket) as BusinessDashboardResponse["monthlyRevenue"],
      monthlyUnitsSold: mapSeries(monthlyUnitsResult.rows, "units", unitsTimeframe.bucket) as BusinessDashboardResponse["monthlyUnitsSold"],
      categorySales: categorySalesResult.rows.map((row) => ({
        category: row.name ?? "Uncategorized",
        revenue: toNumber(row.value),
      })),
      topProducts: topProductsResult.rows.map((row) => ({
        product: row.name ?? "Unknown product",
        revenue: toNumber(row.value),
      })),
      customerGeography: geographyResult.rows.map((row) => ({
        region: row.name ?? "Unknown",
        orders: toNumber(row.value),
      })),
      recentOrders: recentOrdersResult.rows.map((row) => ({
        id: row.id,
        displayId: row.display_id ?? undefined,
        email: row.email,
        status: row.status,
        total: toNumber(row.total),
        currencyCode: row.currency_code,
        createdAt: row.created_at.toISOString(),
      })),
    });
  } finally {
    await client.end();
  }
}
