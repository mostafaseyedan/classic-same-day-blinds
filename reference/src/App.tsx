import { BrowserRouter, useLocation } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { useEffect } from "react";
import { trackPageView } from "./utils/analytics";
import BackToTop from "./components/feature/BackToTop";
import ChatPopup from "./pages/home/components/ChatPopup";
import OrderStatusBanner from "./components/feature/OrderStatusBanner";
import { captureReferralFromURL } from "./utils/referralProgram";

function AnalyticsTracker() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);
  return null;
}

function ReferralCapture() {
  const location = useLocation();
  useEffect(() => {
    captureReferralFromURL(location.search);
  }, [location.search]);
  return null;
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <LanguageProvider>
          <BrowserRouter basename={__BASE_PATH__}>
            <AnalyticsTracker />
            <ReferralCapture />
            <AppRoutes />
            <BackToTop />
            <ChatPopup />
            <OrderStatusBanner />
          </BrowserRouter>
        </LanguageProvider>
      </AuthProvider>
    </I18nextProvider>
  );
}

export default App;