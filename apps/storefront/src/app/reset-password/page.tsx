"use client";
import { Breadcrumbs } from "@blinds/ui";
import { Button } from "@blinds/ui";
import { Input } from "@blinds/ui";
import { Label } from "@blinds/ui";
import { FormShell, SectionPanel, SurfaceMuted } from "@blinds/ui";
import { Eyebrow, PageCopy, TaskPageTitle } from "@blinds/ui";

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
  const [showPassword, setShowPassword] = useState(false);
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
      <p className="text-sm leading-6 text-slate/72">
        Customer account recovery is not available in this environment yet.
      </p>
    );
  }

  if (!token) {
    return (
      <SurfaceMuted className="px-6 py-6">
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
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <p className="text-sm leading-6 text-slate/72">
        Choose a new password for your customer account. The reset link can only be used for a
        short time.
      </p>
      <label className="grid gap-2">
        <Label as="span" variant="default">New password</Label>
        <Input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoFocus
          minLength={8}
        />
      </label>
      <label className="grid gap-2">
        <Label as="span" variant="default">Confirm password</Label>
        <Input
          type={showPassword ? "text" : "password"}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={8}
        />
      </label>
      <button
        type="button"
        onClick={() => setShowPassword((current) => !current)}
        className="w-fit text-sm font-semibold text-slate/60 transition hover:text-slate"
      >
        {showPassword ? "Hide password" : "Show password"}
      </button>
      <SurfaceMuted className="px-4 py-3 text-sm leading-6 text-slate/68">
        Use at least 8 characters. A longer phrase is easier to remember and harder to guess.
      </SurfaceMuted>
      <Button
        type="submit"
        disabled={isSubmitting || !password || !confirm}
        variant="default"
      >
        {isSubmitting ? "Resetting..." : "Set new password"}
      </Button>
      {error ? (
        <SurfaceMuted className="border-red-200 px-4 py-3 text-sm leading-6 text-red-700">
          {error}
        </SurfaceMuted>
      ) : null}
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="page-section pb-20 pt-10">
      <div className="content-shell max-w-6xl">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Sign In", href: "/auth" },
            { label: "Set Password" },
          ]}
        />
        <SectionPanel as="section" className="px-6 py-10 md:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <div>
              <Eyebrow>Account Recovery</Eyebrow>
              <TaskPageTitle>
                Set a new password.
              </TaskPageTitle>
              <PageCopy className="max-w-[34rem]">
                Finish account recovery by choosing a new password. After it is updated, sign in
                again to open your account.
              </PageCopy>

              <div className="mt-8 border-t border-black/6 pt-6">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brass">
                  Link window
                </p>
                <p className="mt-4 text-sm leading-6 text-slate/76">
                  Reset links are intentionally short-lived. If this link has expired, request a
                  new one and use the most recent email.
                </p>
              </div>
            </div>

            <FormShell>
              <Suspense fallback={<p className="text-sm text-slate/72">Loading reset form...</p>}>
                <ResetPasswordForm />
              </Suspense>
            </FormShell>
          </div>
        </SectionPanel>
      </div>
    </main>
  );
}
