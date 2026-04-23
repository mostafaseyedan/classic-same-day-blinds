import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SameDayBanner from './components/SameDayBanner';
import BusinessInfo from './components/BusinessInfo';
import WhoWeWorkWith from './components/WhoWeWorkWith';
import AmazonBanner from './components/AmazonBanner';
import YearsInBusiness from './components/YearsInBusiness';
import Categories from './components/Categories';
import ShopByRoom from './components/ShopByRoom';
import Products from './components/Products';
import FeaturedProducts from './components/FeaturedProducts';
import BeforeAfterGallery from './components/BeforeAfterGallery';
import PhotoGallery from './components/PhotoGallery';
import ClientStories from './components/ClientStories';
import ComparisonTable from './components/ComparisonTable';
import LoyaltyRewards from './components/LoyaltyRewards';
import PriceMatchGuarantee from './components/PriceMatchGuarantee';
import AffirmBanner from './components/AffirmBanner';
import About from './components/About';
import Contact from './components/Contact';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import AbandonedCartBanner from '../../components/feature/AbandonedCartBanner';
import CompareBar from '../../components/feature/CompareBar';
import TrackOrderWidget from './components/TrackOrderWidget';
import { useLanguage } from '../../contexts/LanguageContext';

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar scrolled={scrolled} />
      <AbandonedCartBanner language={language} />
      <Hero />
      <SameDayBanner />
      <BusinessInfo />
      <PriceMatchGuarantee />
      <AffirmBanner />
      <YearsInBusiness />
      <About />
      <WhoWeWorkWith />
      <Categories />
      <FeaturedProducts />
      <Products />
      <PhotoGallery />
      <ShopByRoom />
      <BeforeAfterGallery />
      <ClientStories />
      <ComparisonTable />
      <LoyaltyRewards />
      <TrackOrderWidget />
      <Contact />
      <AmazonBanner />
      <FAQ />
      <Footer />
      <CompareBar language={language} />
    </div>
  );
}