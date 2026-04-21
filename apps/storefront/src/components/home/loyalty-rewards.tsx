import Link from "next/link";
import { Coin, ChartBar, Clock, UserPlus, Gift, Tag, ShareNetwork } from "@phosphor-icons/react/ssr";

const tiers = [
  {
    name: "Bronze",
    pts: "500 – 2,999 pts",
    multiplier: "1×",
    perks: [
      "Every $50 spent = $5 in rewards",
      "Early access to sales",
      "Rewards redeemable at checkout",
    ],
  },
  {
    name: "Silver",
    pts: "3,000 – 9,999 pts",
    multiplier: "1.25×",
    perks: [
      "1.25× earn multiplier on every order",
      "Free expedited shipping",
      "Priority customer support",
    ],
  },
  {
    name: "Gold",
    pts: "10,000 – 24,999 pts",
    multiplier: "1.5×",
    perks: [
      "1.5× earn multiplier on every order",
      "Free same-day shipping",
      "Dedicated account manager",
      "Exclusive promotions",
    ],
  },
  {
    name: "Platinum",
    pts: "25,000+ pts",
    multiplier: "2×",
    featured: true,
    perks: [
      "2× earn multiplier — maximum rewards",
      "Free same-day shipping on every order",
      "Dedicated account manager",
      "VIP-only deals & early product access",
      "Price match priority handling",
    ],
  },
];

const pointDetails = [
  {
    icon: Coin,
    label: "Earning Rate",
    body: "Every $50 spent = $5 in rewards (50 pts). Silver: 1.25× · Gold: 1.5× · Platinum: 2×",
  },
  {
    icon: ChartBar,
    label: "Tier Thresholds",
    body: "Bronze: 500 pts · Silver: 3,000 pts · Gold: 10,000 pts · Platinum: 25,000 pts",
  },
  {
    icon: Clock,
    label: "Points Expiry",
    body: "Points expire 12 months after the order they were earned on, with a 30-day advance notice.",
  },
];

export function LoyaltyRewards() {
  return (
    <section id="loyalty-rewards" className="px-6 py-16 md:px-10 lg:px-14">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-olive">
              Loyalty Program
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-slate md:text-5xl">
              Earn rewards on every order.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate/70">
              Spend to earn points, unlock tiers, and redeem savings directly at checkout —
              plus earn extra when you refer a friend.
            </p>
          </div>
          <Link
            href="/membership"
            className="inline-flex shrink-0 rounded-full border border-slate/10 bg-white px-5 py-3 text-sm font-semibold text-slate transition hover:border-brass hover:text-brass"
          >
            View Membership
          </Link>
        </div>

        {/* Tier Cards */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-[1.5rem] px-6 py-7 transition-[border-color,box-shadow] duration-200 ${
                tier.featured
                  ? "bg-slate text-shell shadow-[0_28px_80px_rgba(23,35,43,0.22)]"
                  : "border border-black/5 bg-white shadow-[0_20px_60px_rgba(24,36,34,0.06)] hover:border-black/10 hover:shadow-[0_24px_68px_rgba(24,36,34,0.085)]"
              }`}
            >
              {tier.featured && (
                <div className="absolute right-5 top-5">
                  <span className="rounded-full bg-brass/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-brass">
                    Top Tier
                  </span>
                </div>
              )}

              <div>
                <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${tier.featured ? "text-brass/80" : "text-brass"}`}>
                  {tier.pts}
                </p>
                <h3 className={`mt-2 font-display text-3xl font-semibold tracking-tight ${tier.featured ? "text-shell" : "text-slate"}`}>
                  {tier.name}
                </h3>
                <div className={`mt-4 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                  tier.featured ? "bg-white/10 text-shell" : "bg-shell text-slate/70"
                }`}>
                  {tier.multiplier} earn rate
                </div>
              </div>

              <ul className={`mt-6 flex-1 space-y-3 border-t pt-6 ${tier.featured ? "border-white/10" : "border-black/5"}`}>
                {tier.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2.5">
                    <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${tier.featured ? "bg-brass" : "bg-olive"}`} />
                    <span className={`text-sm leading-snug ${tier.featured ? "text-shell/78" : "text-slate/70"}`}>
                      {perk}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Points Details + Referral */}
        <div className="mt-8 grid gap-5 lg:grid-cols-2">

          {/* Points Details */}
          <div className="rounded-[1.5rem] border border-black/5 bg-shell px-7 py-7">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-olive">
              Points Details
            </p>
            <div className="mt-6 space-y-5">
              {pointDetails.map((item) => (
                <div key={item.label} className="flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/5 bg-white">
                    <item.icon className="h-4 w-4 text-brass" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate">{item.label}</p>
                    <p className="mt-1 text-sm leading-6 text-slate/70">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Referral */}
          <div className="relative overflow-hidden rounded-[1.5rem] bg-olive px-7 py-7 text-shell">
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/8 blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-shell/80">
                <UserPlus className="h-3.5 w-3.5" />
                Referral Program
              </div>
              <h3 className="mt-5 font-display text-3xl font-semibold tracking-tight">
                Refer a friend.<br />Both of you save.
              </h3>
              <p className="mt-3 max-w-sm text-sm leading-6 text-shell/72">
                Share your unique link. When they place their first order, you each get rewarded — no minimum required.
              </p>

              <div className="mt-7 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-4">
                  <Gift className="h-5 w-5 text-brass" />
                  <p className="mt-3 text-xl font-semibold text-white">$25 Off</p>
                  <p className="mt-0.5 text-xs text-shell/60 uppercase tracking-wide">Your next order</p>
                </div>
                <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-4">
                  <Tag className="h-5 w-5 text-brass" />
                  <p className="mt-3 text-xl font-semibold text-white">10% Off</p>
                  <p className="mt-0.5 text-xs text-shell/60 uppercase tracking-wide">Friend's first order</p>
                </div>
              </div>

              <Link
                href="/account"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/22"
              >
                Get your referral link
                <ShareNetwork className="h-4 w-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
