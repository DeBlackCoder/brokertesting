import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";
import MarketsPageContent from "../components/pages/MarketsPageContent";

export const metadata = {
  title: "Markets — AUREX",
  description: "Trade 40,000+ instruments across equities, forex, derivatives, digital assets and commodities.",
};

export default function MarketsPage() {
  return (
    <>
      <NavBar />
      <main>
        <PageHero
          label="Global Markets"
          title="Every asset class."
          highlight="One account."
          description="Access 40,000+ instruments across equities, currencies, commodities, and digital assets — all with institutional-grade execution and fractional spreads."
          accent="#10d48e"
        />
        <MarketsPageContent />
      </main>
      <Footer />
    </>
  );
}
