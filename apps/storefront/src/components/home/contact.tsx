"use client";
import {
  Input,
  Button,
  Label,
  Select,
  SectionPanel,
  Textarea,
  Eyebrow,
  EyebrowAccent,
  SectionTitle,
  SectionCopy,
} from "@blinds/ui";

import { ContactInfo } from "@/components/storefront/contact-info";
import { useEffect, useState } from "react";
import {
  CheckCircle,
  NavigationArrow,
} from "@phosphor-icons/react";

export function Contact() {
  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [charCount, setCharCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const messageField = form.querySelector<HTMLTextAreaElement>('textarea[name="message"]');
    if (messageField && messageField.value.length > 500) return;

    setFormStatus("sending");
    setTimeout(() => {
      setFormStatus("success");
      form.reset();
      setCharCount(0);
    }, 1500);
  };

  return (
    <section id="contact" className="page-section bg-shell">
      <div className="content-shell">
        <SectionPanel>
          <div className="grid gap-0 xl:grid-cols-[0.82fr_1.18fr]">
            <div className="relative overflow-hidden bg-slate px-8 py-10 text-white md:px-10 md:py-12">
              <div
                className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(176,125,66,0.22),transparent_40%)]"
                aria-hidden="true"
              />

              <div className="relative">
                <EyebrowAccent as="p">Talk to a Specialist</EyebrowAccent>
                <SectionTitle as="h2" className="mt-4 text-white md:text-5xl">
                  Get real help before you order.
                </SectionTitle>
                <p className="mt-4 max-w-xl text-base leading-7 text-white/74">
                  Measuring questions, style guidance, order help, and DFW showroom support all come through one team.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button variant="secondary-light" asChild className="px-6 py-3.5">
                    <a href="tel:8175409300">Call now</a>
                  </Button>
                  <Button
                    variant="secondary-light"
                    className="px-6 py-3.5"
                    onClick={() => {
                      const chatBtn = document.querySelector<HTMLButtonElement>(
                        '[aria-label="Open live chat"]',
                      );
                      chatBtn?.click();
                    }}
                  >
                    Start live chat
                  </Button>
                </div>

                <ContactInfo className="mt-12 border-t border-white/12 pt-10" />

                <a
                  href="https://maps.google.com/?q=2801+Brasher+Ln,+Bedford,+TX+76021"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brass hover:text-white"
                >
                  <NavigationArrow className="h-4 w-4" />
                  Open maps
                </a>
              </div>
            </div>

            <div className="bg-white px-8 py-10 md:px-10 md:py-12">
              <div className="max-w-2xl">
                <Eyebrow>Send a Message</Eyebrow>
                <SectionTitle as="h3" className="mt-3">
                  Tell us what you are working on.
                </SectionTitle>
                <SectionCopy className="mt-3">
                  Use the form for quotes, product questions, measuring help, or order support.
                </SectionCopy>
              </div>

              {!mounted ? (
                <div className="mt-8 space-y-5 animate-in fade-in duration-300" aria-hidden="true">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <div className="h-3.5 w-24 rounded-full bg-black/6" />
                      <div className="h-11 w-full rounded-full bg-black/6" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3.5 w-28 rounded-full bg-black/6" />
                      <div className="h-11 w-full rounded-full bg-black/6" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3.5 w-24 rounded-full bg-black/6" />
                    <div className="h-11 w-full rounded-full bg-black/6" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3.5 w-20 rounded-full bg-black/6" />
                    <div className="h-11 w-full rounded-full bg-black/6" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="h-3.5 w-24 rounded-full bg-black/6" />
                      <div className="h-3.5 w-14 rounded-full bg-black/6" />
                    </div>
                    <div className="h-32 w-full rounded-xl bg-black/6" />
                  </div>
                  <div className="h-12 w-full rounded-full bg-slate/10" />
                </div>
              ) : formStatus === "success" ? (
                <div className="mt-8 flex flex-col items-start justify-center py-12 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-olive/10">
                    <CheckCircle className="h-8 w-8 text-olive" />
                  </div>
                  <SectionTitle as="h4" className="mt-6">
                    Message sent.
                  </SectionTitle>
                  <SectionCopy className="mt-3 max-w-md">
                    Thanks for reaching out. A specialist will reply to your email within one business day.
                  </SectionCopy>
                  <Button variant="soft" className="mt-8 px-8" onClick={() => setFormStatus("idle")}>
                    Send another
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-6 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label variant="utility" as="span" className="block">
                        Full Name <span className="text-olive">*</span>
                      </Label>
                      <Input type="text" name="name" required placeholder="Jane Smith" />
                    </div>
                    <div className="space-y-2">
                      <Label variant="utility" as="span" className="block">
                        Email Address <span className="text-olive">*</span>
                      </Label>
                      <Input type="email" name="email" required placeholder="jane@example.com" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-[0.62fr_0.38fr]">
                    <div className="space-y-2">
                      <Label variant="utility" as="span" className="block">
                        Subject <span className="text-olive">*</span>
                      </Label>
                      <Select name="subject" required>
                        <option value="">Select a topic…</option>
                        <option value="Pricing & Quote">Pricing &amp; Quote</option>
                        <option value="Order Support">Order Support</option>
                        <option value="Measuring Help">Measuring Help</option>
                        <option value="Installation">Installation</option>
                        <option value="Product Question">Product Question</option>
                        <option value="Same-Day Delivery">Same-Day Delivery</option>
                        <option value="Returns & Warranty">Returns &amp; Warranty</option>
                        <option value="Other">Other</option>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label variant="utility" as="span" className="block">
                        Phone
                      </Label>
                      <Input type="tel" name="phone" placeholder="(817) 555-0100" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label variant="utility" as="span" className="flex justify-between">
                      <span>
                        Message <span className="text-olive">*</span>
                      </span>
                      <span
                        className={`normal-case tracking-normal ${charCount > 480 ? "text-red-500" : "text-slate/50"}`}
                      >
                        {charCount}/500
                      </span>
                    </Label>
                    <Textarea
                      variant="default"
                      name="message"
                      required
                      maxLength={500}
                      placeholder="Describe your window project or question…"
                      onChange={(e) => setCharCount(e.target.value.length)}
                    />
                  </div>

                  <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm leading-6 text-slate/52">
                      Need a faster answer? Call the showroom and we can help live.
                    </p>
                    <Button
                      variant="olive"
                      type="submit"
                      className="px-8"
                      disabled={formStatus === "sending" || charCount > 500}
                    >
                      {formStatus === "sending" ? "Sending…" : "Send message"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </SectionPanel>
      </div>
    </section>
  );
}
