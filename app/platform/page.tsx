import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";
import PlatformPageContent from "../components/pages/PlatformPageContent";

export const metadata = {
  title: "Platform — AUREX",
  description: "The most advanced trading infrastructure ever built for professional traders and institutions.",
};

export default function PlatformPage() {
  return (
    <>
      <NavBar />
      <main>
        <PageHero
          label="The Platform"
          title="Engineered for"
          highlight="those who lead."
          description="Sub-millisecond execution, real-time risk analytics, AI signal intelligence — all from a single terminal designed for the world's most demanding traders."
          accent="#c9a84c"
        />
        <PlatformPageContent />
      </main>
      <Footer />
    </>
  );
}
