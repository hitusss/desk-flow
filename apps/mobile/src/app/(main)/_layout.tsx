import { PortalHost } from "@rn-primitives/portal";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Home, Settings } from "lucide-react-native";

import { theme } from "@repo/tailwind/theme-colors";

export default function Layout() {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.light.background,
            borderTopColor: theme.light.foreground,
            borderTopWidth: 1,
            paddingTop: 4,
          },
          tabBarInactiveTintColor: theme.light.foreground,
          tabBarActiveTintColor: theme.light.main,
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
      <StatusBar />
      <PortalHost />
    </>
  );
}
