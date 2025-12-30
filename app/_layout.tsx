import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#000" },
        headerTintColor: "#00ffcc",
        tabBarActiveTintColor: "#00ffcc",
        tabBarStyle: { backgroundColor: "#111" },
      }}
    >
      {/* Main visible tabs */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="focus"
        options={{
          title: "Focus",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="timer-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Stats",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="analytics-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="setup"
        options={{
          title: "Setup",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="construct-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profiles"
        options={{
          title: "Profiles",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkbox-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="accountability"
        options={{
          title: "Accountability",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shield-checkmark-outline" color={color} size={size} />
          ),
        }}
      />

      {/* Hidden tabs - accessible via navigation but not shown in tab bar */}
      <Tabs.Screen
        name="ai_insight"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="modal"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="testlab"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="partners"
        options={{
          href: null, // Hide from tab bar
        }}
      />

      <Tabs.Screen
        name="analytics"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="backup"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="focuslock"
        options={{
          href: null, // Hide from tab bar
        }}
      />

      <Tabs.Screen
        name="wellbeing"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="_oldTabs"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
