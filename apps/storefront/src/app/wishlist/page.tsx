import { WishlistGrid } from "@/components/storefront/wishlist-grid";
import { Breadcrumbs, PageTitle } from "@blinds/ui";

export default function WishlistPage() {
  return (
    <main className="page-section pb-24 pt-10">
      <div className="mx-auto max-w-7xl">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Wishlist" },
          ]}
        />
        <div className="mb-10">
          <PageTitle>
            Your wishlist
          </PageTitle>
          <p className="mt-4 text-base leading-7 text-slate/70">
            Products you&apos;ve saved for later. They&apos;re stored in your browser until you&apos;re ready to order.
          </p>
        </div>
        <WishlistGrid />
      </div>
    </main>
  );
}
