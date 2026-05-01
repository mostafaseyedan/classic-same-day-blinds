/// <reference types="vite/client" />
import { defineRouteConfig } from "@medusajs/admin-sdk";
import {
  ArrowPath,
  ChartBar,
  ChatBubbleLeftRight,
  ReceiptPercent,
  ShoppingCart,
} from "@medusajs/icons";
import { Button, Container, Heading, StatusBadge, Text } from "@medusajs/ui";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

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

const TIMEFRAME_OPTIONS: Array<{ value: TimeframeKey; label: string }> = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "12m", label: "Last 12 months" },
];

function formatCurrency(value: number, currencyCode = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function maxValue(values: number[]) {
  return Math.max(1, ...values);
}

function formatCompetitor(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function requestStatusColor(status: string): "green" | "orange" | "red" | "grey" {
  if (status === "completed") return "green";
  if (status === "received" || status === "reviewed" || status === "approved") return "orange";
  if (status === "failed" || status === "canceled") return "red";
  return "grey";
}

function InsightStat({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="min-w-0">
      <Text size="small" className="text-ui-fg-subtle">{label}</Text>
      <div className="mt-1 text-2xl font-semibold tracking-normal text-ui-fg-base tabular-nums">{value}</div>
      <Text size="small" className="mt-1 truncate text-ui-fg-muted">{helper}</Text>
    </div>
  );
}

function TimeframeSelect({
  value,
  onChange,
}: {
  value: TimeframeKey;
  onChange: (value: TimeframeKey) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as TimeframeKey)}
      className="h-8 rounded-md border border-ui-border-base bg-ui-bg-base px-2 text-sm text-ui-fg-base"
    >
      {TIMEFRAME_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
}

function CommercePulseCard({
  data,
  currencyCode,
  timeframe,
  onTimeframeChange,
}: {
  data: BusinessDashboardResponse;
  currencyCode: string;
  timeframe: TimeframeKey;
  onTimeframeChange: (value: TimeframeKey) => void;
}) {
  return (
    <Container className="p-5">
      <div className="flex items-center justify-between gap-3">
        <Heading level="h2">Commerce Pulse</Heading>
        <TimeframeSelect value={timeframe} onChange={onTimeframeChange} />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-5">
        <InsightStat
          label="Revenue"
          value={formatCurrency(data.commercePulse.revenue, currencyCode)}
          helper={data.timeframes.commerce.label}
        />
        <InsightStat
          label="Orders"
          value={formatNumber(data.commercePulse.orders)}
          helper={data.timeframes.commerce.label}
        />
      </div>
    </Container>
  );
}

function TopPricingGapsCard({
  gaps,
  currencyCode,
}: {
  gaps: BusinessDashboardResponse["topPricingGaps"];
  currencyCode: string;
}) {
  return (
    <Container className="p-5 xl:col-span-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ReceiptPercent className="text-ui-fg-muted" />
            <Heading level="h2">Top Competitor Pricing Gaps</Heading>
          </div>
          <Text size="small" className="mt-1 text-ui-fg-subtle">Largest price differences across competitors, above or below.</Text>
        </div>
        <StatusBadge color={gaps.length > 0 ? "orange" : "green"}>{gaps.length}</StatusBadge>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b border-ui-border-base text-left text-ui-fg-subtle">
              <th className="py-2 pr-4 font-medium">Product</th>
              <th className="py-2 pr-4 font-medium">Competitor</th>
              <th className="py-2 pr-4 font-medium">Size</th>
              <th className="py-2 pr-4 text-right font-medium">Gap</th>
            </tr>
          </thead>
          <tbody>
            {gaps.length > 0 ? gaps.map((gap) => {
              const isAboveCompetitor = gap.priceDelta > 0;
              const gapClass = isAboveCompetitor ? "text-ui-tag-orange-text" : "text-ui-tag-green-text";
              const gapLabel = isAboveCompetitor ? "above" : "below";

              return (
                <tr key={gap.id} className="border-b border-ui-border-base last:border-0">
                  <td className="py-3 pr-4 text-ui-fg-base">
                    <div className="max-w-[240px] truncate">{gap.internalProductName}</div>
                    <div className="text-xs text-ui-fg-muted">
                      Store {formatCurrency(gap.internalPrice, currencyCode)} / Their {formatCurrency(gap.competitorPrice, currencyCode)}
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-ui-fg-subtle">
                    <div className="max-w-[180px] truncate">{formatCompetitor(gap.competitor)}</div>
                    <div className="max-w-[180px] truncate text-xs text-ui-fg-muted">{gap.competitorProductName}</div>
                  </td>
                  <td className="py-3 pr-4 text-ui-fg-subtle">{gap.sizeLabel}</td>
                  <td className={`py-3 pr-4 text-right font-medium tabular-nums ${gapClass}`}>
                    {isAboveCompetitor ? "+" : "-"}{formatCurrency(Math.abs(gap.priceDelta), currencyCode)}
                    <div className="text-xs font-normal text-ui-fg-muted">{gapLabel} competitor</div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td className="py-4 text-ui-fg-subtle" colSpan={4}>
                  <div className="flex items-center gap-2">
                    <ChartBar className="text-ui-fg-muted" />
                    <span>No competitor gaps right now.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Container>
  );
}

function LatestRequestsCard({
  requests,
}: {
  requests: BusinessDashboardResponse["latestRequests"];
}) {
  return (
    <Container className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ChatBubbleLeftRight className="text-ui-fg-muted" />
          <Heading level="h2">Latest Quotes & Requests</Heading>
        </div>
        <StatusBadge color="grey">{requests.length}</StatusBadge>
      </div>
      <div className="mt-5 grid gap-3">
        {requests.length > 0 ? requests.map((request) => (
          <div key={request.id} className="border-b border-ui-border-base pb-3 last:border-0 last:pb-0">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <Text size="small" className="truncate text-ui-fg-base">
                  {request.customerName ?? request.email}
                </Text>
                <Text size="small" className="truncate text-ui-fg-muted">
                  {request.companyName ?? request.email}
                </Text>
              </div>
              <StatusBadge color={requestStatusColor(request.status)}>{request.status}</StatusBadge>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-xs text-ui-fg-muted">
              <span className="capitalize">{request.type} request</span>
              <span>{formatDate(request.submittedAt)}</span>
            </div>
          </div>
        )) : (
          <div className="flex items-center gap-2 text-ui-fg-subtle">
            <ChatBubbleLeftRight className="text-ui-fg-muted" />
            <Text size="small">No quote or invoice requests yet.</Text>
          </div>
        )}
      </div>
    </Container>
  );
}

function CustomerCatalogCard({
  data,
  timeframe,
  onTimeframeChange,
}: {
  data: BusinessDashboardResponse;
  timeframe: TimeframeKey;
  onTimeframeChange: (value: TimeframeKey) => void;
}) {
  return (
    <Container className="p-5">
      <div className="flex items-center justify-between gap-3">
        <Heading level="h2">Customers & Catalog</Heading>
        <TimeframeSelect value={timeframe} onChange={onTimeframeChange} />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-5">
        <InsightStat
          label="Customers"
          value={formatNumber(data.customerSummary.totalCustomers)}
          helper={`${formatNumber(data.customerSummary.newCustomers)} new, ${data.timeframes.customers.label.toLowerCase()}`}
        />
        <InsightStat
          label="Registered"
          value={formatNumber(data.customerSummary.registeredCustomers)}
          helper={`${formatNumber(data.customerSummary.guestCustomers)} guest records`}
        />
        <InsightStat
          label="Products"
          value={formatNumber(data.catalogSummary.activeProducts)}
          helper={`${formatNumber(data.catalogSummary.publishedProducts)} published products`}
        />
        <InsightStat
          label="Variants"
          value={formatNumber(data.catalogSummary.variants)}
          helper={`${formatNumber(data.catalogSummary.publishedProducts)} published products`}
        />
      </div>
    </Container>
  );
}

function MiniBarChart({
  title,
  rows,
  valueKey,
  formatter,
  caption,
  timeframe,
  onTimeframeChange,
}: {
  title: string;
  rows: Array<{ month: string } & Record<string, number | string>>;
  valueKey: string;
  formatter: (value: number) => string;
  caption: string;
  timeframe: TimeframeKey;
  onTimeframeChange: (value: TimeframeKey) => void;
}) {
  const max = maxValue(rows.map((row) => Number(row[valueKey] ?? 0)));

  return (
    <Container className="p-5">
      <div className="flex items-center justify-between gap-3">
        <Heading level="h2">{title}</Heading>
        <div className="flex items-center gap-2">
          <Text size="small" className="text-ui-fg-subtle">{caption}</Text>
          <TimeframeSelect value={timeframe} onChange={onTimeframeChange} />
        </div>
      </div>
      <div className="mt-5 flex h-44 items-end gap-2">
        {rows.map((row) => {
          const value = Number(row[valueKey] ?? 0);
          const height = Math.max(4, Math.round((value / max) * 100));
          return (
            <div key={row.month} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="flex h-32 w-full items-end">
                <div
                  title={`${row.month}: ${formatter(value)}`}
                  className="w-full rounded-t-sm bg-ui-tag-blue-icon transition-colors hover:bg-ui-fg-interactive"
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="w-full truncate text-center text-[10px] text-ui-fg-muted">{row.month}</span>
            </div>
          );
        })}
      </div>
    </Container>
  );
}

function RankedList({
  title,
  rows,
  labelKey,
  valueKey,
  formatter,
}: {
  title: string;
  rows: Array<Record<string, string | number>>;
  labelKey: string;
  valueKey: string;
  formatter: (value: number) => string;
}) {
  const max = maxValue(rows.map((row) => Number(row[valueKey] ?? 0)));

  return (
    <Container className="p-5">
      <Heading level="h2">{title}</Heading>
      <div className="mt-5 grid gap-3">
        {rows.length > 0 ? rows.map((row) => {
          const value = Number(row[valueKey] ?? 0);
          return (
            <div key={`${row[labelKey]}`} className="grid gap-1">
              <div className="flex items-center justify-between gap-3">
                <Text size="small" className="truncate text-ui-fg-base">{String(row[labelKey])}</Text>
                <Text size="small" className="shrink-0 text-ui-fg-subtle tabular-nums">{formatter(value)}</Text>
              </div>
              <div className="h-1.5 overflow-hidden rounded-sm bg-ui-bg-component">
                <div className="h-full bg-ui-tag-blue-icon" style={{ width: `${Math.round((value / max) * 100)}%` }} />
              </div>
            </div>
          );
        }) : (
          <Text size="small" className="text-ui-fg-subtle">No data yet.</Text>
        )}
      </div>
    </Container>
  );
}

function SkeletonBlock({ className, style }: { className: string; style?: CSSProperties }) {
  return <div className={`animate-pulse rounded bg-ui-bg-component ${className}`} style={style} />;
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 xl:grid-cols-3">
        <Container className="p-5 xl:col-span-2">
          <SkeletonBlock className="h-5 w-56" />
          <SkeletonBlock className="mt-2 h-3 w-80" />
          <div className="mt-5 grid gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="grid grid-cols-[1.4fr_1fr_0.8fr_0.6fr] gap-4 border-b border-ui-border-base pb-3 last:border-0">
                <SkeletonBlock className="h-8 w-full" />
                <SkeletonBlock className="h-8 w-full" />
                <SkeletonBlock className="h-8 w-full" />
                <SkeletonBlock className="h-8 w-full" />
              </div>
            ))}
          </div>
        </Container>
        <div className="grid gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <Container key={index} className="p-5">
              <SkeletonBlock className="h-5 w-36" />
              <div className="mt-5 grid grid-cols-2 gap-5">
                <SkeletonBlock className="h-14 w-full" />
                <SkeletonBlock className="h-14 w-full" />
              </div>
            </Container>
          ))}
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Container key={index} className="p-5">
            <div className="flex items-center justify-between gap-3">
              <SkeletonBlock className="h-5 w-36" />
              <SkeletonBlock className="h-4 w-16" />
            </div>
            <div className="mt-5 flex h-44 items-end gap-2">
              {Array.from({ length: 12 }).map((__, barIndex) => (
                <SkeletonBlock
                  key={barIndex}
                  className="w-full"
                  style={{ height: `${24 + (barIndex % 5) * 14}%` }}
                />
              ))}
            </div>
          </Container>
        ))}
      </div>
    </div>
  );
}

function statusColor(status: string): "green" | "orange" | "red" | "grey" {
  if (status === "completed" || status === "captured") return "green";
  if (status === "pending" || status === "requires_action") return "orange";
  if (status === "canceled" || status === "failed") return "red";
  return "grey";
}

export default function BusinessDashboardPage() {
  const [data, setData] = useState<BusinessDashboardResponse | null>(null);
  const [commerceTimeframe, setCommerceTimeframe] = useState<TimeframeKey>("30d");
  const [customerTimeframe, setCustomerTimeframe] = useState<TimeframeKey>("30d");
  const [revenueTimeframe, setRevenueTimeframe] = useState<TimeframeKey>("12m");
  const [unitsTimeframe, setUnitsTimeframe] = useState<TimeframeKey>("12m");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        commerceTimeframe,
        customerTimeframe,
        revenueTimeframe,
        unitsTimeframe,
      });
      const res = await fetch(`/admin/business-dashboard?${params.toString()}`);
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `Dashboard request failed: ${res.status}`);
      }
      setData((await res.json()) as BusinessDashboardResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, [commerceTimeframe, customerTimeframe, revenueTimeframe, unitsTimeframe]);

  const currencyCode = data?.currencyCode ?? "usd";
  const generatedAt = useMemo(() => data ? formatDate(data.generatedAt) : "", [data]);

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <Heading level="h1">Dashboard</Heading>
          {data ? <Text size="small" className="mt-1 text-ui-fg-subtle">Updated {generatedAt}</Text> : null}
        </div>
        <Button
          onClick={() => void loadDashboard()}
          disabled={loading}
          size="small"
          variant="secondary"
        >
          <ArrowPath className={loading ? "animate-spin" : ""} />
          {loading ? "Refreshing" : "Refresh"}
        </Button>
      </div>

      {error ? (
        <Container className="p-5">
          <StatusBadge color="red">Error</StatusBadge>
          <Text className="mt-3 text-ui-fg-subtle">{error}</Text>
        </Container>
      ) : null}

      {loading && !data ? (
        <DashboardSkeleton />
      ) : null}

      {data ? (
        <div className="grid gap-6">
          <div className="grid gap-6 xl:grid-cols-3">
            <TopPricingGapsCard gaps={data.topPricingGaps} currencyCode={currencyCode} />
            <div className="grid gap-6">
              <LatestRequestsCard requests={data.latestRequests} />
              <CustomerCatalogCard
                data={data}
                timeframe={customerTimeframe}
                onTimeframeChange={setCustomerTimeframe}
              />
              <CommercePulseCard
                data={data}
                currencyCode={currencyCode}
                timeframe={commerceTimeframe}
                onTimeframeChange={setCommerceTimeframe}
              />
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <MiniBarChart
              title="Monthly Revenue"
              rows={data.monthlyRevenue}
              valueKey="revenue"
              formatter={(value) => formatCurrency(value, currencyCode)}
              caption={data.timeframes.revenue.label}
              timeframe={revenueTimeframe}
              onTimeframeChange={setRevenueTimeframe}
            />
            <MiniBarChart
              title="Monthly Units Sold"
              rows={data.monthlyUnitsSold}
              valueKey="units"
              formatter={formatNumber}
              caption={data.timeframes.units.label}
              timeframe={unitsTimeframe}
              onTimeframeChange={setUnitsTimeframe}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <RankedList
              title="Category Sales"
              rows={data.categorySales}
              labelKey="category"
              valueKey="revenue"
              formatter={(value) => formatCurrency(value, currencyCode)}
            />
            <RankedList
              title="Revenue by Product"
              rows={data.topProducts}
              labelKey="product"
              valueKey="revenue"
              formatter={(value) => formatCurrency(value, currencyCode)}
            />
            <RankedList
              title="Customer Geography"
              rows={data.customerGeography}
              labelKey="region"
              valueKey="orders"
              formatter={(value) => `${formatNumber(value)} orders`}
            />
          </div>

          <div className="grid gap-6">
            <Container className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="text-ui-fg-muted" />
                  <Heading level="h2">Recent Orders</Heading>
                </div>
                <StatusBadge color="grey">{data.recentOrders.length}</StatusBadge>
              </div>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-ui-border-base text-left text-ui-fg-subtle">
                      <th className="py-2 pr-4 font-medium">Order</th>
                      <th className="py-2 pr-4 font-medium">Customer</th>
                      <th className="py-2 pr-4 font-medium">Status</th>
                      <th className="py-2 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.length > 0 ? data.recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-ui-border-base last:border-0">
                        <td className="py-3 pr-4 text-ui-fg-base">
                          {order.displayId ? `#${order.displayId}` : order.id.slice(0, 10)}
                          <div className="text-xs text-ui-fg-muted">{formatDate(order.createdAt)}</div>
                        </td>
                        <td className="py-3 pr-4 text-ui-fg-subtle">{order.email}</td>
                        <td className="py-3 pr-4"><StatusBadge color={statusColor(order.status)}>{order.status}</StatusBadge></td>
                        <td className="py-3 text-right tabular-nums text-ui-fg-base">
                          {formatCurrency(order.total, order.currencyCode)}
                        </td>
                      </tr>
                    )) : (
                      <tr><td className="py-4 text-ui-fg-subtle" colSpan={4}>No orders yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Container>

          </div>
        </div>
      ) : null}
    </div>
  );
}

export const config = defineRouteConfig({
  label: "Dashboard",
  icon: ChartBar,
  rank: 10,
});
