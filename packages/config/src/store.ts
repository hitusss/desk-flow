import type { StateStorage } from "zustand/middleware";
import type { Config } from "./schema";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ConfigState {
  config?: Config;
}

export function createConfigStore(storage: StateStorage) {
  return create<ConfigState>()(
    persist(
      (set, get) => ({
        config: undefined,
      }),
      {
        name: "user-config",
        storage: createJSONStorage(() => storage),
      },
    ),
  );
}
