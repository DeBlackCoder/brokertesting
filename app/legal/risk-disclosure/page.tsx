import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import LegalPageContent from "../../components/pages/LegalPageContent";

export const metadata = {
  title: "Risk Disclosure — AUREX",
  description: "Important risk information for AUREX clients.",
};

export default function RiskDisclosurePage() {
  return (
    <>
      <NavBar />
      <main>
        <LegalPageContent
          title="Risk Disclosure"
          lastUpdated="January 1, 2026"
          sections={[
            {
              heading: "General Risk Warning",
              body: `Trading in financial instruments carries a high level of risk and may not be suitable for all investors. The value of investments and the income from them can fall as well as rise and you may get back less than you invested. You should consider whether you understand how leveraged products work and whether you can afford to take the high risk of losing your money.`,
            },
            {
              heading: "Leverage Risk",
              body: `Leveraged trading amplifies both potential gains and losses. With leverage of 1:500, a 0.2% adverse move in the underlying instrument results in a 100% loss of your margin. You may lose your entire account balance and be liable for additional amounts. AUREX may close positions without notice if margin requirements are not met.`,
            },
            {
              heading: "Market Risk",
              body: `Financial markets are subject to rapid and unpredictable price movements driven by economic data, geopolitical events, central bank decisions, and market sentiment. No analysis, however sophisticated, can predict market movements with certainty. Gap risk — when prices move significantly between sessions — can result in losses exceeding your margin.`,
            },
            {
              heading: "Liquidity Risk",
              body: `During periods of market stress, low liquidity, or major news events, spreads may widen significantly and orders may be executed at prices substantially different from quoted prices. Certain instruments may become untradeable for extended periods. Slippage is an inherent risk in all trading activity.`,
            },
            {
              heading: "Currency Risk",
              body: `If your account is denominated in a currency different from the instrument you are trading, exchange rate fluctuations will affect your profit and loss. Currency risk applies to all international trading activity and can work against as well as for you.`,
            },
            {
              heading: "Technology Risk",
              body: `Electronic trading platforms are subject to hardware failures, software bugs, network outages, and cyber attacks. While AUREX maintains 99.99% uptime with redundant systems across multiple data centres, we cannot guarantee uninterrupted access. You should maintain alternative means to manage open positions.`,
            },
            {
              heading: "Counterparty Risk",
              body: `AUREX acts as principal in many transactions. Client funds are held in segregated accounts with tier-1 banking institutions. AUREX is regulated and participates in applicable investor compensation schemes. However, the insolvency of AUREX or its banking partners could result in loss of client funds.`,
            },
            {
              heading: "Regulatory Risk",
              body: `Changes in laws, regulations, or tax treatment may adversely affect the value or availability of certain instruments. In some jurisdictions, certain products offered by AUREX may not be available due to local regulatory restrictions.`,
            },
          ]}
        />
      </main>
      <Footer />
    </>
  );
}
