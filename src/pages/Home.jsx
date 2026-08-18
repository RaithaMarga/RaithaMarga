import Navbar from '../components/Navbar/Navbar';
import Hero from '../components/Hero/Hero';
import Features from '../components/Features/Features';

const Home = () => {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
      </main>
    </>
  );
};

export default Home;
