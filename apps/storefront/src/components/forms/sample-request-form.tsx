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

const productTypes = [
  '1" Vinyl Blinds',
  '1" Aluminum Blinds',
  '2" Faux Wood Blinds',
  "Vertical Blinds",
];

const colors = ["White", "Ivory", "Gray", "Beige", "Espresso", "Natural"];

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  productType: "",
  preferredColor: "",
  notes: "",
};

export function SampleRequestForm() {
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
          "Sample request form is migrated. Set NEXT_PUBLIC_OPS_API_URL to send requests into the operations API.",
        );
        return;
      }

      const response = await fetch(`${config.opsApiBaseUrl}/api/v1/sample-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Unable to submit the sample request.");
      }

      setState("success");
      setMessage("Sample request accepted. Operations now owns the next step.");
      setForm(initialForm);
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error ? error.message : "Unable to submit the sample request.",
      );
    }
  }

  return (
    <FormShell as="form" onSubmit={handleSubmit} className="bg-white">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <Label as="span" variant="default">First name</Label>
          <Input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
          />
        </label>
        <label className="grid gap-2">
          <Label as="span" variant="default">Last name</Label>
          <Input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
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

      <div className="mt-4 grid gap-4">
        <label className="grid gap-2">
          <Label as="span" variant="default">Street address</Label>
          <Input
            name="address"
            value={form.address}
            onChange={handleChange}
            required
          />
        </label>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2">
            <Label as="span" variant="default">City</Label>
            <Input
              name="city"
              value={form.city}
              onChange={handleChange}
              required
            />
          </label>
          <label className="grid gap-2">
            <Label as="span" variant="default">State</Label>
            <Input
              name="state"
              value={form.state}
              onChange={handleChange}
              required
            />
          </label>
          <label className="grid gap-2">
            <Label as="span" variant="default">ZIP</Label>
            <Input
              name="zip"
              value={form.zip}
              onChange={handleChange}
              required
            />
          </label>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <Label as="span" variant="default">Product type</Label>
          <Select
            name="productType"
            value={form.productType}
            onChange={handleChange}
            required
          >
            <option value="">Select a product</option>
            {productTypes.map((productType) => (
              <option key={productType} value={productType}>
                {productType}
              </option>
            ))}
          </Select>
        </label>
        <label className="grid gap-2">
          <Label as="span" variant="default">Preferred color</Label>
          <Select
            name="preferredColor"
            value={form.preferredColor}
            onChange={handleChange}
            required
          >
            <option value="">Select a color</option>
            {colors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <label className="mt-4 grid gap-2">
        <Label as="span" variant="default">Notes</Label>
        <Textarea
          variant="default"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Any special requirements or window measurements…"
        />
      </label>

      <Button variant="default"
        type="submit"
        disabled={state === "submitting"}
        className="mt-6 w-full justify-center disabled:cursor-not-allowed disabled:opacity-70"
      >
        {state === "submitting" ? "Submitting..." : "Submit Sample Request"}
      </Button>

      {message ? (
        <p className={`mt-4 text-sm leading-6 ${state === "error" ? "text-red-700" : "text-olive"}`}>
          {message}
        </p>
      ) : null}
    </FormShell>
  );
}
