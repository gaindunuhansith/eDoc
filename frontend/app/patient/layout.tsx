"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayoutWrapper } from "@/components/dashboard-layout";
import { useStore } from "@/store/store";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const router = useRouter();

  // Wait for client mount so Zustand persist has time to rehydrate
  // from localStorage before any child components fire authenticated queries.
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace("/");
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated) return null;

  return <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>;
}

