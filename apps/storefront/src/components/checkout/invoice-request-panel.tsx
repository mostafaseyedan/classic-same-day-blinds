"use client";
import { Button } from "@blinds/ui";
import { Input } from "@blinds/ui";
import { Textarea } from "@blinds/ui";

import { useEffect, useMemo, useState } from "react";

import { useCustomer } from "@/components/customer/customer-provider";
import { getPublicRuntimeConfig } from "@/lib/platform-config";

export function InvoiceRequestPanel({
  cartId,
  email,
}: {
  cartId?: string;
  email: string;
}) {
  const config = useMemo(() => getPublicRuntimeConfig(), []);
  const { customer } = useCustomer();
  const [companyName, setCompanyName] = useState("");
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setCompanyName(String(customer?.metadata?.company_name ?? ""));
  }, [customer?.metadata]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      if (!config.opsApiBaseUrl) {
        throw new Error("Ops API is not configured.");
      }

      const response = await fetch(`${config.opsApiBaseUrl}/api/v1/invoice-requests`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          customerName:
            [customer?.first_name, customer?.last_name].filter(Boolean).join(" ") ||
            customer?.email ||
            email,
          email: customer?.email || email,
          companyName: companyName.trim() || undefined,
          purchaseOrderNumber: purchaseOrderNumber.trim() || undefined,
          cartId,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error(`Invoice request failed with ${response.status}`);
      }

      setStatus("success");
      setPurchaseOrderNumber("");
      setNotes("");
      setMessage("Invoice request submitted to the ops queue.");
    } catch (submitError) {
      setStatus("error");
      setMessage(
        submitError instanceof Error ? submitError.message : "Unable to submit invoice request.",
      );
    }
  }

  return (
    <div className="mt-7 border-t border-black/6 pt-5">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brass">
        Invoice Request
      </p>
      <p className="mt-3 text-sm leading-6 text-slate/72">
        Use this if the customer needs an invoice-driven order flow instead of immediate card
        payment. Requests are persisted in the ops API and appear in the account area.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
        <Input
          type="text"
          name="companyName"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Company name"
        />
        <Input
          type="text"
          name="purchaseOrderNumber"
          value={purchaseOrderNumber}
          onChange={(e) => setPurchaseOrderNumber(e.target.value)}
          placeholder="PO number (optional)"
        />
        <Textarea
          variant="default"
          name="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any special instructions or PO references…"
        />
        <Button variant="secondary"
          type="submit"
          disabled={status === "submitting"}
          className="disabled:opacity-70"
        >
          {status === "submitting" ? "Submitting..." : "Request invoice instead"}
        </Button>
      </form>
      {message ? (
        <p className={`mt-4 text-sm leading-6 ${status === "error" ? "text-red-700" : "text-olive"}`}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
