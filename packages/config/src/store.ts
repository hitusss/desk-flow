import type { StateStorage } from "zustand/middleware";
import type { Config } from "./schema";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { ConfigSchema } from "./schema";

interface ConfigState {
  config?: Config;
  set: (config: Config) => void;
}

const STORAGE_NAME = "user-config";

function parseConfig(config: unknown) {
  return ConfigSchema.safeParse(config);
}

export function createConfigStore(storage: StateStorage) {
  return create<ConfigState>()(
    persist(
      (set) => ({
        config: undefined,
        set: (config) => {
          const result = parseConfig(config);

          if (!result.success) {
            throw new Error(
              result.error.issues[0]?.message ?? "Invalid config.",
            );
          }

          set({ config: result.data });
        },
      }),
      {
        name: STORAGE_NAME,
        storage: createJSONStorage(() => storage),
        merge: (persistedState, currentState) => {
          const persistedConfig =
            typeof persistedState === "object" &&
            persistedState !== null &&
            "config" in persistedState
              ? persistedState.config
              : undefined;

          if (persistedConfig === undefined) {
            return currentState;
          }

          const result = parseConfig(persistedConfig);

          if (!result.success) {
            void storage.removeItem(STORAGE_NAME);
            return currentState;
          }

          return {
            ...currentState,
            config: result.data,
          };
        },
      },
    ),
  );
}
