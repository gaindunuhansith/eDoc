import { StateCreator } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AiChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface AiSlice {
  // State
  chatSessionId: string | null;
  messages: AiChatMessage[];
  isAiLoading: boolean;
  isChatOpen: boolean;

  // Actions
  setChatSessionId: (id: string) => void;
  addMessage: (message: AiChatMessage) => void;
  setMessages: (messages: AiChatMessage[]) => void;
  setAiLoading: (loading: boolean) => void;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  clearChat: () => void;
}

// ─── Slice ────────────────────────────────────────────────────────────────────
export const createAiSlice: StateCreator<AiSlice, [], [], AiSlice> = (
  set
) => ({
  chatSessionId: null,
  messages: [],
  isAiLoading: false,
  isChatOpen: false,

  setChatSessionId: (id) => set({ chatSessionId: id }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setMessages: (messages) => set({ messages }),

  setAiLoading: (loading) => set({ isAiLoading: loading }),

  openChat: () => set({ isChatOpen: true }),
  closeChat: () => set({ isChatOpen: false }),
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),

  clearChat: () =>
    set({ messages: [], chatSessionId: null, isAiLoading: false }),
});
