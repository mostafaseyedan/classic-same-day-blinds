import { BeforeAfterGallery } from "@/components/home/before-after-gallery";
import { CompetitiveAdvantages } from "@/components/home/competitive-advantages";
import { FeaturedProducts } from "@/components/home/featured-products";
import { Hero } from "@/components/home/hero";
import { ShopByRoom } from "@/components/home/shop-by-room";
import { TrustStrip } from "@/components/home/trust-strip";
import { About } from "@/components/home/about";
import { SameDaySection } from "@/components/home/same-day-section";
import { WhoWeWorkWith } from "@/components/home/who-we-work-with";
import { PriceMatchSection } from "@/components/home/price-match-section";
import { RoomVisualizerTeaser } from "@/components/home/room-visualizer-teaser";
import { GoogleReviewsSection } from "@/components/home/google-reviews-section";
import { FaqSection } from "@/components/home/faq-section";
import { PhotoGallery } from "@/components/home/photo-gallery";

import { getFeaturedCatalogProducts } from "@/lib/medusa/catalog";
import { getGooglePlaceData } from "@/lib/google-reviews";

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
      <RoomVisualizerTeaser />
      <WhoWeWorkWith />

      <CompetitiveAdvantages />
      <PriceMatchSection opsReady={true} />

      <BeforeAfterGallery />
      <PhotoGallery />
      <About googlePlace={googlePlace} />

      <GoogleReviewsSection googlePlace={googlePlace} />

      <FaqSection />
    </main>
  );
}
