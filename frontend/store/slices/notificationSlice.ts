import { StateCreator } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface NotificationSlice {
  // State
  isPanelOpen: boolean;
  unreadCount: number;

  // Actions
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  setUnreadCount: (count: number) => void;
  decrementUnreadCount: () => void;
  clearUnreadCount: () => void;
}

// ─── Slice ────────────────────────────────────────────────────────────────────
export const createNotificationSlice: StateCreator<
  NotificationSlice,
  [],
  [],
  NotificationSlice
> = (set) => ({
  isPanelOpen: false,
  unreadCount: 0,

  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false }),
  togglePanel: () =>
    set((state) => ({ isPanelOpen: !state.isPanelOpen })),

  setUnreadCount: (count) => set({ unreadCount: count }),
  decrementUnreadCount: () =>
    set((state) => ({
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  clearUnreadCount: () => set({ unreadCount: 0 }),
});
