import { createTimerStore } from "@repo/timer";

import { useConfigStore } from "@/lib/config";

export const useTimerStore = createTimerStore(useConfigStore);
