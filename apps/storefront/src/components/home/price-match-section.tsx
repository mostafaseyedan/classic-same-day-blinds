"use client";

import { useRef, useState } from "react";
import { useInView } from "@/hooks/use-in-view";
import { Check, CheckCircle, EnvelopeSimple, Phone, Truck, Trophy, Timer, Handshake, UploadSimple, X } from "@phosphor-icons/react/dist/ssr";
import { Button, Input, Label, PageTitle, SectionCopy, SectionHeader, SectionTitle, Textarea } from "@blinds/ui";
import Link from "next/link";

type PriceMatchSectionProps = {
  opsReady: boolean;
  variant?: "teaser" | "page";
};

const benefits = [
  "We match any verifiable competitor price with clear documentation.",
  "Bulk and commercial quote requests get a faster review path.",
  "Confirmed price-match orders are handled by the same sales team.",
];

const trustBadges = [
  { Icon: Trophy, label: "Lowest Price", sub: "Or we beat it" },
  { Icon: Timer, label: "Same-Day Response", sub: "We reply fast" },
  { Icon: Handshake, label: "Beat or Match", sub: "Every competitor quote" },
  { Icon: Truck, label: "Free Shipping", sub: "Every order" },
] as const;

const initialForm = {
  name: "",
  email: "",
  phone: "",
  competitor: "",
  details: "",
  notes: "",
};

type SubmissionState = "idle" | "submitting" | "success" | "error";

export function PriceMatchSection({ opsReady, variant = "teaser" }: PriceMatchSectionProps) {
  const isPage = variant === "page";
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Partial<typeof initialForm>>({});
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [state, setState] = useState<SubmissionState>("idle");
  const [responseEmail, setResponseEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useInView<HTMLDivElement>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const e: Partial<typeof initialForm> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.competitor.trim()) e.competitor = "Required";
    if (!form.details.trim()) e.details = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setState("submitting");
    setErrorMessage("");

    const notes = [
      `Competitor: ${form.competitor}`,
      `Quote Details: ${form.details}`,
      form.notes ? `Notes: ${form.notes}` : null,
      `Phone: ${form.phone}`,
      uploadedFile ? `Attachment: ${uploadedFile.name} (${(uploadedFile.size / 1024).toFixed(1)} KB)` : null,
    ].filter(Boolean).join("\n");

    try {
      const opsApiUrl = process.env.NEXT_PUBLIC_OPS_API_URL;
      if (opsApiUrl) {
        await fetch(`${opsApiUrl}/api/v1/quotes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerName: form.name, email: form.email, notes }),
        });
      }
      setResponseEmail(form.email);
      setState("success");
    } catch {
      setState("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  const handleReset = () => {
    setState("idle");
    setShowForm(false);
    setForm(initialForm);
    setErrors({});
    setUploadedFile(null);
    setErrorMessage("");
  };

  const Wrapper = isPage ? "div" : "section";
  const wrapperClass = isPage ? "" : "page-section bg-shell";

  return (
    <Wrapper className={wrapperClass}>
      <div ref={contentRef} data-animate className={isPage ? "" : "content-shell"}>
        <SectionHeader>
          <div>
            {!isPage && (
              <p className="group flex items-center gap-4 text-xs font-bold uppercase tracking-[0.35em] text-olive">
                <span className="block h-px w-10 bg-olive transition-all duration-300 group-hover:w-16" />
                Price Match Guarantee
              </p>
            )}
            {isPage ? (
              <PageTitle className="max-w-3xl">
                We&apos;ll match any competitor&apos;s price.
              </PageTitle>
            ) : (
              <SectionTitle className="max-w-3xl">
                We&apos;ll match any competitor&apos;s price.
              </SectionTitle>
            )}
            <SectionCopy className="max-w-2xl">
              Found the same blind for less? Share the quote and our team will review it without
              haggling or hidden fine print.
            </SectionCopy>
          </div>
          <div className="flex flex-wrap gap-3">
            {isPage ? null : (
              <Button asChild variant="accent">
                <Link href="/price-match">Submit a Competitor Quote</Link>
              </Button>
            )}
            <Button asChild variant="secondary">
              <Link href="/contact">Talk to Sales</Link>
            </Button>
          </div>
        </SectionHeader>

        {isPage ? (
          /* ── Page variant: form-first two-column layout ── */
          <div className="mt-10 grid gap-12 border-t border-black/8 pt-10 lg:grid-cols-[1fr_320px] lg:items-start">

            {/* Primary: form or success */}
            {state === "success" ? (
              <div className="flex items-start gap-4">
                <CheckCircle className="mt-0.5 h-6 w-6 shrink-0 text-olive" />
                <div>
                  <p className="font-semibold text-slate">Quote received — we&apos;re on it.</p>
                  <p className="mt-1 text-sm leading-6 text-slate/68">
                    We received your competitor quote and will respond with our best price. Check your
                    email at <span className="font-semibold text-slate">{responseEmail}</span>.
                  </p>
                  <button
                    onClick={handleReset}
                    className="mt-4 text-sm font-semibold text-brass transition-colors hover:text-olive"
                  >
                    Submit another quote
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <Label variant="utility">Your Name *</Label>
                    <Input name="name" value={form.name} onChange={handleChange} placeholder="Jane Smith" aria-invalid={!!errors.name} />
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                  </label>
                  <label className="grid gap-2">
                    <Label variant="utility">Email *</Label>
                    <Input type="email" name="email" value={form.email} onChange={handleChange} placeholder="jane@example.com" aria-invalid={!!errors.email} />
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                  </label>
                  <label className="grid gap-2">
                    <Label variant="utility">Phone *</Label>
                    <Input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="(555) 000-0000" aria-invalid={!!errors.phone} />
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                  </label>
                  <label className="grid gap-2">
                    <Label variant="utility">Competitor Name *</Label>
                    <Input name="competitor" value={form.competitor} onChange={handleChange} placeholder="e.g. Home Depot, Blinds.com" aria-invalid={!!errors.competitor} />
                    {errors.competitor && <p className="text-sm text-red-500">{errors.competitor}</p>}
                  </label>
                </div>

                <div className="mt-4 grid gap-2">
                  <Label variant="utility">Their Quote / Price Details *</Label>
                  <Textarea
                    name="details"
                    value={form.details}
                    onChange={handleChange}
                    rows={3}
                    maxLength={500}
                    placeholder="Product name, size, price, and any other details from their quote…"
                    aria-invalid={!!errors.details}
                  />
                  {errors.details && <p className="text-sm text-red-500">{errors.details}</p>}
                </div>

                <div className="mt-4 grid gap-2">
                  <Label variant="utility">
                    Upload Quote{" "}
                    <span className="font-normal text-slate/70">(PDF or image — optional)</span>
                  </Label>
                  <div className="flex items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.webp"
                      onChange={(e) => setUploadedFile(e.target.files?.[0] ?? null)}
                      className="hidden"
                    />
                    <Button type="button" variant="default" onClick={() => fileInputRef.current?.click()}>
                      <UploadSimple className="h-4 w-4" />
                      Upload Quote
                    </Button>
                    {uploadedFile && (
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="max-w-[200px] truncate text-sm text-slate/68">{uploadedFile.name}</span>
                        <button
                          type="button"
                          onClick={() => { setUploadedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                          className="shrink-0 text-slate/40 transition-colors hover:text-slate"
                          aria-label="Remove file"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid gap-2">
                  <Label variant="utility">
                    Additional Notes{" "}
                    <span className="font-normal text-slate/70">(optional)</span>
                  </Label>
                  <Textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={2}
                    maxLength={500}
                    placeholder="Anything else we should know…"
                  />
                </div>

                {state === "error" && (
                  <p className="mt-4 text-sm leading-6 text-red-700">{errorMessage}</p>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button type="submit" variant="accent" disabled={state === "submitting"}>
                    {state === "submitting" ? "Sending…" : "Submit Quote Request"}
                  </Button>
                </div>
              </form>
            )}

            {/* Sidebar: trust badges + benefits */}
            <div className="border-t border-black/8 pt-8 lg:border-t-0 lg:border-l lg:border-black/8 lg:pl-10 lg:pt-0">
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                {trustBadges.map(({ Icon, label, sub }) => (
                  <div key={label} className="flex items-start gap-3">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-olive" weight="light" />
                    <div>
                      <p className="text-sm font-semibold text-slate">{label}</p>
                      <p className="text-xs text-slate/55">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-0 border-t border-black/8 pt-6">
                {benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="flex gap-3 border-b border-black/8 py-4 first:pt-0 last:border-b-0"
                  >
                    <Check className="mt-1 h-4 w-4 shrink-0 text-olive" />
                    <p className="text-sm leading-6 text-slate/75">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ── Teaser variant: original homepage layout ── */
          <>
            {/* Trust badges */}
            <div className="mt-8 mb-4 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-black/8 pt-8 sm:grid-cols-4">
              {trustBadges.map(({ Icon, label, sub }) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-olive" weight="light" />
                  <div>
                    <p className="text-sm font-semibold text-slate">{label}</p>
                    <p className="text-xs text-slate/55">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Benefits + contact hints */}
            <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-center">
              <div className="grid gap-0">
                {benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="flex gap-4 border-b border-black/8 py-5 first:pt-0 last:border-b-0"
                  >
                    <Check className="mt-1 h-5 w-5 shrink-0 text-olive" />
                    <p className="text-base leading-7 text-slate/80">{benefit}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-5 border-t border-black/10 pt-8 text-sm leading-6 text-slate/68 lg:border-t-0 lg:border-l lg:pl-10 lg:pt-0">
                <div className="flex gap-3">
                  <EnvelopeSimple className="mt-0.5 h-5 w-5 shrink-0 text-brass" />
                  <p>
                    {opsReady
                      ? "Submit the competitor quote and we will contact you with a confirmed next step."
                      : "Send us the competitor details and we will respond within one business day."}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brass" />
                  <p>Prefer a live review? Contact the sales team and we will walk through it with you.</p>
                </div>
              </div>
            </div>

            {/* Inline form */}
            {showForm && state !== "success" && (
              <div className="mt-10 border-t border-black/8 pt-10">
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-slate/60">
                    Submit a Competitor Quote
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-slate/40 transition-colors hover:text-slate"
                    aria-label="Close form"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2">
                      <Label variant="utility">Your Name *</Label>
                      <Input name="name" value={form.name} onChange={handleChange} placeholder="Jane Smith" aria-invalid={!!errors.name} />
                      {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </label>
                    <label className="grid gap-2">
                      <Label variant="utility">Email *</Label>
                      <Input type="email" name="email" value={form.email} onChange={handleChange} placeholder="jane@example.com" aria-invalid={!!errors.email} />
                      {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </label>
                    <label className="grid gap-2">
                      <Label variant="utility">Phone *</Label>
                      <Input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="(555) 000-0000" aria-invalid={!!errors.phone} />
                      {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                    </label>
                    <label className="grid gap-2">
                      <Label variant="utility">Competitor Name *</Label>
                      <Input name="competitor" value={form.competitor} onChange={handleChange} placeholder="e.g. Home Depot, Blinds.com" aria-invalid={!!errors.competitor} />
                      {errors.competitor && <p className="text-sm text-red-500">{errors.competitor}</p>}
                    </label>
                  </div>

                  <div className="mt-4 grid gap-2">
                    <Label variant="utility">Their Quote / Price Details *</Label>
                    <Textarea
                      name="details"
                      value={form.details}
                      onChange={handleChange}
                      rows={3}
                      maxLength={500}
                      placeholder="Product name, size, price, and any other details from their quote…"
                      aria-invalid={!!errors.details}
                    />
                    {errors.details && <p className="text-sm text-red-500">{errors.details}</p>}
                  </div>

                  <div className="mt-4 grid gap-2">
                    <Label variant="utility">
                      Upload Quote{" "}
                      <span className="font-normal text-slate/70">(PDF or image — optional)</span>
                    </Label>
                    <div className="flex items-center gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.webp"
                        onChange={(e) => setUploadedFile(e.target.files?.[0] ?? null)}
                        className="hidden"
                      />
                      <Button type="button" variant="default" onClick={() => fileInputRef.current?.click()}>
                        <UploadSimple className="h-4 w-4" />
                        Upload Quote
                      </Button>
                      {uploadedFile && (
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="max-w-[200px] truncate text-sm text-slate/68">{uploadedFile.name}</span>
                          <button
                            type="button"
                            onClick={() => { setUploadedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                            className="shrink-0 text-slate/40 transition-colors hover:text-slate"
                            aria-label="Remove file"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2">
                    <Label variant="utility">
                      Additional Notes{" "}
                      <span className="font-normal text-slate/70">(optional)</span>
                    </Label>
                    <Textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      rows={2}
                      maxLength={500}
                      placeholder="Anything else we should know…"
                    />
                  </div>

                  {state === "error" && (
                    <p className="mt-4 text-sm leading-6 text-red-700">{errorMessage}</p>
                  )}

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button type="submit" variant="accent" disabled={state === "submitting"}>
                      {state === "submitting" ? "Sending…" : "Submit Quote Request"}
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Success state (teaser) */}
            {state === "success" && (
              <div className="mt-10 border-t border-black/8 pt-10">
                <div className="flex items-start gap-4">
                  <CheckCircle className="mt-0.5 h-6 w-6 shrink-0 text-olive" />
                  <div>
                    <p className="font-semibold text-slate">Quote received — we&apos;re on it.</p>
                    <p className="mt-1 text-sm leading-6 text-slate/68">
                      We received your competitor quote and will respond with our best price. Check your
                      email at <span className="font-semibold text-slate">{responseEmail}</span>.
                    </p>
                    <button
                      onClick={handleReset}
                      className="mt-4 text-sm font-semibold text-brass transition-colors hover:text-olive"
                    >
                      Submit another quote
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Wrapper>
  );
}
