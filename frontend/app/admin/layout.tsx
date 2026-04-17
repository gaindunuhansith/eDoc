import { DashboardLayoutWrapper } from "@/components/dashboard-layout";
import { RouteGuard } from "@/components/auth/route-guard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard requiredRole="ADMIN">
      <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>
    </RouteGuard>
  );
}
