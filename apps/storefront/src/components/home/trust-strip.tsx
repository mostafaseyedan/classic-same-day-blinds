import { Seal, Buildings, MapPin, Truck, Lightning } from "@phosphor-icons/react/ssr";
import { AnimateOnScroll } from "@/components/animate-on-scroll";

const trustItems = [
  {
    icon: Truck,
    label: "Free shipping on every order",
  },
  {
    icon: Lightning,
    label: "Same-day DFW fulfillment on eligible stock items",
  },
  {
    icon: Buildings,
    label: "Residential orders with trade and bulk support",
  },
  {
    icon: MapPin,
    label: "Local Bedford, Texas showroom",
  },
  {
    icon: Seal,
    label: "Free samples and measuring help before you buy",
  },
] as const;

export function TrustStrip() {
  return (
    <section className="relative z-30 w-full bg-slate py-4 sm:py-5">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 md:px-12 lg:px-16">
        <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {trustItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 border-white/10 py-1 transition-opacity hover:opacity-80 xl:border-l xl:pl-6 xl:first:border-l-0 xl:first:pl-0"
            >
              <div className="text-brass">
                <item.icon className="h-5 w-5" weight="light" />
              </div>
              <p className="text-[0.82rem] font-medium leading-[1.4] text-shell sm:text-[0.88rem] lg:text-[0.92rem]">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
