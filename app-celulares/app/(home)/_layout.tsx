import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { getSession } from "@/lib/storage";

const ACTIVE = "#1a1a1a";
const INACTIVE = "#b0a99f";

export default function HomeLayout() {
  const { bottom } = useSafeAreaInsets();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTeamAdmin, setIsTeamAdmin] = useState(false);

  useEffect(() => {
    getSession().then(s => {
      setIsAdmin(!!s?.is_admin);
      setIsTeamAdmin(!!s?.is_team_admin);
    });
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 0.8,
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: "#FDFAF6",
          borderTopWidth: 1,
          borderTopColor: "rgba(0,0,0,0.07)",
          height: Platform.OS === "ios" ? 84 : 56 + bottom,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 24 : Math.max(bottom, 8),
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.06,
          shadowRadius: 10,
          elevation: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Registro",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? "finger-print" : "finger-print-outline"} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Historial",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? "time" : "time-outline"} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? "person-circle" : "person-circle-outline"} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="credential"
        options={{
          title: "Credencial",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? "card" : "card-outline"} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="vacaciones"
        options={{
          title: "Vacaciones",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? "sunny" : "sunny-outline"} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: "Registros",
          tabBarButton: isAdmin ? undefined : () => null,
          tabBarItemStyle: isAdmin ? undefined : { display: "none" },
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? "list-circle" : "list-circle-outline"} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="team"
        options={{
          title: "Equipo",
          tabBarButton: (isAdmin || isTeamAdmin) ? undefined : () => null,
          tabBarItemStyle: (isAdmin || isTeamAdmin) ? undefined : { display: "none" },
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
