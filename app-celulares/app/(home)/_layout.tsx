import { Tabs } from "expo-router";
import { Platform, View, Text, StyleSheet, Animated, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useRef } from "react";
import { getSession } from "@/lib/storage";
import * as Notifications from "expo-notifications";
import { registerPushToken } from "@/lib/notifications";

const ACTIVE = "#1a1a1a";
const INACTIVE = "#b0a99f";

// Show OS banner as fallback + custom in-app banner via listener
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function NotifBanner({ top }: { top: number }) {
  const [notif, setNotif] = useState<{ title: string; body: string } | null>(null);
  const slideY = useRef(new Animated.Value(-120)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function dismiss() {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.timing(slideY, { toValue: -120, duration: 280, useNativeDriver: true }).start(() => setNotif(null));
  }

  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener(n => {
      const title = n.request.content.title ?? "Notificación";
      const body  = n.request.content.body  ?? "";
      setNotif({ title, body });
      slideY.setValue(-120);
      Animated.spring(slideY, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }).start();
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(dismiss, 4500);
    });
    return () => { sub.remove(); if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  if (!notif) return null;

  return (
    <Animated.View style={[nb.banner, { top, transform: [{ translateY: slideY }] }]}>
      <TouchableOpacity style={nb.inner} activeOpacity={0.92} onPress={dismiss}>
        <View style={nb.iconWrap}>
          <Ionicons name="notifications" size={18} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={nb.title} numberOfLines={1}>{notif.title}</Text>
          {notif.body ? <Text style={nb.body} numberOfLines={2}>{notif.body}</Text> : null}
        </View>
        <Ionicons name="close" size={16} color="rgba(255,255,255,0.6)" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const nb = StyleSheet.create({
  banner: {
    position: "absolute", left: 12, right: 12, zIndex: 9999,
    borderRadius: 18, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22, shadowRadius: 12, elevation: 20,
  },
  inner: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 14, paddingVertical: 12,
  },
  iconWrap: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 13, fontWeight: "700", color: "#fff" },
  body:  { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 },
});

export default function HomeLayout() {
  const insets = useSafeAreaInsets();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTeamAdmin, setIsTeamAdmin] = useState(false);

  useEffect(() => {
    getSession().then(s => {
      setIsAdmin(!!s?.is_admin);
      setIsTeamAdmin(!!s?.is_team_admin);
      if (s?.id) registerPushToken(s.id);
    });
  }, []);

  return (
    <View style={{ flex: 1 }}>
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
            height: Platform.OS === "ios" ? 84 : 56 + insets.bottom,
            paddingTop: 8,
            paddingBottom: Platform.OS === "ios" ? 24 : Math.max(insets.bottom, 8),
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
        <Tabs.Screen
          name="documentos"
          options={{
            title: "Docs",
            tabBarIcon: ({ focused, color }) => (
              <Ionicons name={focused ? "document-text" : "document-text-outline"} size={26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="credential"
          options={{
            title: "Credencial",
            tabBarButton: () => null,
            tabBarItemStyle: { display: "none" },
            tabBarIcon: ({ focused, color }) => (
              <Ionicons name={focused ? "card" : "card-outline"} size={26} color={color} />
            ),
          }}
        />
      </Tabs>

      {/* In-app notification banner — positioned below notch/dynamic island */}
      <NotifBanner top={insets.top + 8} />
    </View>
  );
}
