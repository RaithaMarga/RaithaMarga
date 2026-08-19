import Navbar from '../components/Navbar/Navbar';
import Hero from '../components/Hero/Hero';
import HowItWorks from '../components/HowItWorks/HowItWorks';
import Features from '../components/Features/Features';
import Impact from '../components/Impact/Impact';
import Footer from '../components/Footer/Footer';

const Home = () => {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Impact />
      </main>
      <Footer />
    </>
  );
};

export default Home;
