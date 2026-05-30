import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Home, Settings } from "lucide-react-native";
import { useEffect } from "react";
import { AppState, useColorScheme } from "react-native";

import { theme } from "@repo/tailwind/theme-colors";

import { useTimerStore } from "@/lib/timer";
import { initializeTimerNotifications } from "@/lib/timer-notifications";

export default function Layout() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = theme[colorScheme === "dark" ? "dark" : "light"];

  useEffect(() => {
    void initializeTimerNotifications();

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        useTimerStore.getState().reconcile();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopColor: colors.foreground,
            borderTopWidth: 1,
            paddingTop: 4,
          },
          tabBarInactiveTintColor: colors.foreground,
          tabBarActiveTintColor: colors.main,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => <Home size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color }) => <Settings size={28} color={color} />,
          }}
        />
      </Tabs>
      <StatusBar style="auto" />
    </>
  );
}
