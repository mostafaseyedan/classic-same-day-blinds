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

const conferenceOptions = [
  "Apartmentalize / NAA",
  "AIM Conference",
  "NMHC Annual Meeting",
  "IBS / Builders Show",
  "General partnership interest",
];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  conference: "",
  message: "",
};

export function ConferenceInterestForm() {
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
          "Conference interest form is migrated. Set NEXT_PUBLIC_OPS_API_URL to route requests into ops.",
        );
        return;
      }

      const response = await fetch(`${config.opsApiBaseUrl}/api/v1/conference-interest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Unable to submit conference interest.");
      }

      setState("success");
      setMessage("Conference interest accepted. The ops queue now owns follow-up.");
      setForm(initialForm);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Unable to submit conference interest.");
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
        <Label as="span" variant="default">Conference or topic</Label>
        <Select
          name="conference"
          value={form.conference}
          onChange={handleChange}
          required
        >
          <option value="">Select one</option>
          {conferenceOptions.map((option) => (
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
          placeholder="Tell us about your interest or expected attendance…"
        />
      </label>

      <Button variant="default"
        type="submit"
        disabled={state === "submitting"}
        className="mt-6 w-full justify-center disabled:cursor-not-allowed disabled:opacity-70"
      >
        {state === "submitting" ? "Submitting..." : "Submit Conference Interest"}
      </Button>

      {message ? (
        <p className={`mt-4 text-sm leading-6 ${state === "error" ? "text-red-700" : "text-olive"}`}>
          {message}
        </p>
      ) : null}
    </FormShell>
  );
}
