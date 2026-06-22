import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl, Linking,
} from "react-native";
import { useState, useCallback, useRef } from "react";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getSession } from "@/lib/storage";
import { fetchTodayCheckins, Checkin } from "@/lib/api";

const DAYS_ES   = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
const MONTHS_ES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];

function toLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function fullDateLabel(iso: string): string {
  const d = toLocalDate(iso);
  return `${DAYS_ES[d.getDay()]} ${d.getDate()} de ${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`;
}

function fmtTime(ts: string): string {
  return new Date(ts).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function isTodayDate(iso: string): boolean {
  return iso === dateKey(new Date());
}

// ── Columna entrada o salida ──────────────────────────────
function PunchCol({
  label, color, punch, empPhoto,
}: {
  label: string;
  color: string;
  punch: Checkin | null;
  empPhoto: string | null;
}) {
  function openMap() {
    if (punch?.latitude != null && punch?.longitude != null)
      Linking.openURL(`https://maps.google.com/?q=${punch.latitude},${punch.longitude}`);
  }

  return (
    <View style={col.wrap}>
      {/* Label */}
      <View style={[col.badge, { backgroundColor: color + "18" }]}>
        <View style={[col.dot, { backgroundColor: color }]} />
        <Text style={[col.badgeTxt, { color }]}>{label}</Text>
      </View>

      {/* Hora */}
      {punch ? (
        <Text style={col.time}>{fmtTime(punch.timestamp)}</Text>
      ) : (
        <Text style={col.noReg}>Sin registro</Text>
      )}

      {/* Geocerca */}
      {punch?.geofence_name ? (
        <View style={col.geoRow}>
          <Ionicons name="location" size={11} color="#16a34a" />
          <Text style={col.geoTxt} numberOfLines={1}>{punch.geofence_name}</Text>
        </View>
      ) : punch ? (
        <View style={col.geoRow}>
          <Ionicons name="location-outline" size={11} color="#bbb" />
          <Text style={col.geoNone}>Sin geocerca</Text>
        </View>
      ) : null}

      {/* Foto de fichada */}
      {punch?.photo ? (
        <Image source={{ uri: punch.photo }} style={col.photo} resizeMode="cover" />
      ) : null}

      {/* Botón mapa */}
      {punch?.latitude != null ? (
        <TouchableOpacity style={col.mapBtn} onPress={openMap} activeOpacity={0.8}>
          {empPhoto ? (
            <Image source={{ uri: empPhoto }} style={col.mapAvatar} />
          ) : (
            <View style={[col.mapAvatar, col.mapAvatarFb]}>
              <Ionicons name="person" size={11} color="#888" />
            </View>
          )}
          <Text style={col.mapTxt}>Ver mapa</Text>
          <Ionicons name="open-outline" size={12} color="#2563EB" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// ── Pantalla principal ────────────────────────────────────
export default function HistoryScreen() {
  const [checkins,    setCheckins]    = useState<Checkin[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [currentDate, setCurrentDate] = useState<string>(dateKey(new Date()));
  const [empPhoto,    setEmpPhoto]    = useState<string | null>(null);
  const [empId,       setEmpId]       = useState<number | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(useCallback(() => {
    const today = dateKey(new Date());
    setCurrentDate(today);
    loadForDate(today, true);
  }, []));

  async function loadForDate(date: string, init = false) {
    if (init) { setLoading(true); } else { setRefreshing(true); }
    try {
      const s = await getSession();
      if (!s) return;
      setEmpId(s.id);
      setEmpPhoto((s as any).photo ?? null);
      const rows = await fetchTodayCheckins(s.id, date);
      setCheckins(rows);
      setCurrentDate(date);
    } catch (e) {
      console.error("history loadForDate", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function changeDay(delta: number) {
    const d = toLocalDate(currentDate);
    d.setDate(d.getDate() + delta);
    const next = dateKey(d);
    if (delta > 0 && next > dateKey(new Date())) return;
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    loadForDate(next);
  }

  if (loading) {
    return <View style={ss.center}><ActivityIndicator size="large" color="#1a1a1a" /></View>;
  }

  const entrada = checkins.find(c => c.type === "in")  ?? null;
  const salida  = checkins.find(c => c.type === "out") ?? null;
  const isToday = isTodayDate(currentDate);

  return (
    <ScrollView
      ref={scrollRef}
      style={ss.root}
      contentContainerStyle={ss.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => loadForDate(currentDate)}
          tintColor="#1a1a1a"
        />
      }
    >
      {/* ── Navegador de fechas ── */}
      <View style={ss.nav}>
        <TouchableOpacity style={ss.navBtn} onPress={() => changeDay(-1)}>
          <Ionicons name="chevron-back" size={20} color="#1a1a1a" />
        </TouchableOpacity>

        <View style={ss.navCenter}>
          <Text style={ss.navDate}>{fullDateLabel(currentDate)}</Text>
          {isToday && <Text style={ss.navBadge}>Hoy</Text>}
        </View>

        <TouchableOpacity
          style={[ss.navBtn, isToday && ss.navBtnOff]}
          onPress={() => changeDay(1)}
          disabled={isToday}
        >
          <Ionicons name="chevron-forward" size={20} color={isToday ? "#ccc" : "#1a1a1a"} />
        </TouchableOpacity>
      </View>

      {/* ── Sin registros ── */}
      {!entrada && !salida ? (
        <View style={ss.empty}>
          <Ionicons name="time-outline" size={48} color="#d1d5db" />
          <Text style={ss.emptyTitle}>Sin registros</Text>
          <Text style={ss.emptySub}>No hay fichadas para este día</Text>
        </View>
      ) : (
        /* ── Tarjeta día ── */
        <View style={ss.card}>
          {/* Columnas entrada / salida */}
          <View style={ss.cols}>
            <PunchCol label="ENTRADA" color="#16a34a" punch={entrada} empPhoto={empPhoto} />
            <View style={ss.divider} />
            <PunchCol label="SALIDA"  color="#ea580c" punch={salida}  empPhoto={empPhoto} />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// ── Estilos columna ───────────────────────────────────────
const col = StyleSheet.create({
  wrap:  { flex: 1, paddingHorizontal: 14, paddingVertical: 16, gap: 10 },
  badge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 6,
  },
  dot:      { width: 6, height: 6, borderRadius: 3 },
  badgeTxt: { fontSize: 9, fontWeight: "800", letterSpacing: 1 },

  time:   { fontSize: 20, fontWeight: "900", color: "#1a1a1a", fontVariant: ["tabular-nums"] },
  noReg:  { fontSize: 13, color: "#bbb", fontStyle: "italic" },

  geoRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  geoTxt: { fontSize: 11, fontWeight: "600", color: "#16a34a", flex: 1 },
  geoNone:{ fontSize: 11, color: "#bbb" },

  photo: {
    width: "100%", aspectRatio: 9/14,
    borderRadius: 10, borderWidth: 1, borderColor: "rgba(0,0,0,0.07)",
  },

  mapBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#f0f4ff", borderRadius: 10,
    borderWidth: 1, borderColor: "#dbeafe",
    paddingHorizontal: 8, paddingVertical: 7,
  },
  mapAvatar:   { width: 22, height: 22, borderRadius: 6 },
  mapAvatarFb: { backgroundColor: "#e8e2d8", alignItems: "center", justifyContent: "center" },
  mapTxt: { fontSize: 11, fontWeight: "700", color: "#2563EB", flex: 1 },
});

// ── Estilos pantalla ──────────────────────────────────────
const ss = StyleSheet.create({
  root:    { flex: 1, backgroundColor: "#F5F1EB" },
  content: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 48 },
  center:  { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5F1EB" },

  nav: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 24,
  },
  navBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#fff", borderWidth: 1, borderColor: "rgba(0,0,0,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  navBtnOff: { opacity: 0.3 },
  navCenter: { flex: 1, alignItems: "center", gap: 3 },
  navDate:   { fontSize: 14, fontWeight: "700", color: "#1a1a1a", textAlign: "center" },
  navBadge:  { fontSize: 11, fontWeight: "600", color: "#2563EB" },

  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#555" },
  emptySub:   { fontSize: 13, color: "#aaa" },

  card: {
    backgroundColor: "#fff", borderRadius: 20,
    borderWidth: 1, borderColor: "rgba(0,0,0,0.07)",
    overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 4,
  },
  cols: { flexDirection: "row" },
  divider: { width: 1, backgroundColor: "rgba(0,0,0,0.07)", marginVertical: 12 },
});
