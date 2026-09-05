import { Navbar } from "../components/home/Navbar";
import { SecondaryNav } from "../components/home/SecondaryNav";
import { HeroCarousel } from "../components/home/HeroCarousel";
import { CategoriesSection } from "../components/home/CategoriesSection";
import { Footer } from "../components/home/Footer";

export function HomePage() {
  return (
    <div className="home-page">
      <Navbar />
      <SecondaryNav />

      <main className="home-main">
        <HeroCarousel />
        <CategoriesSection />
      </main>

      <Footer />
    </div>
  );
}
