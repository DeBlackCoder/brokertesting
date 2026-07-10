import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import LegalPageContent from "../../components/pages/LegalPageContent";

export const metadata = {
  title: "Terms of Service — AUREX",
  description: "Terms governing your use of AUREX Capital Markets services.",
};

export default function TermsPage() {
  return (
    <>
      <NavBar />
      <main>
        <LegalPageContent
          title="Terms of Service"
          lastUpdated="January 1, 2026"
          sections={[
            {
              heading: "1. Acceptance of Terms",
              body: `By accessing or using the AUREX platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not access the service. These terms apply to all visitors, users, and clients.`,
            },
            {
              heading: "2. Eligibility",
              body: `AUREX services are available to institutional investors, professional traders, and high-net-worth individuals who meet our minimum account requirements. You must be at least 18 years of age, legally authorised to trade financial instruments in your jurisdiction, and able to demonstrate adequate financial knowledge and risk tolerance.`,
            },
            {
              heading: "3. Account Registration",
              body: `You must provide accurate, complete, and current information during registration. You are responsible for maintaining the confidentiality of your credentials and all activities under your account. Notify us immediately of any unauthorised access at security@aurex.com. AUREX reserves the right to refuse service to any applicant.`,
            },
            {
              heading: "4. Trading Services",
              body: `AUREX provides execution services for financial instruments including equities, forex, derivatives, and digital assets. All trades are subject to market conditions, available liquidity, and applicable regulations. We do not provide investment advice. Past performance is not indicative of future results. Trading involves substantial risk of loss.`,
            },
            {
              heading: "5. Fees and Charges",
              body: `Our fee schedule is available in your account settings and may be updated with 30 days notice. Fees include spreads, overnight financing charges, and withdrawal fees where applicable. We reserve the right to modify our fee structure. You are responsible for any applicable taxes on your trading activity.`,
            },
            {
              heading: "6. Risk Disclosure",
              body: `Trading in leveraged financial instruments involves significant risk. You can lose more than your initial deposit. You should only trade with money you can afford to lose. AUREX strongly recommends reading our Risk Disclosure document before trading. We are not liable for losses resulting from market movements, system downtime, or force majeure events.`,
            },
            {
              heading: "7. Prohibited Activities",
              body: `You may not use AUREX for market manipulation, wash trading, spoofing, layering, or any activity prohibited by applicable law. You may not attempt to breach our security systems, reverse engineer our platform, or use automated systems without prior written consent. Violations may result in immediate account termination and legal action.`,
            },
            {
              heading: "8. Intellectual Property",
              body: `The AUREX platform, brand, technology, and content are owned by AUREX Capital Markets Ltd and protected by international intellectual property laws. You may not copy, reproduce, or distribute any part of our platform without explicit written permission.`,
            },
            {
              heading: "9. Limitation of Liability",
              body: `AUREX's liability is limited to the amount of funds held in your account at the time of the claim. We are not liable for indirect, incidental, special, consequential, or punitive damages. Some jurisdictions do not allow limitation of liability, so these limitations may not apply to you.`,
            },
            {
              heading: "10. Governing Law",
              body: `These terms are governed by the laws of England and Wales. Disputes shall be resolved by binding arbitration under the London Court of International Arbitration rules. You waive any right to participate in class action proceedings.`,
            },
          ]}
        />
      </main>
      <Footer />
    </>
  );
}
