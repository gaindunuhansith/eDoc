"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { useStore, useIsAuthenticated } from "@/store/store";
import { fetchCurrentUser } from "@/api/userApi";
import { queryKeys } from "@/api/utils/queryKeys";

type Role = "PATIENT" | "DOCTOR" | "ADMIN";

const ROLE_HOME: Record<Role, string> = {
  PATIENT: "/patient",
  DOCTOR: "/doctor",
  ADMIN: "/admin",
};

interface RouteGuardProps {
  requiredRole: Role;
  children: React.ReactNode;
}

// SSR-safe "has the client hydrated yet?" — avoids setState-in-effect lint error
function useIsClientMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function RouteGuard({ requiredRole, children }: RouteGuardProps) {
  const router = useRouter();
  const mounted = useIsClientMounted();

  const isAuthenticated = useIsAuthenticated();
  const token = useStore((s) => s.token);
  const clearAuth = useStore((s) => s.clearAuth);
  const updateUser = useStore((s) => s.updateUser);

  const { data: currentUser, isLoading, isError } = useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: () => fetchCurrentUser().then((r) => r.data),
    enabled: mounted && isAuthenticated && !!token,
    retry: false,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated || !token) {
      router.replace("/");
      return;
    }

    if (isError) {
      clearAuth();
      router.replace("/");
      return;
    }

    if (currentUser) {
      // Sync fresh user data (especially role) back into the store
      updateUser({
        userId: currentUser.userId,
        email: currentUser.email,
        name: currentUser.name,
        role: currentUser.role,
        phoneNumber: currentUser.phoneNumber,
        isProfileCreated: currentUser.isProfileCreated,
      });

      if (currentUser.role !== requiredRole) {
        router.replace(ROLE_HOME[currentUser.role]);
      }
    }
  }, [mounted, isAuthenticated, token, isError, currentUser, requiredRole, router, clearAuth, updateUser]);

  // Block render until hydration + auth + role verified
  if (!mounted || !isAuthenticated || !token || isLoading) {
    return null;
  }

  if (!currentUser || currentUser.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
