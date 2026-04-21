"use client";
import { Input } from "@blinds/ui";
import { Button } from "@blinds/ui";
import { Label } from "@blinds/ui";
import { Select } from "@blinds/ui";
import { FormShell } from "@blinds/ui";
import { Textarea } from "@blinds/ui";

import { useMemo, useState } from "react";

import { getPublicRuntimeConfig } from "@/lib/platform-config";

type SubmissionState = "idle" | "submitting" | "success" | "error";

const tierOptions = ["Silver", "Gold", "Platinum"];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  tier: "",
  message: "",
};

export function MembershipInquiryForm() {
  const config = useMemo(() => getPublicRuntimeConfig(), []);
  const [form, setForm] = useState(initialForm);
  const [state, setState] = useState<SubmissionState>("idle");
  const [message, setMessage] = useState("");

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setMessage("");

    try {
      if (!config.opsApiBaseUrl) {
        setState("success");
        setMessage(
          "Membership inquiry form is migrated. Set NEXT_PUBLIC_OPS_API_URL to route requests into ops.",
        );
        return;
      }

      const response = await fetch(`${config.opsApiBaseUrl}/api/v1/membership-inquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Unable to submit membership inquiry.");
      }

      setState("success");
      setMessage("Membership inquiry accepted. Operations will follow up.");
      setForm(initialForm);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Unable to submit membership inquiry.");
    }
  }

  return (
    <FormShell as="form" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <Label as="span" variant="default">Name</Label>
          <Input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>
        <label className="grid gap-2">
          <Label as="span" variant="default">Company</Label>
          <Input
            name="company"
            value={form.company}
            onChange={handleChange}
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <Label as="span" variant="default">Email</Label>
          <Input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>
        <label className="grid gap-2">
          <Label as="span" variant="default">Phone</Label>
          <Input
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
        </label>
      </div>

      <label className="mt-4 grid gap-2">
        <Label as="span" variant="default">Tier</Label>
        <Select
          name="tier"
          value={form.tier}
          onChange={handleChange}
          required
        >
          <option value="">Select a tier</option>
          {tierOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </label>

      <label className="mt-4 grid gap-2">
        <Label as="span" variant="default">Message</Label>
        <Textarea
          variant="default"
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Tell us about your business, locations, or goals…"
        />
      </label>

      <Button variant="default"
        type="submit"
        disabled={state === "submitting"}
        className="mt-6 w-full justify-center disabled:cursor-not-allowed disabled:opacity-70"
      >
        {state === "submitting" ? "Submitting..." : "Submit Membership Inquiry"}
      </Button>

      {message ? (
        <p className={`mt-4 text-sm leading-6 ${state === "error" ? "text-red-700" : "text-olive"}`}>
          {message}
        </p>
      ) : null}
    </FormShell>
  );
}
