import { StateCreator } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────
export type DashboardTab = "overview" | "appointments" | "patients" | "revenue" | "analytics";

export interface DashboardSlice {
  // State
  activeTab: DashboardTab;
  dateRange: {
    from: string; // ISO date string
    to: string;   // ISO date string
  };
  isSidebarCollapsed: boolean;

  // Actions
  setActiveTab: (tab: DashboardTab) => void;
  setDateRange: (from: string, to: string) => void;
  resetDateRange: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

const today = new Date();
const thirtyDaysAgo = new Date(today);
thirtyDaysAgo.setDate(today.getDate() - 30);

const defaultRange = {
  from: thirtyDaysAgo.toISOString().split("T")[0],
  to: today.toISOString().split("T")[0],
};

// ─── Slice ────────────────────────────────────────────────────────────────────
export const createDashboardSlice: StateCreator<
  DashboardSlice,
  [],
  [],
  DashboardSlice
> = (set) => ({
  activeTab: "overview",
  dateRange: defaultRange,
  isSidebarCollapsed: false,

  setActiveTab: (tab) => set({ activeTab: tab }),

  setDateRange: (from, to) => set({ dateRange: { from, to } }),

  resetDateRange: () => set({ dateRange: defaultRange }),

  setSidebarCollapsed: (collapsed) =>
    set({ isSidebarCollapsed: collapsed }),

  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
});
