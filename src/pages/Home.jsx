import Navbar from '../components/Navbar/Navbar';
import Hero from '../components/Hero/Hero';
import TrustBar from '../components/TrustBar/TrustBar';
import HowItWorks from '../components/HowItWorks/HowItWorks';
import Features from '../components/Features/Features';
import Impact from '../components/Impact/Impact';
import FinalCta from '../components/FinalCta/FinalCta';
import Footer from '../components/Footer/Footer';

const Home = () => {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <HowItWorks />
        <Features />
        <Impact />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
};

export default Home;
