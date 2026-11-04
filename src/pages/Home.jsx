import Navbar from '../components/Navbar/Navbar';
import HeroSlider from '../components/HeroSlider/HeroSlider';
import TrustBar from '../components/TrustBar/TrustBar';
import CropShowcase from '../components/CropShowcase';
import HowItWorks from '../components/HowItWorks/HowItWorks';
import SellOnWhatsApp from '../components/SellOnWhatsApp/SellOnWhatsApp';
import Features from '../components/Features/Features';
import Impact from '../components/Impact/Impact';
import ContactSection from '../components/ContactSection/ContactSection';
import FinalCta from '../components/FinalCta/FinalCta';
import Footer from '../components/Footer/Footer';

const Home = () => {
  return (
    <>
      <Navbar />
      <main>
        {/* Animated Hero Banner Slider */}
        <HeroSlider />

        {/* Trust Badges & Verified Standards */}
        <TrustBar />

        {/* Crops on RaithaMarga Showcase */}
        <CropShowcase />

        {/* How It Works Flow */}
        <HowItWorks />

        {/* Sell On WhatsApp Section (Preserved) */}
        <SellOnWhatsApp />

        {/* Features & Why RaithaMarga */}
        <Features />

        {/* Impact Numbers */}
        <Impact />

        {/* Contact Desk */}
        <ContactSection />

        {/* Final CTA */}
        <FinalCta />
      </main>
      <Footer />
    </>
  );
};

export default Home;
