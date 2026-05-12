import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PatternBackground } from "@/components/pattern-background";

export default function Route() {
  return (
    <PatternBackground>
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerClassName="gap-4 px-4 py-6"></ScrollView>
      </SafeAreaView>
    </PatternBackground>
  );
}
