import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import OpenAccountPageContent from "../../components/pages/OpenAccountPageContent";

export const metadata = {
  title: "Open Account — AUREX",
  description: "Apply for an AUREX institutional trading account. Applications reviewed within 24 hours.",
};

export default function OpenAccountPage() {
  return (
    <>
      <NavBar />
      <main>
        <OpenAccountPageContent />
      </main>
      <Footer />
    </>
  );
}
