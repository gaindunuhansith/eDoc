import { StateCreator } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────
export type ConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected";

export interface TelemedicineSlice {
  // State
  activeSessionId: string | null;
  connectionStatus: ConnectionStatus;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;

  // Actions
  setActiveSession: (sessionId: string | null) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  toggleVideo: () => void;
  toggleAudio: () => void;
  setScreenSharing: (isSharing: boolean) => void;
  resetSession: () => void;
}

// ─── Slice ────────────────────────────────────────────────────────────────────
export const createTelemedicineSlice: StateCreator<
  TelemedicineSlice,
  [],
  [],
  TelemedicineSlice
> = (set) => ({
  activeSessionId: null,
  connectionStatus: "idle",
  isVideoEnabled: true,
  isAudioEnabled: true,
  isScreenSharing: false,

  setActiveSession: (sessionId) => set({ activeSessionId: sessionId }),

  setConnectionStatus: (status) => set({ connectionStatus: status }),

  toggleVideo: () =>
    set((state) => ({ isVideoEnabled: !state.isVideoEnabled })),

  toggleAudio: () =>
    set((state) => ({ isAudioEnabled: !state.isAudioEnabled })),

  setScreenSharing: (isSharing) => set({ isScreenSharing: isSharing }),

  resetSession: () =>
    set({
      activeSessionId: null,
      connectionStatus: "idle",
      isVideoEnabled: true,
      isAudioEnabled: true,
      isScreenSharing: false,
    }),
});
