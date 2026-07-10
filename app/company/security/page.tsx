import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import PageHero from "../../components/PageHero";
import SecurityPageContent from "../../components/pages/SecurityPageContent";

export const metadata = {
  title: "Security — AUREX",
  description: "Military-grade security infrastructure protecting every transaction and portfolio at AUREX.",
};

export default function SecurityPage() {
  return (
    <>
      <NavBar />
      <main>
        <PageHero
          label="Security"
          title="Your assets."
          highlight="Fort Knox standards."
          description="Every layer of AUREX is built with institutional-grade security — from encrypted data at rest to real-time fraud detection and regulatory compliance across 127 jurisdictions."
          accent="#10d48e"
        />
        <SecurityPageContent />
      </main>
      <Footer />
    </>
  );
}
