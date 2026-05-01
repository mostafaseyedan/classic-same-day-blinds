/// <reference types="vite/client" />
import { defineRouteConfig } from "@medusajs/admin-sdk";
import {
  Adjustments,
  ArchiveBox,
  ArrowPath,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CurrencyDollar,
} from "@medusajs/icons";
import { Button, Container, Heading, StatusBadge, Text } from "@medusajs/ui";
import { useEffect, useRef, useState } from "react";

import type {
  CompetitorPricingDashboardResponse,
  CompetitorProductMatch,
} from "@blinds/types";

const OPS_API_URL = import.meta.env.VITE_OPS_API_URL ?? "http://localhost:4000";
const STOREFRONT_URL = import.meta.env.VITE_STOREFRONT_URL ?? "http://localhost:3000";

// Maps the UI tab display name (lowercased) to the CompetitorSource value stored in the DB.
// Tabs without an entry here have no scraper configured yet → show "Coming soon".
const TAB_COMPETITOR_SOURCE: Record<string, string> = {
  "blinds.com":  "blinds-com",
  "lowe's":      "lowes",
  "selectblinds": "select-blinds",
  "hd supply":   "hd-supply",
};

function formatCompetitorName(source: string): string {
  return source
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(".");
}

function formatCurrency(value: number, currencyCode: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(value);
}

function PriceGapCell({ delta, competitorPrice }: { delta: number; competitorPrice: number }) {
  const formattedAmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.abs(delta));

  const pct = competitorPrice !== 0 ? Math.round(Math.abs(delta) / competitorPrice * 100) : 0;
  const sign = delta > 0 ? "+" : delta < 0 ? "-" : "";

  // delta > 0 → our price > competitor → we're more expensive → red
  // delta < 0 → our price < competitor → we're cheaper → green
  const color =
    delta > 0 ? "text-ui-tag-red-text" : delta < 0 ? "text-ui-tag-green-text" : "text-ui-fg-muted";

  return (
    <span className={`font-medium tabular-nums ${color}`}>
      {sign}{formattedAmt}{" "}
      <span className="text-xs opacity-75">({pct}%)</span>
    </span>
  );
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));
}


function EditableCell({
  value,
  currency,
  onSave,
}: {
  value: number | null;
  currency: string;
  onSave: (v: number) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  function start() {
    setDraft(value != null ? String(value) : "");
    setEditing(true);
  }

  async function commit() {
    const parsed = parseFloat(draft);
    if (!isNaN(parsed) && parsed >= 0) {
      setSaving(true);
      try { await onSave(parsed); } finally { setSaving(false); }
    }
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        autoFocus
        type="text"
        inputMode="decimal"
        value={draft}
        size={Math.max(4, draft.length + 1)}
        onChange={(e) => {
          // Allow only digits and a single decimal point
          const v = e.target.value;
          if (/^\d*\.?\d*$/.test(v)) setDraft(v);
        }}
        onBlur={() => void commit()}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); void commit(); }
          if (e.key === "Escape") setEditing(false);
        }}
        className="text-sm border border-ui-border-base rounded px-1.5 py-0.5 bg-ui-bg-base text-ui-fg-base tabular-nums"
      />
    );
  }

  return (
    <button
      onClick={start}
      disabled={saving}
      title="Click to edit"
      className="tabular-nums text-sm text-ui-fg-base hover:underline disabled:opacity-40 text-left"
    >
      {saving ? "…" : value != null ? formatCurrency(value, currency) : <span className="text-ui-fg-muted italic text-xs">—</span>}
    </button>
  );
}

function statusColor(status: string): "green" | "orange" | "red" | "grey" {
  if (status === "healthy") return "green";
  if (status === "degraded") return "orange";
  if (status === "failed") return "red";
  return "grey";
}


type SortKey = "product" | "size" | "storePrice" | "theirPrice" | "gap" | "checked";

interface ColumnVisibility {
  size: boolean;
  sourcePrice: boolean;
  margin: boolean;
  checked: boolean;
}

const DEFAULT_COLUMN_VISIBILITY: ColumnVisibility = {
  size: true,
  sourcePrice: true,
  margin: true,
  checked: true,
};

function SortTh({
  label,
  sortKey,
  active,
  dir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  active: boolean;
  dir: "asc" | "desc";
  onSort: (key: SortKey) => void;
}) {
  return (
    <th
      className="text-left py-2 px-4 text-ui-fg-subtle font-medium cursor-pointer select-none hover:text-ui-fg-base whitespace-nowrap"
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className="text-[10px] opacity-50">
          {active ? (dir === "asc" ? "▲" : "▼") : "⇅"}
        </span>
      </span>
    </th>
  );
}

function UnifiedMatchTable({
  matches,
  colVis,
  actingMatchId,
  onApprove,
  onSuppressAlert,
  onIgnore,
  onPriceUpdate,
  onStorePriceUpdate,
}: {
  matches: CompetitorProductMatch[];
  colVis: ColumnVisibility;
  actingMatchId: string | null;
  onApprove: (id: string) => void;
  onSuppressAlert: (id: string) => void;
  onIgnore: (id: string) => void;
  onPriceUpdate: (sku: string, sizeLabel: string, value: number) => Promise<void>;
  onStorePriceUpdate: (variantId: string, matchId: string, value: number) => Promise<void>;
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  // Default: gap descending — most expensive (red) rows first
  const [sortKey, setSortKey] = useState<SortKey>("gap");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
  const menuDropdownRef = useRef<HTMLDivElement>(null);
  const menuButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Reset to page 1 when data, sort, or page size changes
  useEffect(() => { setPage(1); }, [matches, sortKey, pageSize]);

  // Close overflow menu on outside click or any scroll
  useEffect(() => {
    if (!openMenuId) return;
    function handleMousedown(e: MouseEvent) {
      const target = e.target as Node;
      const btn = menuButtonRefs.current.get(openMenuId!);
      if (
        menuDropdownRef.current && !menuDropdownRef.current.contains(target) &&
        btn && !btn.contains(target)
      ) {
        setOpenMenuId(null);
        setMenuPos(null);
      }
    }
    function handleScroll() {
      setOpenMenuId(null);
      setMenuPos(null);
    }
    document.addEventListener("mousedown", handleMousedown);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleMousedown);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [openMenuId]);

  if (!matches.length) {
    return (
      <Text size="small" className="text-ui-fg-subtle py-4">
        No competitor matches tracked yet.
      </Text>
    );
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function openMenu(id: string, btn: HTMLButtonElement) {
    const rect = btn.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    setOpenMenuId(id);
  }

  const sorted = [...matches].sort((a, b) => {
    const d = sortDir === "asc" ? 1 : -1;
    switch (sortKey) {
      case "product":    return d * a.internalProductName.localeCompare(b.internalProductName);
      case "size":       return d * (a.sizeLabel ?? "").localeCompare(b.sizeLabel ?? "");
      case "storePrice": return d * (a.currentPrice.internalPrice - b.currentPrice.internalPrice);
      case "theirPrice": return d * (a.currentPrice.competitorPrice - b.currentPrice.competitorPrice);
      case "gap":        return d * (a.priceDelta - b.priceDelta);
      case "checked":    return d * (new Date(a.lastCheckedAt).getTime() - new Date(b.lastCheckedAt).getTime());
      default:           return 0;
    }
  });

  const totalPages = Math.ceil(sorted.length / pageSize);
  const pageMatches = sorted.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="flex flex-col gap-3">
      {/* Fixed-position overflow menu — rendered outside scroll container to avoid clipping */}
      {openMenuId && menuPos && (
        <div
          ref={menuDropdownRef}
          style={{ position: "fixed", top: menuPos.top, right: menuPos.right, zIndex: 50 }}
          className="w-36 rounded-md border border-ui-border-base bg-ui-bg-base shadow-lg py-1"
        >
          <button
            onClick={() => { onSuppressAlert(openMenuId); setOpenMenuId(null); setMenuPos(null); }}
            className="w-full text-left px-3 py-2 text-sm text-ui-fg-base hover:bg-ui-bg-base-hover"
          >
            Suppress
          </button>
          <button
            onClick={() => { onIgnore(openMenuId); setOpenMenuId(null); setMenuPos(null); }}
            className="w-full text-left px-3 py-2 text-sm text-ui-tag-red-text hover:bg-ui-bg-base-hover"
          >
            Ignore
          </button>
        </div>
      )}

      {/* Rows per page — top of table */}
      <div className="flex items-center gap-2">
        <Text size="small" className="text-ui-fg-muted">Rows per page:</Text>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="text-xs border border-ui-border-base rounded px-1.5 py-1 bg-ui-bg-base text-ui-fg-base"
        >
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <Text size="small" className="text-ui-fg-muted">
          — {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} of {sorted.length}
        </Text>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ui-border-base bg-ui-bg-subtle">
              <SortTh label="Product"     sortKey="product"    active={sortKey === "product"}    dir={sortDir} onSort={toggleSort} />
              {colVis.size       && <SortTh label="Size"       sortKey="size"       active={sortKey === "size"}       dir={sortDir} onSort={toggleSort} />}
              <th className="text-left py-2 px-4 text-ui-fg-subtle font-medium">Competitor Product</th>
              {colVis.sourcePrice && <th className="text-left py-2 px-4 text-ui-fg-subtle font-medium">Source Price</th>}
              {colVis.margin     && <th className="text-left py-2 px-4 text-ui-fg-subtle font-medium">Margin</th>}
              <SortTh label="Store Price" sortKey="storePrice" active={sortKey === "storePrice"} dir={sortDir} onSort={toggleSort} />
              <SortTh label="Their Price" sortKey="theirPrice" active={sortKey === "theirPrice"} dir={sortDir} onSort={toggleSort} />
              <SortTh label="Gap"         sortKey="gap"        active={sortKey === "gap"}        dir={sortDir} onSort={toggleSort} />
              {colVis.checked    && <SortTh label="Checked"    sortKey="checked"    active={sortKey === "checked"}    dir={sortDir} onSort={toggleSort} />}
              <th className="text-left py-2 px-4 text-ui-fg-subtle font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageMatches.map((match) => {
              const storefrontUrl = match.storefrontSlug
                ? `${STOREFRONT_URL}/products/${match.storefrontSlug}`
                : null;
              return (
                <tr
                  key={match.id}
                  className="border-b border-ui-border-base last:border-0 hover:bg-ui-bg-base-hover"
                >
                  {/* Product */}
                  <td className="py-3 px-4">
                    {storefrontUrl ? (
                      <a
                        href={storefrontUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-ui-fg-interactive hover:underline font-medium text-sm block"
                      >
                        {match.internalProductName}
                      </a>
                    ) : (
                      <Text size="small" weight="plus">{match.internalProductName}</Text>
                    )}
                    <span className="text-xs text-ui-fg-muted font-mono">{match.internalSku}</span>
                  </td>

                  {/* Size */}
                  {colVis.size && (
                    <td className="py-3 px-4 text-xs text-ui-fg-subtle whitespace-nowrap">
                      {match.sizeLabel}
                    </td>
                  )}


                  {/* Competitor Product */}
                  <td className="py-3 px-4 max-w-[220px]">
                    <a
                      href={match.competitorUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-ui-fg-interactive hover:underline text-sm font-medium truncate block"
                      title={match.competitorProductName}
                    >
                      {match.competitorProductName}
                    </a>
                  </td>

                  {/* Source Price — inline editable */}
                  {colVis.sourcePrice && (
                    <td className="py-3 px-4">
                      <EditableCell
                        value={match.currentPrice.sourcePrice ?? null}
                        currency={match.currentPrice.currencyCode}
                        onSave={(v) => onPriceUpdate(match.internalSku, match.sizeLabel, v)}
                      />
                    </td>
                  )}

                  {/* Margin = Store Price − Source Price */}
                  {colVis.margin && (() => {
                    const cost = match.currentPrice.sourcePrice ?? null;
                    const margin = cost != null ? match.currentPrice.internalPrice - cost : null;
                    const color = margin == null ? "" : margin >= 0 ? "text-ui-tag-green-text" : "text-ui-tag-red-text";
                    return (
                      <td className="py-3 px-4 tabular-nums text-sm">
                        {margin != null
                          ? <span className={`font-medium ${color}`}>{formatCurrency(margin, match.currentPrice.currencyCode)}</span>
                          : <span className="text-ui-fg-muted italic text-xs">—</span>}
                      </td>
                    );
                  })()}

                  {/* Store Price — inline editable via dashboard-provided variant ID */}
                  <td className="py-3 px-4">
                    <EditableCell
                      value={match.currentPrice.internalPrice}
                      currency={match.currentPrice.currencyCode}
                      onSave={(v) => {
                        if (!match.medusaVariantId) return Promise.reject(new Error("Variant not found"));
                        return onStorePriceUpdate(match.medusaVariantId, match.id, v);
                      }}
                    />
                  </td>

                  {/* Their Price */}
                  <td className="py-3 px-4 tabular-nums text-sm">
                    {formatCurrency(match.currentPrice.competitorPrice, match.currentPrice.currencyCode)}
                  </td>

                  {/* Gap */}
                  <td className="py-3 px-4">
                    <PriceGapCell delta={match.priceDelta} competitorPrice={match.currentPrice.competitorPrice} />
                  </td>

                  {/* Checked */}
                  {colVis.checked && (
                    <td className="py-3 px-4 text-xs text-ui-fg-subtle whitespace-nowrap">
                      {formatDate(match.lastCheckedAt)}
                    </td>
                  )}

                  {/* Actions */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="small"
                        disabled={actingMatchId === match.id}
                        onClick={() => onApprove(match.id)}
                      >
                        <CheckCircle />
                        {actingMatchId === match.id ? "…" : "Approve"}
                      </Button>
                      <button
                        ref={(el) => {
                          if (el) menuButtonRefs.current.set(match.id, el);
                          else menuButtonRefs.current.delete(match.id);
                        }}
                        disabled={actingMatchId === match.id}
                        onClick={(e) => {
                          if (openMenuId === match.id) {
                            setOpenMenuId(null);
                            setMenuPos(null);
                          } else {
                            openMenu(match.id, e.currentTarget);
                          }
                        }}
                        className="flex items-center justify-center w-7 h-7 rounded-md border border-ui-border-base text-ui-fg-subtle hover:bg-ui-bg-base-hover disabled:opacity-40 text-sm"
                        aria-label="More actions"
                      >
                        •••
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-ui-border-base">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="inline-flex items-center gap-1 text-sm text-ui-fg-interactive hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft />
            Previous
          </button>
          <Text size="small" className="text-ui-fg-muted">
            {page} / {totalPages}
          </Text>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="inline-flex items-center gap-1 text-sm text-ui-fg-interactive hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}


export default function CompetitorPricingPage() {
  const [dashboard, setDashboard] = useState<CompetitorPricingDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [actingMatchId, setActingMatchId] = useState<string | null>(null);
  const [matchModifierType, setMatchModifierType] = useState<"none" | "pct_off" | "fixed_off" | "fixed_price">("pct_off");
  const [matchModifierValue, setMatchModifierValue] = useState<string>("15");
  const [colVis, setColVis] = useState<ColumnVisibility>(DEFAULT_COLUMN_VISIBILITY);
  const [viewOpen, setViewOpen] = useState(false);
  const [competitorTab, setCompetitorTab] = useState<string>("blinds.com");
  const viewDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!viewOpen) return;
    function handle(e: MouseEvent) {
      if (viewDropdownRef.current && !viewDropdownRef.current.contains(e.target as Node)) {
        setViewOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [viewOpen]);

  async function loadDashboard() {
    setLoading(true);
    setError(null);

    try {
      const dashboardRes = await fetch(`${OPS_API_URL}/api/v1/competitor-pricing`);

      if (!dashboardRes.ok) throw new Error(`Dashboard request failed: ${dashboardRes.status}`);

      const data = (await dashboardRes.json()) as CompetitorPricingDashboardResponse;
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function handlePriceUpdate(sku: string, sizeLabel: string, value: number) {
    const res = await fetch("/admin/variants/update-price", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ field: "source_price", sku, sizeLabel, value }),
    });
    if (!res.ok) {
      const body = (await res.json()) as { error?: string };
      throw new Error(body.error ?? `Update failed: ${res.status}`);
    }
    setDashboard((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        matches: prev.matches.map((match) => {
          if (match.internalSku !== sku || match.sizeLabel !== sizeLabel) {
            return match;
          }

          return {
            ...match,
            currentPrice: {
              ...match.currentPrice,
              sourcePrice: value,
            },
          };
        }),
      };
    });
  }

  async function handleStorePriceUpdate(variantId: string, matchId: string, value: number) {
    const res = await fetch("/admin/variants/update-price", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ field: "store_price", variantId, value }),
    });
    if (!res.ok) {
      const body = (await res.json()) as { error?: string };
      throw new Error(body.error ?? `Update failed: ${res.status}`);
    }
    setDashboard((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        matches: prev.matches.map((match) => {
          if (match.id !== matchId) {
            return match;
          }

          return {
            ...match,
            currentPrice: {
              ...match.currentPrice,
              internalPrice: value,
            },
            priceDelta: value - match.currentPrice.competitorPrice,
          };
        }),
      };
    });
  }

  async function runRefresh() {
    setRefreshing(true);
    setError(null);

    try {
      const res = await fetch(`${OPS_API_URL}/api/v1/competitor-pricing/refresh`, { method: "POST" });

      if (!res.ok) throw new Error(`Refresh failed: ${res.status}`);
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setRefreshing(false);
    }
  }

  function buildMatchPriceModifier() {
    if (matchModifierType === "none") return undefined;
    const value = parseFloat(matchModifierValue);
    if (!value || value <= 0) return undefined;
    if (matchModifierType === "pct_off" && value >= 100) return undefined;
    return { type: matchModifierType, value };
  }

  async function runMatchAction(matchId: string, action: "approve" | "suppress-alert" | "ignore") {
    setActingMatchId(matchId);
    setError(null);

    try {
      const body: Record<string, unknown> = {};
      if (action === "approve") {
        const priceModifier = buildMatchPriceModifier();
        if (priceModifier) body.price_modifier = priceModifier;
      }

      const res = await fetch(
        `${OPS_API_URL}/api/v1/competitor-pricing/matches/${matchId}/${action}`,
        { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) },
      );

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `${action} failed: ${res.status}`);
      }
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setActingMatchId(null);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Heading level="h1">Competitor Pricing</Heading>
          <Text className="text-ui-fg-subtle mt-1">
            Track match confidence, competitor undercuts, and worker refresh health.
          </Text>
        </div>
        <Button
          variant="primary"
          size="small"
          isLoading={refreshing}
          onClick={() => void runRefresh()}
        >
          <ArrowPath className={refreshing ? "animate-spin" : ""} />
          Run refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-ui-bg-base-pressed border border-ui-border-error px-4 py-3">
          <Text size="small" className="text-ui-fg-error">
            {error}
          </Text>
        </div>
      )}

      {loading || !dashboard ? (
        <Container>
          <Text className="text-ui-fg-subtle">Loading operations data...</Text>
        </Container>
      ) : (
        <>
          {/* 4 compact stat cards */}
          <div className="grid grid-cols-4 gap-3">
            <Container className="flex flex-col gap-2 p-3">
              <Text size="small" weight="plus" className="uppercase tracking-wider text-ui-fg-muted">
                Active alerts
              </Text>
              <div>
                <StatusBadge color={dashboard.summary.activeAlerts > 0 ? "red" : "green"}>
                  {String(dashboard.summary.activeAlerts)}
                </StatusBadge>
              </div>
              <Text size="small" className="text-ui-fg-subtle">
                {dashboard.summary.criticalAlerts} critical
              </Text>
            </Container>

            <Container className="flex flex-col gap-2 p-3">
              <Text size="small" weight="plus" className="uppercase tracking-wider text-ui-fg-muted">
                Tracked matches
              </Text>
              <div>
                <StatusBadge color="grey">
                  {String(dashboard.summary.totalMatches)}
                </StatusBadge>
              </div>
              <Text size="small" className="text-ui-fg-subtle">
                {dashboard.summary.staleMatches} stale
              </Text>
            </Container>

            <Container className="flex flex-col gap-2 p-3">
              <Text size="small" weight="plus" className="uppercase tracking-wider text-ui-fg-muted">
                Refresh status
              </Text>
              <div>
                <StatusBadge color={statusColor(dashboard.refresh.status)}>
                  {dashboard.refresh.status}
                </StatusBadge>
              </div>
              <Text size="small" className="text-ui-fg-subtle">
                {dashboard.refresh.matchesChecked} checked
              </Text>
            </Container>

            <Container className="flex flex-col gap-2 p-3">
              <Text size="small" weight="plus" className="uppercase tracking-wider text-ui-fg-muted">
                Last refreshed
              </Text>
              <div>
                <StatusBadge color={dashboard.refresh.failures > 0 ? "orange" : "grey"}>
                  {formatTimestamp(dashboard.refresh.completedAt)}
                </StatusBadge>
              </div>
              <Text size="small" className="text-ui-fg-subtle">
                {dashboard.refresh.failures} {dashboard.refresh.failures === 1 ? "failure" : "failures"}
              </Text>
            </Container>
          </div>

          {/* Match inventory — full width */}
          <Container className="flex flex-col gap-4 p-4">
            {/* Section title + competitor tabs */}
            <div className="flex items-end justify-between gap-4">
              <div>
                <Text size="small" weight="plus" className="uppercase tracking-wider text-ui-fg-muted">
                  Match inventory
                </Text>
                <Heading level="h2">Price comparison</Heading>
              </div>

              {/* Competitor source tabs */}
              <div className="flex items-center gap-1 flex-1 justify-center">
                {[
                  "Blinds.com",
                  "Lowe's",
                  "HD Supply",
                  "SelectBlinds",
                  "Justblinds.com",
                  "FactoryDirectBlinds",
                ].map((tab) => {
                  const key = tab.toLowerCase();
                  const active = competitorTab === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setCompetitorTab(key)}
                      className={`px-3 py-1.5 text-sm rounded-md whitespace-nowrap transition-colors ${
                        active
                          ? "bg-ui-bg-interactive text-ui-fg-on-color font-medium"
                          : "text-ui-fg-subtle hover:bg-ui-bg-base-hover hover:text-ui-fg-base"
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>

              <div className="w-[180px]" /> {/* spacer to balance the title on the left */}
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3 flex-wrap border-b border-ui-border-base pb-4">
              {/* View column toggle */}
              <div className="relative" ref={viewDropdownRef}>
                <button
                  onClick={() => setViewOpen((v) => !v)}
                  className="flex items-center gap-1 text-sm border border-ui-border-base rounded-md px-3 py-1.5 bg-ui-bg-base text-ui-fg-base hover:bg-ui-bg-base-hover"
                >
                  <Adjustments className="text-ui-fg-muted" /> Columns <span className="text-xs opacity-60">▾</span>
                </button>
                {viewOpen && (
                  <div className="absolute left-0 top-full mt-1 z-20 w-44 rounded-md border border-ui-border-base bg-ui-bg-base shadow-lg py-1">
                    {(
                      [
                        ["size", "Size"],
                        ["sourcePrice", "Source Price"],
                        ["margin", "Margin"],
                        ["checked", "Checked"],
                      ] as [keyof ColumnVisibility, string][]
                    ).map(([key, label]) => (
                      <label
                        key={key}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-ui-fg-base hover:bg-ui-bg-base-hover cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={colVis[key]}
                          onChange={(e) => setColVis((prev) => ({ ...prev, [key]: e.target.checked }))}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="ml-auto flex items-center gap-3">
                <Text size="small" className="text-ui-fg-subtle shrink-0">Approve with:</Text>
                <select
                  value={matchModifierType}
                  onChange={(e) => setMatchModifierType(e.target.value as typeof matchModifierType)}
                  className="text-sm border border-ui-border-base rounded-md px-2 py-1.5 bg-ui-bg-base text-ui-fg-base"
                >
                  <option value="none">No discount</option>
                  <option value="pct_off">% off competitor</option>
                  <option value="fixed_off">$ off competitor</option>
                  <option value="fixed_price">Fixed price ($)</option>
                </select>

                {matchModifierType !== "none" && (
                  <input
                    type="number"
                    min="0"
                    max={matchModifierType === "pct_off" ? "99" : undefined}
                    step={matchModifierType === "pct_off" ? "1" : "0.01"}
                    value={matchModifierValue}
                    onChange={(e) => setMatchModifierValue(e.target.value)}
                    placeholder={matchModifierType === "pct_off" ? "%" : "$"}
                    className="text-sm border border-ui-border-base rounded-md px-2 py-1.5 bg-ui-bg-base text-ui-fg-base w-20"
                  />
                )}

              </div>
            </div>

            {(() => {
              const competitorSource = TAB_COMPETITOR_SOURCE[competitorTab];
              if (!competitorSource) {
                return (
                  <div className="flex flex-col items-center justify-center py-16 text-ui-fg-muted gap-2">
                    <ArchiveBox className="text-ui-fg-muted" />
                    <Text weight="plus">Coming soon</Text>
                    <Text size="small">Scraping for this competitor is not yet configured.</Text>
                  </div>
                );
              }
              const tabMatches = dashboard.matches.filter((m) => m.competitor === competitorSource);
              return (
                <UnifiedMatchTable
                  matches={tabMatches}
                  colVis={colVis}
                  actingMatchId={actingMatchId}
                  onApprove={(id) => void runMatchAction(id, "approve")}
                  onSuppressAlert={(id) => void runMatchAction(id, "suppress-alert")}
                  onIgnore={(id) => void runMatchAction(id, "ignore")}
                  onPriceUpdate={handlePriceUpdate}
                  onStorePriceUpdate={handleStorePriceUpdate}
                />
              );
            })()}
          </Container>

        </>
      )}
    </div>
  );
}

export const config = defineRouteConfig({
  label: "Competitor Pricing",
  icon: CurrencyDollar,
  rank: 20,
});
