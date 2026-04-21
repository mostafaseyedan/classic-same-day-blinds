"use client";

import {
  Phone,
  Envelope,
  MapPin,
  Clock,
} from "@phosphor-icons/react";
import { Eyebrow } from "@blinds/ui";
import { cn } from "@blinds/ui";
import { CONTACT_FACTS, type ContactFact } from "@/components/storefront/contact-facts";

const CONTACT_ICONS = {
  phone: Phone,
  email: Envelope,
  location: MapPin,
  hours: Clock,
} as const;

interface ContactInfoProps {
  className?: string;
  variant?: "light" | "dark";
  itemClassName?: string;
  facts?: readonly ContactFact[];
}

export function ContactInfo({
  className,
  variant = "light",
  itemClassName,
  facts = CONTACT_FACTS,
}: ContactInfoProps) {
  return (
    <div className={cn("space-y-7", className)}>
      {facts.map((fact) => {
        const Icon = CONTACT_ICONS[fact.icon];

        return (
          <div key={fact.title} className={cn("flex items-start gap-4", itemClassName)}>
            <Icon className="mt-1 h-5 w-5 shrink-0 text-brass" />
            <div className="min-w-0">
              <Eyebrow as="p" className={cn(variant === "light" ? "text-white/50" : "text-slate/40")}>
                {fact.title}
              </Eyebrow>
              {fact.href ? (
                <a
                  href={fact.href}
                  target={fact.href.startsWith("http") ? "_blank" : undefined}
                  rel={fact.href.startsWith("http") ? "noopener noreferrer nofollow" : undefined}
                  className={cn(
                    "mt-1 block text-base font-semibold transition hover:text-brass",
                    variant === "light" ? "text-white" : "text-slate"
                  )}
                >
                  {fact.detail}
                </a>
              ) : (
                <p
                  className={cn(
                    "mt-1 text-base font-semibold",
                    variant === "light" ? "text-white" : "text-slate"
                  )}
                >
                  {fact.detail}
                </p>
              )}
              <p
                className={cn(
                  "mt-1 text-sm leading-6",
                  variant === "light" ? "text-white/58" : "text-slate/50"
                )}
              >
                {fact.helper}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
