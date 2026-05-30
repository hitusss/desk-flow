import { Tabs } from "expo-router";
import { Home, Settings } from "lucide-react-native";
import { useEffect } from "react";
import { AppState } from "react-native";

import { useTimerStore } from "@/lib/timer";
import { initializeTimerNotifications } from "@/lib/timer-notifications";
import { useColors } from "@/lib/use-colors";

export default function Layout() {
  const colors = useColors();

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
  );
}
