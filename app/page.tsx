import NavBar from "./components/NavBar";
import CursorGlow from "./components/CursorGlow";
import HeroSection from "./components/HeroSection";
import ManifestoSection from "./components/ManifestoSection";
import StatsSection from "./components/StatsSection";
import MarketSection from "./components/MarketSection";
import PlatformSection from "./components/PlatformSection";
import IntelligenceSection from "./components/IntelligenceSection";
import InstitutionalSection from "./components/InstitutionalSection";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <CursorGlow />
      <NavBar />
      <main>
        <HeroSection />
        <ManifestoSection />
        <StatsSection />
        <MarketSection />
        <PlatformSection />
        <IntelligenceSection />
        <InstitutionalSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
