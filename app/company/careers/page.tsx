import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import PageHero from "../../components/PageHero";
import CareersPageContent from "../../components/pages/CareersPageContent";

export const metadata = {
  title: "Careers — AUREX",
  description: "Join the team building the future of institutional finance.",
};

export default function CareersPage() {
  return (
    <>
      <NavBar />
      <main>
        <PageHero
          label="Careers"
          title="Build the future"
          highlight="of wealth."
          description="We're a team of engineers, traders, and designers solving problems that matter. If you want to work on infrastructure used by the world's largest institutions, this is the place."
          accent="#10d48e"
        />
        <CareersPageContent />
      </main>
      <Footer />
    </>
  );
}
