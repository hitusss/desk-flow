import AsyncStorage from "@react-native-async-storage/async-storage";
import { createConfigStore } from "@repo/config";

export const useConfigStore = createConfigStore(AsyncStorage);
