import { Button } from "@blinds/ui";
import { Badge } from "@blinds/ui";
import { SurfaceCard, SurfaceMuted } from "@blinds/ui";
import Link from "next/link";

const benefits = [
  "Fast shipping and familiar checkout for marketplace buyers",
  "Thousands of buyer reviews and lower-friction reorder behavior",
  "Useful channel for stock-focused SKUs and replenishment purchases",
  "Keeps Amazon as a trust signal without making it the core storefront",
];

const marketplaceProducts = [
  "Cordless Roller Shades",
  '2" Faux Wood Blinds',
  '1" Vinyl Blinds',
  "Motorized Blinds",
];

export function AmazonBanner() {
  return (
    <section className="px-6 py-16 md:px-10 lg:px-14">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-container bg-[linear-gradient(135deg,#1a1d21_0%,#252a2f_42%,#111418_100%)] shadow-[0_32px_90px_rgba(17,25,34,0.24)]">
        <div className="grid gap-10 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
          <div className="text-shell">
            <Badge variant="soft-light" className="border-[#f6b43a]/25 bg-[#f6b43a]/12 text-[#f6b43a]">
              Amazon presence
            </Badge>
            <h2 className="mt-5 font-display text-4xl font-semibold tracking-tight md:text-5xl">
              Keep Amazon in the story, not at the center of the architecture.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-shell/76">
              The legacy homepage used Amazon as a trust and conversion signal. That still matters.
              The new storefront keeps the signal while making your own stack the real home for
              catalog depth, quotes, account workflows, and customer support.
            </p>

            <div className="mt-8 grid gap-3">
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-start gap-3 rounded-card border border-white/10 bg-white/10 px-4 py-4"
                >
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-xl bg-[#f6b43a] text-sm font-bold text-slate">
                    ✓
                  </span>
                  <p className="text-sm leading-6 text-shell/82">{benefit}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="accent" className="bg-[#f6b43a] border-[#f6b43a] hover:bg-[#f2c05c]">
                <a href="https://www.amazon.com" target="_blank" rel="noreferrer">
                  Shop on Amazon
                </a>
              </Button>
              <Button asChild variant="secondary-light">
                <Link href="/products">Shop direct</Link>
              </Button>
            </div>
          </div>

          <SurfaceCard className="p-6 text-slate shadow-[0_20px_60px_rgba(17,25,34,0.18)]">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-media bg-[#f6b43a] text-lg font-bold text-slate">
                a
              </span>
              <div>
                <p className="text-lg font-semibold">Marketplace Storefront</p>
                <p className="text-sm text-slate/65">Official channel for stock-friendly SKUs</p>
              </div>
              <Badge variant="soft" className="ml-auto border-emerald-200 bg-emerald-100 text-emerald-700">
                4.8 / 5
              </Badge>
            </div>

            <div className="mt-5 overflow-hidden rounded-media border border-black/6">
              <img
                src="/images/home/amazon-banner-product.jpg"
                alt="Marketplace assortment preview"
                className="h-56 w-full object-cover object-center"
              />
            </div>

            <div className="mt-5 space-y-3">
              {marketplaceProducts.map((product) => (
                <SurfaceMuted key={product} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-medium text-slate">{product}</span>
                  <Badge variant="soft" className="border-[#f6b43a]/20 bg-[#f6b43a]/14 text-[#b57b00]">
                    Marketplace
                  </Badge>
                </SurfaceMuted>
              ))}
            </div>

            <SurfaceMuted className="mt-5 border border-dashed border-black/10 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brass">
                Practical use
              </p>
              <p className="mt-2 text-sm leading-6 text-slate/70">
                Good for stock items and quick reorder paths. Keep custom-sizing, quotes, support,
                and account depth in the new storefront.
              </p>
            </SurfaceMuted>
          </SurfaceCard>
        </div>
      </div>
    </section>
  );
}
