import { DashboardLayoutWrapper } from "@/components/dashboard-layout";

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>;
}
