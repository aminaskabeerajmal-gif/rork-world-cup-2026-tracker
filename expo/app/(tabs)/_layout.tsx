import { Tabs } from "expo-router";
import { CalendarDays, ListOrdered, Star, Users } from "lucide-react-native";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

import Colors from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.green,
        tabBarInactiveTintColor: Colors.tabInactive,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 88 : 64,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
        tabBarItemStyle: { paddingVertical: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Matches",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <CalendarDays color={color} size={22} strokeWidth={2.4} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="standings"
        options={{
          title: "Groups",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <ListOrdered color={color} size={22} strokeWidth={2.4} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="golden-boot"
        options={{
          title: "Golden Boot",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <Star color={color} size={22} strokeWidth={2.4} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="teams"
        options={{
          title: "Teams",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <Users color={color} size={22} strokeWidth={2.4} />
            </TabIcon>
          ),
        }}
      />
    </Tabs>
  );
}

function TabIcon({ children, focused }: { children: React.ReactNode; focused: boolean }) {
  return (
    <View style={[styles.icon, focused && styles.iconActive]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 44,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  iconActive: {
    backgroundColor: Colors.greenDim,
  },
});
