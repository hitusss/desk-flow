import type { StateStorage } from "zustand/middleware";
import type { Config } from "./schema";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ConfigState {
  config?: Config;
  set: (config: Config) => void;
}

export function createConfigStore(storage: StateStorage) {
  return create<ConfigState>()(
    persist(
      (set, get) => ({
        config: undefined,
        set: (config) => set({ config }),
      }),
      {
        name: "user-config",
        storage: createJSONStorage(() => storage),
      },
    ),
  );
}
