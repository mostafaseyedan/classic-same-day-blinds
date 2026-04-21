"use client";
import { Button } from "@blinds/ui";
import { Input } from "@blinds/ui";
import { SectionPanel, SurfaceMuted } from "@blinds/ui";
import { PageTitle } from "@blinds/ui";

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
        <SectionPanel as="section" className="px-6 py-10 md:px-8">
          <div className="mx-auto max-w-md">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-olive">
              Account Recovery
            </p>
            <PageTitle className="text-4xl md:text-4xl">Reset your password</PageTitle>

            {!commerceEnabled ? (
              <p className="mt-6 text-sm leading-6 text-slate/72">
                Medusa is not configured in this environment.
              </p>
            ) : submitted ? (
              <SurfaceMuted className="mt-8 px-6 py-6">
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
              <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
                <p className="text-sm leading-6 text-slate/72">
                  Enter your account email and we will send you a link to reset your password.
                </p>
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate">Email address</span>
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
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Link href="/auth" className="text-center text-sm text-slate/60 hover:text-slate transition">
                  Back to sign in
                </Link>
              </form>
            )}
          </div>
        </SectionPanel>
      </div>
    </main>
  );
}
