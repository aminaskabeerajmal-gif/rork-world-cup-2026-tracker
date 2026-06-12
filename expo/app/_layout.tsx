import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import Colors from "@/constants/colors";
import { FavoritesProvider } from "@/providers/favorites";
import { LiveMatchProvider } from "@/providers/liveMatch";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: { backgroundColor: Colors.bg },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: "800" },
        contentStyle: { backgroundColor: Colors.bg },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="team/[id]"
        options={{ title: "", headerTransparent: true }}
      />
      <Stack.Screen
        name="live/[id]"
        options={{ headerShown: false, presentation: "card" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <FavoritesProvider>
        <LiveMatchProvider>
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.bg }}>
          <StatusBar style="dark" />
          <RootLayoutNav />
        </GestureHandlerRootView>
        </LiveMatchProvider>
      </FavoritesProvider>
    </QueryClientProvider>
  );
}
