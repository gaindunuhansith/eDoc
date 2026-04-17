"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";
import { TopHeader } from "@/components/top-header";

export function DashboardLayoutWrapper({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <TooltipProvider delayDuration={100}>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 overflow-auto bg-background flex flex-col">
          <TopHeader />
          <div className="flex-1">{children}</div>
        </main>
      </SidebarProvider>
    </TooltipProvider>
  );
}
