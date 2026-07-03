import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/** Cross-platform persistence — SecureStore on native, localStorage on web. */
const storage: StateStorage = {
  getItem: async (name) => {
    if (Platform.OS === "web") return localStorage.getItem(name);
    return await SecureStore.getItemAsync(name);
  },
  setItem: async (name, value) => {
    if (Platform.OS === "web") localStorage.setItem(name, value);
    else await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name) => {
    if (Platform.OS === "web") localStorage.removeItem(name);
    else await SecureStore.deleteItemAsync(name);
  },
};

interface OnboardingState {
  /** Whether the intro carousel has been seen. Undefined until hydrated. */
  seen: boolean;
  hydrated: boolean;
  complete: () => void;
  setHydrated: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      seen: false,
      hydrated: false,
      complete: () => set({ seen: true }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "schoolride-onboarding",
      storage: createJSONStorage(() => storage),
      partialize: (s) => ({ seen: s.seen }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);
