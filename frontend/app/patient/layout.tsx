import { DashboardLayoutWrapper } from "@/components/dashboard-layout";
import { RouteGuard } from "@/components/auth/route-guard";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard requiredRole="PATIENT">
      <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>
    </RouteGuard>
  );
}

