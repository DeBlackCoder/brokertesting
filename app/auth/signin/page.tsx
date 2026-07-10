import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import SignInPageContent from "../../components/pages/SignInPageContent";

export const metadata = {
  title: "Sign In — AUREX",
  description: "Sign in to your AUREX account.",
};

export default function SignInPage() {
  return (
    <>
      <NavBar />
      <main>
        <SignInPageContent />
      </main>
      <Footer />
    </>
  );
}
