import { WishlistGrid } from "@/components/storefront/wishlist-grid";
import { Eyebrow, PageTitle } from "@blinds/ui";

export default function WishlistPage() {
  return (
    <main className="px-6 pb-24 pt-10 md:px-10 lg:px-14">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <Eyebrow>Saved Products</Eyebrow>
          <PageTitle className="mt-3">
            Your wishlist
          </PageTitle>
          <p className="mt-4 text-base leading-7 text-slate/70">
            Products you've saved for later. They're stored in your browser until you're ready to order.
          </p>
        </div>
        <WishlistGrid />
      </div>
    </main>
  );
}
