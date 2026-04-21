"use client";
import { Button } from "@blinds/ui";
import { Input } from "@blinds/ui";
import { Label } from "@blinds/ui";
import { SurfaceMuted } from "@blinds/ui";

import { useMemo, useState } from "react";

import { getPublicRuntimeConfig } from "@/lib/platform-config";

type SubmissionState = "idle" | "submitting" | "success" | "error";

type RestockNotificationProps = {
  productId: string;
  productName: string;
};

export function RestockNotification({ productId, productName }: RestockNotificationProps) {
  const config = useMemo(() => getPublicRuntimeConfig(), []);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubmissionState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage(null);

    try {
      if (!config.opsApiBaseUrl) {
        setStatus("success");
        setMessage(
          `Restock alert captured locally for ${productName}. Set NEXT_PUBLIC_OPS_API_URL to send it into ops.`,
        );
        return;
      }

      const response = await fetch(`${config.opsApiBaseUrl}/api/v1/restock-alerts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: name.trim() || undefined,
          email: email.trim(),
          productId,
          productName,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to submit the restock alert.");
      }

      setStatus("success");
      setName("");
      setEmail("");
      setMessage(`You will be notified when ${productName} is available again.`);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to submit the restock alert.");
    }
  }

  return (
    <SurfaceMuted as="section" className="px-5 py-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
        Restock Alert
      </p>
      <h3 className="mt-2 text-lg font-semibold text-slate">Notify me when this variant returns.</h3>
      <p className="mt-2 text-sm leading-6 text-slate/72">
        This selection is currently out of stock. Leave your email and the operations queue can own
        the follow-up instead of routing through the old Readdy form endpoint.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-3">
        <label className="grid gap-2">
          <Label as="span">Name</Label>
          <Input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            
          />
        </label>
        <label className="grid gap-2">
          <Label as="span">Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            
          />
        </label>
        <Button variant="default"
          type="submit"
          disabled={status === "submitting"}
          className="justify-center disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === "submitting" ? "Submitting..." : "Create Restock Alert"}
        </Button>
      </form>

      {message ? (
        <p className={`mt-4 text-sm leading-6 ${status === "error" ? "text-red-700" : "text-olive"}`}>
          {message}
        </p>
      ) : null}
    </SurfaceMuted>
  );
}
