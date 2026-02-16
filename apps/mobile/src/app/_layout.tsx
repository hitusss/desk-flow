import { Redirect, Slot, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useSyncExternalStore } from "react";

import { useConfigStore } from "@/lib/config";

import "@/styles.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const segments = useSegments();

  const hasConfig = useConfigStore((store) => Boolean(store.config));

  const isHydrated = useSyncExternalStore(
    useConfigStore.persist.onFinishHydration,
    () => useConfigStore.persist.hasHydrated(),
    () => false,
  );
  const onOnboarding = segments[0] === "onboarding";

  useEffect(() => {
    if (!isHydrated) return;
    SplashScreen.hide();
  }, [isHydrated]);

  if (!hasConfig && !onOnboarding) {
    return <Redirect href="/onboarding" />;
  }
  if (hasConfig && onOnboarding) {
    return <Redirect href="/" />;
  }

  return <Slot />;
}
