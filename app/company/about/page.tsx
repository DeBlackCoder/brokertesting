import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import PageHero from "../../components/PageHero";
import AboutPageContent from "../../components/pages/AboutPageContent";

export const metadata = {
  title: "About — AUREX",
  description: "AUREX is redefining what a brokerage can be. Built for the institutions and individuals who shape global markets.",
};

export default function AboutPage() {
  return (
    <>
      <NavBar />
      <main>
        <PageHero
          label="Our Story"
          title="Built for those"
          highlight="who define markets."
          description="AUREX was founded on a single belief: the world's most sophisticated investors deserve infrastructure that matches their ambition."
          accent="#c9a84c"
        />
        <AboutPageContent />
      </main>
      <Footer />
    </>
  );
}
