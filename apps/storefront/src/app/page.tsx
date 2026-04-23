import { BeforeAfterGallery } from "@/components/home/before-after-gallery";
import { CompetitiveAdvantages } from "@/components/home/competitive-advantages";
import { FeaturedProducts } from "@/components/home/featured-products";
import { Hero } from "@/components/home/hero";
import { ShopByRoom } from "@/components/home/shop-by-room";

import { TrustStrip } from "@/components/home/trust-strip";
import { getFeaturedCatalogProducts } from "@/lib/medusa/catalog";
import { getGooglePlaceData } from "@/lib/google-reviews";

import { About } from "@/components/home/about";
import { SameDaySection } from "@/components/home/same-day-section";

export default async function HomePage() {
  const [featuredProducts, googlePlace] = await Promise.all([
    getFeaturedCatalogProducts(4),
    getGooglePlaceData(),
  ]);

  return (
    <main>
      <Hero />
      <TrustStrip />
      <FeaturedProducts products={featuredProducts} />
      <SameDaySection />
      <ShopByRoom />

      <CompetitiveAdvantages />
      <BeforeAfterGallery />
      <About googlePlace={googlePlace} />
    </main>
  );
}
