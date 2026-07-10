import DashboardLayout from "../components/dashboard/DashboardLayout";

export const metadata = {
  title: "Dashboard — AUREX",
  description: "Your AUREX trading dashboard.",
};

export default function DashboardPage() {
  return (
    <div className="dashboard-page">
      <DashboardLayout />
    </div>
  );
}
