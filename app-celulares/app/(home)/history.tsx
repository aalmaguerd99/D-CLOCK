import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl, Linking,
} from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getSession } from "@/lib/storage";
import { fetchTodayCheckins, Checkin } from "@/lib/api";

const DAYS_ES    = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
const MONTHS_ES  = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];

function toLocalDate(isoDate: string): Date {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function fullDateLabel(isoDate: string): string {
  const d = toLocalDate(isoDate);
  return `${DAYS_ES[d.getDay()]} ${d.getDate()} ${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`;
}

function fmtTime(ts: string): string {
  return new Date(ts).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function isToday(isoDate: string): boolean {
  return isoDate === dateKey(new Date());
}

export default function HistoryScreen() {
  const [checkins,   setCheckins]   = useState<Checkin[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentDate, setCurrentDate] = useState<string>(dateKey(new Date()));
  const [empId,      setEmpId]      = useState<number | null>(null);
  const [empPhoto,   setEmpPhoto]   = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    loadForDate(dateKey(new Date()), true);
  }, []));

  async function loadForDate(date: string, init = false) {
    if (init) setLoading(true); else setRefreshing(true);
    try {
      const s = await getSession();
      if (!s) return;
      setEmpId(s.id);
      setEmpPhoto((s as any).photo ?? null);
      const rows = await fetchTodayCheckins(s.id, date);
      setCheckins(rows);
      setCurrentDate(date);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }

  function changeDay(delta: number) {
    const d = toLocalDate(currentDate);
    d.setDate(d.getDate() + delta);
    if (d > new Date()) return;
    loadForDate(dateKey(d));
  }

  function openMap(lat: number, lng: number) {
    Linking.openURL(`https://maps.google.com/?q=${lat},${lng}`);
  }

  if (loading) {
    return <View style={ss.center}><ActivityIndicator size="large" color="#1a1a1a" /></View>;
  }

  const entrada = checkins.find(c => c.type === "in");
  const salida  = checkins.find(c => c.type === "out");
  const isTodayFlag = isToday(currentDate);

  return (
    <ScrollView
      style={ss.root}
      contentContainerStyle={ss.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadForDate(currentDate, false)} tintColor="#1a1a1a" />}
    >
      {/* Navegador de fechas */}
      <View style={ss.nav}>
        <TouchableOpacity style={ss.navBtn} onPress={() => changeDay(-1)}>
          <Ionicons name="chevron-back" size={20} color="#1a1a1a" />
        </TouchableOpacity>
        <View style={ss.navCenter}>
          <Text style={ss.navDate}>{fullDateLabel(currentDate)}</Text>
          {isTodayFlag && <Text style={ss.navToday}>Hoy</Text>}
        </View>
        <TouchableOpacity
          style={[ss.navBtn, isTodayFlag && ss.navBtnDisabled]}
          onPress={() => changeDay(1)}
          disabled={isTodayFlag}
        >
          <Ionicons name="chevron-forward" size={20} color={isTodayFlag ? "#ccc" : "#1a1a1a"} />
        </TouchableOpacity>
      </View>

      {checkins.length === 0 ? (
        <View style={ss.empty}>
          <Ionicons name="time-outline" size={48} color="#d1d5db" />
          <Text style={ss.emptyTitle}>Sin registros</Text>
          <Text style={ss.emptySub}>No hay fichadas para este día</Text>
        </View>
      ) : (
        <View style={ss.cards}>
          {checkins.map(item => (
            <View key={item.id} style={ss.card}>
              {/* Badge tipo */}
              <View style={ss.cardHead}>
                <View style={[ss.pill, item.type === "in" ? ss.pillIn : ss.pillOut]}>
                  <Text style={[ss.pillTxt, item.type === "in" ? ss.pillTxtIn : ss.pillTxtOut]}>
                    {item.type === "in" ? "ENTRADA" : "SALIDA"}
                  </Text>
                </View>
                <Text style={ss.time}>{fmtTime(item.timestamp)}</Text>
              </View>

              {/* Geocerca */}
              {item.geofence_name ? (
                <View style={ss.geoRow}>
                  <Ionicons name="location" size={13} color="#16a34a" />
                  <Text style={ss.geoTxt}>{item.geofence_name}</Text>
                </View>
              ) : (
                <View style={ss.geoRow}>
                  <Ionicons name="location-outline" size={13} color="#aaa" />
                  <Text style={ss.geoNone}>Sin geocerca</Text>
                </View>
              )}

              {/* Foto de fichada */}
              {item.photo ? (
                <Image source={{ uri: item.photo }} style={ss.photo} resizeMode="cover" />
              ) : null}

              {/* Mapa */}
              {item.latitude != null && item.longitude != null ? (
                <TouchableOpacity
                  style={ss.mapBtn}
                  onPress={() => openMap(item.latitude!, item.longitude!)}
                  activeOpacity={0.8}
                >
                  <View style={ss.mapBtnInner}>
                    {empPhoto ? (
                      <Image source={{ uri: empPhoto }} style={ss.mapAvatar} />
                    ) : (
                      <View style={[ss.mapAvatar, ss.mapAvatarFallback]}>
                        <Ionicons name="person" size={14} color="#888" />
                      </View>
                    )}
                    <View>
                      <Text style={ss.mapBtnLbl}>Ver en mapa</Text>
                      <Text style={ss.mapBtnCoords}>
                        {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
                      </Text>
                    </View>
                    <Ionicons name="open-outline" size={16} color="#2563EB" style={{ marginLeft: "auto" }} />
                  </View>
                </TouchableOpacity>
              ) : null}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const ss = StyleSheet.create({
  root:    { flex: 1, backgroundColor: "#F5F1EB" },
  content: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 48 },
  center:  { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5F1EB" },

  nav: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: 24,
  },
  navBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#fff", borderWidth: 1, borderColor: "rgba(0,0,0,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  navBtnDisabled: { opacity: 0.35 },
  navCenter: { alignItems: "center", flex: 1 },
  navDate:  { fontSize: 15, fontWeight: "700", color: "#1a1a1a" },
  navToday: { fontSize: 11, color: "#2563EB", fontWeight: "600", marginTop: 2 },

  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#555" },
  emptySub:   { fontSize: 13, color: "#aaa" },

  cards: { gap: 14 },
  card: {
    backgroundColor: "#fff", borderRadius: 16,
    borderWidth: 1, borderColor: "rgba(0,0,0,0.07)", overflow: "hidden",
  },

  cardHead: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12,
  },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  pillIn:  { backgroundColor: "#dcfce7" },
  pillOut: { backgroundColor: "#fff7ed" },
  pillTxt: { fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  pillTxtIn:  { color: "#16a34a" },
  pillTxtOut: { color: "#ea580c" },
  time: { fontSize: 22, fontWeight: "800", color: "#1a1a1a", fontVariant: ["tabular-nums"] },

  geoRow: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 16, paddingBottom: 14,
  },
  geoTxt:  { fontSize: 12, fontWeight: "600", color: "#16a34a" },
  geoNone: { fontSize: 12, color: "#aaa" },

  photo: {
    width: "100%", height: 220,
    borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)",
  },

  mapBtn: {
    margin: 12, borderRadius: 12,
    backgroundColor: "#f0f4ff", borderWidth: 1, borderColor: "#dbeafe",
  },
  mapBtnInner: {
    flexDirection: "row", alignItems: "center", gap: 10,
    padding: 12,
  },
  mapAvatar: {
    width: 36, height: 36, borderRadius: 10,
    borderWidth: 2, borderColor: "#fff",
  },
  mapAvatarFallback: {
    backgroundColor: "#e8e2d8", alignItems: "center", justifyContent: "center",
  },
  mapBtnLbl:    { fontSize: 13, fontWeight: "700", color: "#1a1a1a" },
  mapBtnCoords: { fontSize: 10, color: "#888", marginTop: 1 },
});
