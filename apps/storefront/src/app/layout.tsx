import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CustomerProvider } from "@/components/customer/customer-provider";
import { StorefrontProvider } from "@/components/storefront/storefront-provider";
import { CompareBar } from "@/components/storefront/compare-bar";
import { ChatPopup } from "@/components/storefront/chat-popup";
import { BackToTop } from "@/components/storefront/back-to-top";
import { NavigationProgressBar } from "@/components/storefront/navigation-progress-bar";
import { OrderStatusBanner } from "@/components/storefront/order-status-banner";
import { RecentlyViewedDrawer } from "@/components/storefront/recently-viewed-drawer";
import { SignupPromoPopup } from "@/components/storefront/signup-promo-popup";
import { LanguageProvider } from "@/lib/context/language-context";
import { getSerializedPublicRuntimeConfig } from "@/lib/platform-config";

import "./globals.css";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body-family",
  weight: ["400", "500", "600", "700", "800"],
});

const displayFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-display-family",
  weight: ["500", "600", "700"],
});

export const viewport: Viewport = {
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Classic Same Day Blinds",
  description:
    "Professional ecommerce storefront migration for Classic Same Day Blinds, powered by Next.js and Medusa.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const publicRuntimeConfig = getSerializedPublicRuntimeConfig();

  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${displayFont.variable} font-sans antialiased`}>
        <NavigationProgressBar />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__BLINDS_PUBLIC_CONFIG__ = ${publicRuntimeConfig};`,
          }}
        />
        <LanguageProvider>
          <StorefrontProvider>
            <CustomerProvider>
              <div className="min-h-dvh bg-shell text-slate">
                <OrderStatusBanner />
                <SiteHeader />
                {children}
                <SiteFooter />
                <CompareBar />
                <RecentlyViewedDrawer />
                <SignupPromoPopup />
                <ChatPopup />
                <BackToTop />
              </div>
            </CustomerProvider>
          </StorefrontProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
