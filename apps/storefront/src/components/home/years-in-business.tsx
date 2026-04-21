import { Button } from "@blinds/ui";
import Link from "next/link";

const stats = [
  { value: "30+", label: "Years in business" },
  { value: "4.9", label: "Google review target" },
  { value: "DFW", label: "Core same-day focus" },
  { value: "Free", label: "Shipping on every order" },
];

export function YearsInBusiness() {
  return (
    <section className="bg-olive px-6 py-14 text-shell md:px-10 lg:px-14">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brass/88">
              Established Business
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Trusted by homeowners and property managers for over 30 years.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-shell/76">
              From single-room installs to bulk hotel and apartment orders, Classic Same Day Blinds
              has been the DFW area&#39;s go-to source for quality, affordable window treatments.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="accent">
                <Link href="/contact">
                  Talk to the Team
                </Link>
              </Button>
              <Button asChild variant="secondary-light"><a
                href="https://www.google.com/maps/place/Classic+Same+Day+Blinds+LLC/"
                target="_blank"
                rel="noreferrer"
              >
                Google Business Profile
              </a></Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur"
              >
                <p className="text-4xl font-semibold text-white">{stat.value}</p>
                <p className="mt-2 text-sm uppercase tracking-[0.16em] text-shell/58">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
