import { DashboardLayoutWrapper } from "@/components/dashboard-layout";
import { RouteGuard } from "@/components/auth/route-guard";

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard requiredRole="DOCTOR">
      <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>
    </RouteGuard>
  );
}
