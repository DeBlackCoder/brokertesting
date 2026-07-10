import { Suspense } from "react";
import VerifyEmailContent from "../../components/pages/VerifyEmailContent";

export const metadata = {
  title: "Verify Email — AUREX",
  description: "Verify your AUREX account email address.",
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#080a0f" }}>
        <div className="text-sm" style={{ color: "#6b7a8d" }}>Loading…</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
