import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import LegalPageContent from "../../components/pages/LegalPageContent";

export const metadata = {
  title: "Privacy Policy — AUREX",
  description: "How AUREX collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <>
      <NavBar />
      <main>
        <LegalPageContent
          title="Privacy Policy"
          lastUpdated="January 1, 2026"
          sections={[
            {
              heading: "1. Information We Collect",
              body: `We collect information you provide directly, including name, email address, government-issued identification, tax identification numbers, financial information, and trading preferences when you register for an account or use our services.\n\nWe also collect information automatically when you use our platform, including IP addresses, device identifiers, browser type, operating system, usage data, and transaction history.`,
            },
            {
              heading: "2. How We Use Your Information",
              body: `We use collected information to provide, maintain, and improve our services; process transactions and send related information; verify your identity and prevent fraud; comply with legal obligations including KYC and AML requirements; send administrative communications; and provide customer support.\n\nWe do not sell your personal information to third parties.`,
            },
            {
              heading: "3. Information Sharing",
              body: `We share your information with regulatory authorities as required by law (FCA, SEC, MAS and others); service providers who assist in operating our platform under strict confidentiality agreements; professional advisors including lawyers and accountants; and with your consent, other parties you explicitly authorise.`,
            },
            {
              heading: "4. Data Security",
              body: `AUREX employs AES-256 encryption for data at rest, TLS 1.3 for data in transit, multi-factor authentication, continuous security monitoring, and annual third-party SOC 2 Type II audits. We maintain strict access controls with least-privilege principles across all systems.`,
            },
            {
              heading: "5. Data Retention",
              body: `We retain personal data for as long as your account is active and for seven years thereafter as required by financial regulations. Transaction records are retained for ten years. You may request deletion of non-regulated data by contacting our Data Protection Officer.`,
            },
            {
              heading: "6. Your Rights",
              body: `Depending on your jurisdiction, you may have the right to access, correct, delete, or port your personal data; object to or restrict processing; withdraw consent where processing is consent-based; and lodge a complaint with a supervisory authority. Contact privacy@aurex.com to exercise these rights.`,
            },
            {
              heading: "7. Cookies",
              body: `We use essential cookies for platform functionality, analytical cookies to understand usage patterns, and security cookies to detect fraud. You can manage cookie preferences through our cookie settings. Disabling certain cookies may affect platform functionality.`,
            },
            {
              heading: "8. Contact",
              body: `Questions about this policy should be directed to our Data Protection Officer at privacy@aurex.com or AUREX Capital Markets Ltd, 1 Canada Square, London, E14 5AB, United Kingdom.`,
            },
          ]}
        />
      </main>
      <Footer />
    </>
  );
}
