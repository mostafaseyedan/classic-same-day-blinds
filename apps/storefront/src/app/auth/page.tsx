"use client";
import { Breadcrumbs } from "@blinds/ui";
import { Button } from "@blinds/ui";
import { Input } from "@blinds/ui";
import { Label } from "@blinds/ui";
import { SegmentedControl } from "@blinds/ui";
import { FormShell, SectionPanel } from "@blinds/ui";
import { Eyebrow, PageCopy, TaskPageTitle } from "@blinds/ui";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCustomer } from "@/components/customer/customer-provider";

type Mode = "login" | "register";

const initialLogin = {
  email: "",
  password: "",
};

const initialRegister = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  password: "",
};

export default function AuthPage() {
  const router = useRouter();
  const { isAuthenticated, customer, login, register, logout, commerceEnabled, error } =
    useCustomer();
  const [mode, setMode] = useState<Mode>("login");
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("reset") === "success") {
      setMode("login");
      setMessage("Password updated. Sign in with your new password.");
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && customer) {
      router.replace("/account");
    }
  }, [customer, isAuthenticated, router]);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      await login(loginForm.email, loginForm.password);
      router.push("/account");
    } catch (submitError) {
      setMessage(submitError instanceof Error ? submitError.message : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      await register(registerForm);
      router.push("/account");
    } catch (submitError) {
      setMessage(
        submitError instanceof Error ? submitError.message : "Unable to create account.",
      );
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
            { label: "Account", href: "/account" },
            { label: "Sign In" },
          ]}
        />
        <SectionPanel as="section" className="px-6 py-10 md:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <div>
              <Eyebrow>Customer Access</Eyebrow>
              <TaskPageTitle>
                Sign in to manage your blinds account.
              </TaskPageTitle>
              <PageCopy className="max-w-[34rem]">
                Access your orders, saved addresses, and account details in one place. Create an
                account to keep future checkout and support requests simpler.
              </PageCopy>

              <div className="mt-8 border-t border-black/6 pt-6">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brass">
                  With an account
                </p>
                <div className="mt-4 grid gap-4">
                  {[
                    "Review order history and current order status.",
                    "Save addresses for faster future checkout.",
                    "Keep profile details and contact information in one place.",
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
                <p className="text-sm leading-6 text-slate/72">
                  Customer sign in is not available in this environment yet.
                </p>
              ) : isAuthenticated && customer ? (
                <div className="space-y-5">
                  <p className="text-sm leading-6 text-slate/72">Opening your account...</p>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => void logout()}
                    className="hover:border-red-400 hover:text-red-700"
                  >
                    Sign out
                  </Button>
                </div>
              ) : (
                <>
                  <SegmentedControl
                    className="mb-6"
                    value={mode}
                    onValueChange={(value) => setMode(value as Mode)}
                    items={[
                      { label: "Sign in", value: "login" },
                      { label: "Create account", value: "register" },
                    ]}
                  />

                  {mode === "login" ? (
                    <form className="grid gap-4" onSubmit={handleLogin}>
                      <label className="grid gap-2">
                        <Label as="span" variant="default">Email</Label>
                        <Input
                          type="email"
                          value={loginForm.email}
                          onChange={(event) =>
                            setLoginForm((current) => ({ ...current, email: event.target.value }))
                          }
                          required
                        />
                      </label>
                      <label className="grid gap-2">
                        <Label as="span" variant="default">Password</Label>
                        <Input
                          type="password"
                          value={loginForm.password}
                          onChange={(event) =>
                            setLoginForm((current) => ({
                              ...current,
                              password: event.target.value,
                            }))
                          }
                          required
                        />
                      </label>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        variant="default"
                      >
                        {isSubmitting ? "Signing in..." : "Sign in"}
                      </Button>
                      <Link
                        href="/forgot-password"
                        className="text-center text-sm text-slate/60 hover:text-slate transition"
                      >
                        Forgot your password?
                      </Link>
                    </form>
                  ) : (
                    <form className="grid gap-4" onSubmit={handleRegister}>
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="grid gap-2">
                          <Label as="span" variant="default">First name</Label>
                          <Input
                            type="text"
                            value={registerForm.firstName}
                            onChange={(event) =>
                              setRegisterForm((current) => ({
                                ...current,
                                firstName: event.target.value,
                              }))
                            }
                          />
                        </label>
                        <label className="grid gap-2">
                          <Label as="span" variant="default">Last name</Label>
                          <Input
                            type="text"
                            value={registerForm.lastName}
                            onChange={(event) =>
                              setRegisterForm((current) => ({
                                ...current,
                                lastName: event.target.value,
                              }))
                            }
                          />
                        </label>
                      </div>
                      <label className="grid gap-2">
                        <Label as="span" variant="default">Phone</Label>
                        <Input
                          type="tel"
                          value={registerForm.phone}
                          onChange={(event) =>
                            setRegisterForm((current) => ({ ...current, phone: event.target.value }))
                          }
                        />
                      </label>
                      <label className="grid gap-2">
                        <Label as="span" variant="default">Email</Label>
                        <Input
                          type="email"
                          value={registerForm.email}
                          onChange={(event) =>
                            setRegisterForm((current) => ({ ...current, email: event.target.value }))
                          }
                          required
                        />
                      </label>
                      <label className="grid gap-2">
                        <Label as="span" variant="default">Password</Label>
                        <Input
                          type="password"
                          value={registerForm.password}
                          onChange={(event) =>
                            setRegisterForm((current) => ({
                              ...current,
                              password: event.target.value,
                            }))
                          }
                          required
                        />
                      </label>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        variant="default"
                      >
                        {isSubmitting ? "Creating..." : "Create account"}
                      </Button>
                    </form>
                  )}
                </>
              )}

              {message || error ? (
                <p className="mt-5 text-sm leading-6 text-olive">{message ?? error}</p>
              ) : null}
            </FormShell>
          </div>
        </SectionPanel>
      </div>
    </main>
  );
}
