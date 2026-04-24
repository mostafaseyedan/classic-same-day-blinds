"use client";
import { Breadcrumbs } from "@blinds/ui";
import { Button } from "@blinds/ui";
import { Input } from "@blinds/ui";
import { Label } from "@blinds/ui";
import { FormShell, SectionPanel, SurfaceMuted } from "@blinds/ui";
import { Eyebrow, PageCopy, TaskPageTitle } from "@blinds/ui";

import Link from "next/link";
import { useState } from "react";

import { useCustomer } from "@/components/customer/customer-provider";

export default function ForgotPasswordPage() {
  const { requestPasswordReset, commerceEnabled } = useCustomer();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await requestPasswordReset(email.trim());
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send reset email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page-section pb-20 pt-10">
      <div className="content-shell max-w-6xl">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Sign In", href: "/auth" },
            { label: "Password Reset" },
          ]}
        />
        <SectionPanel as="section" className="px-6 py-10 md:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <div>
              <Eyebrow>Account Recovery</Eyebrow>
              <TaskPageTitle>
                Get a secure password reset link.
              </TaskPageTitle>
              <PageCopy className="max-w-[34rem]">
                Enter the email tied to your customer account. We will send a short-lived reset link
                so you can choose a new password without contacting support.
              </PageCopy>

              <div className="mt-8 border-t border-black/6 pt-6">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brass">
                  Security note
                </p>
                <div className="mt-4 grid gap-4">
                  {[
                    "Reset links expire after 15 minutes.",
                    "We do not confirm whether an email exists on the storefront.",
                    "Use the newest reset email if you request more than one link.",
                  ].map((item) => (
                    <div key={item} className="border-t border-black/6 pt-4 first:border-t-0 first:pt-0">
                      <p className="text-sm leading-6 text-slate/76">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <FormShell>
            {!commerceEnabled ? (
              <p className="mt-6 text-sm leading-6 text-slate/72">
                Customer account recovery is not available in this environment yet.
              </p>
            ) : submitted ? (
              <SurfaceMuted className="px-6 py-6">
                <p className="text-sm font-semibold text-slate">Check your email</p>
                <p className="mt-2 text-sm leading-6 text-slate/72">
                  If an account exists for <strong>{email}</strong>, you will receive a password
                  reset link shortly.
                </p>
                <Button asChild variant="secondary" className="mt-4 text-sm">
                  <Link href="/auth">
                    Back to sign in
                  </Link>
                </Button>
              </SurfaceMuted>
            ) : (
              <form className="grid gap-4" onSubmit={handleSubmit}>
                <p className="text-sm leading-6 text-slate/72">
                  Enter your account email and we will send you a link to reset your password.
                </p>
                <label className="grid gap-2">
                  <Label as="span" variant="default">Email address</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    placeholder="you@example.com"
                  />
                </label>
                <Button
                  type="submit"
                  disabled={isSubmitting || !email.trim()}
                  variant="default"
                >
                  {isSubmitting ? "Sending..." : "Send reset link"}
                </Button>
                {error ? (
                  <SurfaceMuted className="border-red-200 px-4 py-3 text-sm leading-6 text-red-700">
                    {error}
                  </SurfaceMuted>
                ) : null}
                <Link href="/auth" className="text-center text-sm text-slate/60 hover:text-slate transition">
                  Back to sign in
                </Link>
              </form>
            )}
            </FormShell>
          </div>
        </SectionPanel>
      </div>
    </main>
  );
}
