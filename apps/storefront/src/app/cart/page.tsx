import { CartPage } from "@/components/cart/cart-page";
import { Breadcrumbs } from "@blinds/ui";

export default function CartRoutePage() {
  return (
    <main className="px-6 pb-20 pt-10 md:px-10 lg:px-14">
      <div className="mx-auto max-w-7xl">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Cart" },
          ]}
        />
        <CartPage />
      </div>
    </main>
  );
}
