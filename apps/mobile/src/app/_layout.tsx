import { PortalHost } from "@rn-primitives/portal";
import * as Notifications from "expo-notifications";
import { Redirect, Slot, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useSyncExternalStore } from "react";

import { ThemeProvider } from "@/components/theme-provider";
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

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    void Notifications.requestPermissionsAsync();
  }, [isHydrated]);

  if (!hasConfig && !onOnboarding) {
    return <Redirect href="/onboarding" />;
  }
  if (hasConfig && onOnboarding) {
    return <Redirect href="/" />;
  }

  return (
    <ThemeProvider>
      <Slot />
      <PortalHost />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
