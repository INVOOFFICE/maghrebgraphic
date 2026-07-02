import Header from '../sections/Header';
import HeroSlider from '../sections/HeroSlider';
import TopSelling from '../sections/TopSelling';
import Testimonials from '../sections/Testimonials';
import Footer from '../sections/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSlider />
        <Testimonials />
        <TopSelling />
      </main>
      <Footer />
    </div>
  );
}
