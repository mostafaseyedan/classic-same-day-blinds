"use client";
import { Button } from "@blinds/ui";
import { Input } from "@blinds/ui";
import { SectionPanel, SurfaceMuted } from "@blinds/ui";
import { PageTitle } from "@blinds/ui";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { useCustomer } from "@/components/customer/customer-provider";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { resetPassword, commerceEnabled } = useCustomer();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await resetPassword(token, password);
      router.push("/auth?reset=success");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reset password. The link may have expired.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!commerceEnabled) {
    return (
      <p className="mt-6 text-sm leading-6 text-slate/72">
        Medusa is not configured in this environment.
      </p>
    );
  }

  if (!token) {
    return (
      <SurfaceMuted className="mt-8 px-6 py-6">
        <p className="text-sm font-semibold text-slate">Invalid reset link</p>
        <p className="mt-2 text-sm leading-6 text-slate/72">
          This reset link is missing a token. Please request a new password reset.
        </p>
        <Button asChild variant="secondary" className="mt-4 text-sm">
          <Link href="/forgot-password">
            Request new link
          </Link>
        </Button>
      </SurfaceMuted>
    );
  }

  return (
    <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
      <p className="text-sm leading-6 text-slate/72">Enter your new password below.</p>
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-slate">New password</span>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoFocus
          minLength={8}
        />
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-slate">Confirm password</span>
        <Input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={8}
        />
      </label>
      <Button
        type="submit"
        disabled={isSubmitting || !password || !confirm}
        variant="default"
      >
        {isSubmitting ? "Resetting..." : "Set new password"}
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="page-section pb-20 pt-10">
      <div className="content-shell max-w-6xl">
        <SectionPanel as="section" className="px-6 py-10 md:px-8">
          <div className="mx-auto max-w-md">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-olive">
              Account Recovery
            </p>
            <PageTitle className="text-4xl md:text-4xl">Set a new password</PageTitle>
            <Suspense fallback={<p className="mt-6 text-sm text-slate/72">Loading...</p>}>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </SectionPanel>
      </div>
    </main>
  );
}
