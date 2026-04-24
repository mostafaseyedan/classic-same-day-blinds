"use client";
import { Input } from "@blinds/ui";
import { Button } from "@blinds/ui";
import { Label } from "@blinds/ui";
import { SurfaceMuted } from "@blinds/ui";
import { Textarea } from "@blinds/ui";

import { useEffect, useMemo, useState } from "react";

import { useCustomer } from "@/components/customer/customer-provider";
import { getPublicRuntimeConfig } from "@/lib/platform-config";

type SubmissionState = "idle" | "submitting" | "success" | "error";

const initialForm = {
  customerName: "",
  companyName: "",
  purchaseOrderNumber: "",
  email: "",
  notes: "",
};

export function QuoteRequestForm() {
  const config = useMemo(() => getPublicRuntimeConfig(), []);
  const { customer } = useCustomer();
  const [form, setForm] = useState(initialForm);
  const [state, setState] = useState<SubmissionState>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!customer) {
      return;
    }

    setForm((current) => ({
      ...current,
      customerName:
        current.customerName ||
        [customer.first_name, customer.last_name].filter(Boolean).join(" "),
      email: current.email || customer.email || "",
      companyName:
        current.companyName || String(customer.metadata?.company_name ?? ""),
    }));
  }, [customer]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState("submitting");
    setMessage("");

    try {
      if (!config.opsApiBaseUrl) {
        setState("success");
        setMessage(
          "Quote form is scaffolded. Set NEXT_PUBLIC_OPS_API_URL to send requests into the operations API.",
        );
        return;
      }

      const response = await fetch(`${config.opsApiBaseUrl}/api/v1/quotes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: form.customerName,
          companyName: form.companyName.trim() || undefined,
          purchaseOrderNumber: form.purchaseOrderNumber.trim() || undefined,
          email: form.email,
          notes: form.notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit quote request");
      }

      setState("success");
      setForm(initialForm);
      setMessage("Quote request submitted. Our team will review it next.");
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to submit the quote request.",
      );
    }
  };

  return (
    <SurfaceMuted as="form" onSubmit={handleSubmit} className="px-5 py-5 md:px-6">
      <div className="grid gap-4">
        <label className="grid gap-2">
          <Label as="span">Customer name</Label>
          <Input
            type="text"
            name="customerName"
            value={form.customerName}
            onChange={handleChange}
            required
          />
        </label>
        <label className="grid gap-2">
          <Label as="span">Company name</Label>
          <Input
            type="text"
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
          />
        </label>
        <label className="grid gap-2">
          <Label as="span">Email</Label>
          <Input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>
        <label className="grid gap-2">
          <Label as="span">PO number</Label>
          <Input
            type="text"
            name="purchaseOrderNumber"
            value={form.purchaseOrderNumber}
            onChange={handleChange}
            placeholder="Optional"
          />
        </label>
        <label className="grid gap-2">
          <Label as="span">Project notes</Label>
          <Textarea
            variant="default"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Describe your project, window count, or any special requirements…"
          />
        </label>
      </div>

      <Button variant="default"
        type="submit"
        disabled={state === "submitting"}
        className="mt-6 w-full justify-center disabled:cursor-not-allowed disabled:opacity-70"
      >
        {state === "submitting" ? "Submitting..." : "Submit Quote Request"}
      </Button>

      {message ? (
        <p
          className={`mt-4 text-sm leading-6 ${
            state === "error" ? "text-red-700" : "text-olive"
          }`}
        >
          {message}
        </p>
      ) : null}
    </SurfaceMuted>
  );
}
