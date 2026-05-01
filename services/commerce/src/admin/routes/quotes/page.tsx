import { defineRouteConfig } from "@medusajs/admin-sdk";
import {
  ArrowPath,
  ChatBubbleLeftRight,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  DocumentText,
} from "@medusajs/icons";
import { Badge, Button, Container, Heading, Text } from "@medusajs/ui";
import { useEffect, useState } from "react";

import type {
  CustomerOpsRequestRecord,
  CustomerOpsRequestStatus,
} from "@blinds/types";

const OPS_API_URL = import.meta.env.VITE_OPS_API_URL ?? "http://localhost:4000";

const PAGE_SIZE = 50;
const STATUS_OPTIONS: Array<"" | CustomerOpsRequestStatus> = [
  "",
  "received",
  "reviewed",
  "approved",
  "completed",
];
const WORKFLOW_STATUSES: CustomerOpsRequestStatus[] = [
  "received",
  "reviewed",
  "approved",
  "completed",
];

function statusColor(status: string): "green" | "orange" | "grey" | "blue" {
  if (status === "completed") return "green";
  if (status === "approved") return "blue";
  if (status === "reviewed") return "orange";
  return "grey";
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatRelativeTime(value: string) {
  const date = new Date(value);
  const diffMs = date.getTime() - Date.now();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffMs) < hour) {
    return formatter.format(Math.round(diffMs / minute), "minute");
  }

  if (Math.abs(diffMs) < day) {
    return formatter.format(Math.round(diffMs / hour), "hour");
  }

  return formatter.format(Math.round(diffMs / day), "day");
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function statusHeadline(status: CustomerOpsRequestStatus) {
  if (status === "received") return "Needs review";
  if (status === "reviewed") return "Ready for approval";
  if (status === "approved") return "Waiting to complete";
  return "Closed";
}

function statusDescription(status: CustomerOpsRequestStatus) {
  if (status === "received") return "A new request is waiting for the first admin pass.";
  if (status === "reviewed") return "Details look reviewed and can move into approval.";
  if (status === "approved") return "The request is approved and should be finalized.";
  return "This request is done and no longer needs attention.";
}

function workflowStep(status: CustomerOpsRequestStatus) {
  return WORKFLOW_STATUSES.indexOf(status) + 1;
}

function primaryActionForStatus(status: CustomerOpsRequestStatus) {
  if (status === "received") return "reviewed";
  if (status === "reviewed") return "approved";
  if (status === "approved") return "completed";
  return null;
}

function summaryLabel(status: CustomerOpsRequestStatus) {
  if (status === "received") return "Incoming";
  if (status === "reviewed") return "Under review";
  if (status === "approved") return "Approved";
  return "Completed";
}

function actionButtonClass(action: "approved" | "completed") {
  if (action === "approved") {
    return "border-blue-500/30 bg-blue-500/10 text-blue-200 hover:bg-blue-500/15";
  }

  return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15";
}

export default function QuotesPage() {
  const [records, setRecords] = useState<CustomerOpsRequestRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [typeFilter, setTypeFilter] = useState<"" | "quote" | "invoice">("");
  const [statusFilter, setStatusFilter] = useState<"" | CustomerOpsRequestStatus>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingKey, setActingKey] = useState<string | null>(null);

  async function loadRecords(
    newOffset = 0,
    type = typeFilter,
    status = statusFilter,
  ) {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(newOffset),
      });

      if (type) params.set("type", type);
      if (status) params.set("status", status);

      const res = await fetch(`${OPS_API_URL}/api/v1/admin/requests?${params.toString()}`);

      if (!res.ok) throw new Error(`Failed to load requests: ${res.status}`);

      const data = (await res.json()) as { records: CustomerOpsRequestRecord[]; total: number };

      setRecords(data.records);
      setTotal(data.total);
      setOffset(newOffset);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(recordId: string, status: CustomerOpsRequestStatus) {
    const actionKey = `${recordId}:${status}`;
    setActingKey(actionKey);
    setError(null);

    try {
      const res = await fetch(`${OPS_API_URL}/api/v1/admin/requests/${recordId}/status`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error(`Failed to update request (${res.status})`);
      }

      const payload = (await res.json()) as {
        updated: true;
        record: CustomerOpsRequestRecord;
      };

      setRecords((current) =>
        current.map((record) => (record.id === recordId ? payload.record : record)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update request.");
    } finally {
      setActingKey(null);
    }
  }

  useEffect(() => {
    void loadRecords(0, typeFilter, statusFilter);
  }, []);

  function handleTypeFilter(value: "" | "quote" | "invoice") {
    setTypeFilter(value);
    void loadRecords(0, value, statusFilter);
  }

  function handleStatusFilter(value: "" | CustomerOpsRequestStatus) {
    setStatusFilter(value);
    void loadRecords(0, typeFilter, value);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const visibleLabel = typeFilter ? `${titleCase(typeFilter)}s` : "All requests";
  const statusCounts = WORKFLOW_STATUSES.map((status) => ({
    status,
    count: records.filter((record) => record.status === status).length,
  }));

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Heading level="h1">Quotes & Requests</Heading>
          <Text className="text-ui-fg-subtle mt-1">
            A lightweight queue for quote and invoice requests coming from the storefront.
          </Text>
        </div>
        <Button
          variant="secondary"
          size="small"
          onClick={() => void loadRecords(offset, typeFilter, statusFilter)}
        >
          <ArrowPath className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        {statusCounts.map(({ status, count }) => (
          <div
            key={status}
            className="min-w-[180px] flex-1 rounded-xl border border-ui-border-base bg-ui-bg-base px-4 py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="grid gap-1">
                <Text size="xsmall" className="text-ui-fg-muted uppercase">
                  {summaryLabel(status)}
                </Text>
                <Heading level="h2">{count}</Heading>
              </div>
              <Badge size="2xsmall" color={statusColor(status)}>
                {titleCase(status)}
              </Badge>
            </div>
            <Text size="small" className="mt-2 text-ui-fg-subtle">
              {statusHeadline(status)}
            </Text>
          </div>
        ))}
      </div>

      <Container className="rounded-xl p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
            <div>
              <Text size="small" weight="plus">
                {visibleLabel}
              </Text>
              <Text size="small" className="text-ui-fg-subtle">
                {loading ? "Refreshing queue..." : `${records.length} visible on this page, ${total} total`}
              </Text>
            </div>
            <Text size="small" className="text-ui-fg-subtle">
              Use the status lane on each card to move requests through the workflow.
            </Text>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {(["", "quote", "invoice"] as const).map((value) => (
                <button
                  key={value || "all"}
                  onClick={() => handleTypeFilter(value)}
                  className={[
                    "rounded-md border px-3 py-1 text-sm transition-colors",
                    typeFilter === value
                      ? "border-ui-border-interactive bg-ui-bg-interactive text-ui-fg-on-color"
                      : "border-ui-border-base bg-ui-bg-base text-ui-fg-base hover:bg-ui-bg-base-hover",
                  ].join(" ")}
                >
                  {value === "" ? "All" : `${titleCase(value)}s`}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((value) => (
                <button
                  key={value || "all-statuses"}
                  onClick={() => handleStatusFilter(value)}
                  className={[
                    "rounded-md border px-3 py-1 text-sm transition-colors",
                    statusFilter === value
                      ? "border-ui-border-interactive bg-ui-bg-interactive text-ui-fg-on-color"
                      : "border-ui-border-base bg-ui-bg-base text-ui-fg-base hover:bg-ui-bg-base-hover",
                  ].join(" ")}
                >
                  {value === "" ? "All statuses" : titleCase(value)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Container>

      {error && (
        <div className="rounded-md border border-ui-border-error bg-ui-bg-base-pressed px-4 py-3">
          <Text size="small" className="text-ui-fg-error">
            {error}
          </Text>
        </div>
      )}

      {loading ? (
        <Container className="rounded-xl p-6">
          <Text className="text-ui-fg-subtle">Loading requests...</Text>
        </Container>
      ) : records.length === 0 ? (
        <Container className="rounded-xl p-6">
          <Text className="text-ui-fg-subtle">No requests found.</Text>
        </Container>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {records.map((record) => {
            const recordStatus = record.status as CustomerOpsRequestStatus;
            const canReview = recordStatus === "received";
            const canApprove = recordStatus === "received" || recordStatus === "reviewed";
            const canComplete = recordStatus !== "completed";
            const primaryAction = primaryActionForStatus(recordStatus);

            return (
              <div
                key={record.id}
                className="flex h-full flex-col overflow-hidden rounded-xl border border-ui-border-base bg-ui-bg-base"
              >
                <div className="flex flex-1 flex-col gap-5 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge size="2xsmall" color={record.type === "quote" ? "blue" : "purple"}>
                        {record.type === "quote" ? "Quote request" : "Invoice request"}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Badge size="2xsmall" color={statusColor(recordStatus)}>
                          {titleCase(recordStatus)}
                        </Badge>
                        <Text size="small" className="text-ui-fg-subtle">
                          Step {workflowStep(recordStatus)} of {WORKFLOW_STATUSES.length}
                        </Text>
                      </div>
                    </div>

                    <div className="text-right">
                      <Text size="xsmall" className="text-ui-fg-muted uppercase">
                        Submitted
                      </Text>
                      <Text size="small" weight="plus" className="mt-1">
                        {formatTimestamp(record.submittedAt)}
                      </Text>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Text size="xsmall" className="text-ui-fg-muted uppercase">
                        Customer
                      </Text>
                      <Text size="small" weight="plus" className="mt-1">
                        {record.customerName || "—"}
                      </Text>
                    </div>
                    <div>
                      <Text size="xsmall" className="text-ui-fg-muted uppercase">
                        Email
                      </Text>
                      <Text size="small" weight="plus" className="mt-1 break-all">
                        {record.email}
                      </Text>
                    </div>
                    <div>
                      <Text size="xsmall" className="text-ui-fg-muted uppercase">
                        Company
                      </Text>
                      <Text size="small" weight="plus" className="mt-1">
                        {record.companyName || "—"}
                      </Text>
                    </div>
                    <div>
                      <Text size="xsmall" className="text-ui-fg-muted uppercase">
                        Purchase order
                      </Text>
                      <Text size="small" weight="plus" className="mt-1 break-all font-mono">
                        {record.purchaseOrderNumber || "—"}
                      </Text>
                    </div>
                    <div>
                      <Text size="xsmall" className="text-ui-fg-muted uppercase">
                        Request ID
                      </Text>
                      <Text size="small" weight="plus" className="mt-1 break-all font-mono">
                        {record.id}
                      </Text>
                    </div>
                    {record.orderId ? (
                      <div>
                        <Text size="xsmall" className="text-ui-fg-muted uppercase">
                          Order
                        </Text>
                        <Text size="small" weight="plus" className="mt-1 break-all font-mono">
                          {record.orderId}
                        </Text>
                      </div>
                    ) : null}
                  </div>

                  <div className="rounded-xl border border-ui-border-base bg-ui-bg-subtle px-4 py-4">
                    <Text size="xsmall" className="text-ui-fg-muted uppercase">
                      Notes
                    </Text>
                    <Text size="small" weight="plus" className="mt-2 whitespace-pre-wrap">
                      {record.notes || "No notes provided."}
                    </Text>
                  </div>

                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <Text size="small" className="text-ui-fg-subtle">
                      {statusDescription(recordStatus)}
                    </Text>

                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                      {canReview ? (
                        <Button
                          size="small"
                          variant={primaryAction === "reviewed" ? undefined : "secondary"}
                          disabled={actingKey === `${record.id}:reviewed`}
                          onClick={() => void updateStatus(record.id, "reviewed")}
                        >
                          <DocumentText />
                          {actingKey === `${record.id}:reviewed` ? "Saving..." : "Mark reviewed"}
                        </Button>
                      ) : null}
                      {canApprove ? (
                        <Button
                          size="small"
                          variant={primaryAction === "approved" ? undefined : "secondary"}
                          className={actionButtonClass("approved")}
                          disabled={actingKey === `${record.id}:approved`}
                          onClick={() => void updateStatus(record.id, "approved")}
                        >
                          <CheckCircle />
                          {actingKey === `${record.id}:approved` ? "Saving..." : "Approve"}
                        </Button>
                      ) : null}
                      {canComplete ? (
                        <Button
                          size="small"
                          variant={primaryAction === "completed" ? undefined : "secondary"}
                          className={actionButtonClass("completed")}
                          disabled={actingKey === `${record.id}:completed`}
                          onClick={() => void updateStatus(record.id, "completed")}
                        >
                          <Check />
                          {actingKey === `${record.id}:completed` ? "Saving..." : "Complete"}
                        </Button>
                      ) : null}
                      {!canReview && !canApprove && !canComplete ? (
                        <div className="rounded-xl border border-ui-border-base bg-ui-bg-base px-3 py-2">
                          <Text size="small" className="text-ui-fg-subtle">
                            No further action needed.
                          </Text>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <Text size="small" className="text-ui-fg-subtle">
            Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total}
          </Text>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="small"
              disabled={offset === 0}
              onClick={() => void loadRecords(offset - PAGE_SIZE, typeFilter, statusFilter)}
            >
              <ChevronLeft />
              Previous
            </Button>
            <Text size="small" className="self-center text-ui-fg-subtle">
              Page {currentPage} of {totalPages}
            </Text>
            <Button
              variant="secondary"
              size="small"
              disabled={offset + PAGE_SIZE >= total}
              onClick={() => void loadRecords(offset + PAGE_SIZE, typeFilter, statusFilter)}
            >
              Next
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export const config = defineRouteConfig({
  label: "Quotes & Requests",
  icon: ChatBubbleLeftRight,
  rank: 30,
});
