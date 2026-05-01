import { CheckoutPage } from "@/components/checkout/checkout-page";
import { Breadcrumbs } from "@blinds/ui";

export default function CheckoutRoutePage() {
  return (
    <main className="page-section pb-20 pt-10">
      <div className="mx-auto max-w-7xl">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Cart", href: "/cart" },
            { label: "Checkout" },
          ]}
        />
        <CheckoutPage />
      </div>
    </main>
  );
}
