import { Suspense } from "react";
import ForgotPasswordContent from "../../components/pages/ForgotPasswordContent";

export const metadata = {
  title: "Forgot Password — AUREX",
  description: "Reset your AUREX account password.",
};

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#080a0f" }}>
        <div className="text-sm" style={{ color: "#6b7a8d" }}>Loading…</div>
      </div>
    }>
      <ForgotPasswordContent />
    </Suspense>
  );
}
