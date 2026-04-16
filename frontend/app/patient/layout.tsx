import { DashboardLayoutWrapper } from "@/components/dashboard-layout";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>;
}
