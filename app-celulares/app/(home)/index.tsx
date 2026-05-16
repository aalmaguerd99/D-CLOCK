import {
  View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator,
  TouchableOpacity, Image,
} from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { getSession, getCompanyInfo, saveCompanyInfo, EmployeeSession } from "@/lib/storage";
import { fetchTodayCheckins, registerCheckin, fetchInfo, Checkin } from "@/lib/api";

export default function CheckinScreen() {
  const [session, setSession] = useState<EmployeeSession | null>(null);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  const [now, setNow] = useState(new Date());
  const [companyName, setCompanyName] = useState("D-CLOCK");
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
      const t = setInterval(() => setNow(new Date()), 30000);
      return () => clearInterval(t);
    }, [])
  );

  async function loadData() {
    setRefreshing(true);
    try {
      const [s, cached] = await Promise.all([getSession(), getCompanyInfo()]);
      setSession(s);
      setCompanyName(cached.company_name);
      setCompanyLogo(cached.logo);
      // Refresh company info from server in background
      fetchInfo().then(fresh => {
        setCompanyName(fresh.company_name);
        setCompanyLogo(fresh.logo);
        saveCompanyInfo(fresh).catch(() => null);
      }).catch(() => null);
      if (s) {
        const rows = await fetchTodayCheckins(s.id);
        setCheckins(rows);
      }
    } catch {}
    finally { setRefreshing(false); }
  }

  const lastType = checkins.length > 0 ? checkins[checkins.length - 1].type : null;
  const nextType: "in" | "out" = lastType === "in" ? "out" : "in";

  async function handleCheckin() {
    if (!session) return;

    const { status: camStatus } = await ImagePicker.requestCameraPermissionsAsync();
    if (camStatus !== "granted") {
      Alert.alert("Cámara requerida", "Activa el permiso de cámara para registrar tu asistencia.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      cameraType: ImagePicker.CameraType.front,
      quality: 0.4,
      base64: true,
      exif: false,
      allowsEditing: false,
    });

    if (result.canceled) return;

    setLoading(true);
    let lat: number | null = null;
    let lng: number | null = null;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        lat = loc.coords.latitude;
        lng = loc.coords.longitude;
      }
    } catch {}

    try {
      const b64 = result.assets[0].base64;
      const photo = b64 ? `data:image/jpeg;base64,${b64}` : null;
      const res = await registerCheckin(session.id, nextType, lat, lng, photo);
      await loadData();
      const geoMsg = res.geofence_name
        ? `Ubicación: ${res.geofence_name}`
        : lat != null ? "Ubicación fuera de geocercas registradas" : "Sin GPS";
      Alert.alert(nextType === "in" ? "Entrada registrada" : "Salida registrada", geoMsg);
    } catch (e: any) {
      Alert.alert("Error al registrar", e?.message ?? "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  const timeStr = now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: true });
  const dateStr = now.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });

  function fmtTime(ts: string) {
    return new Date(ts).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: true });
  }

  if (refreshing && !session) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1a1a1a" /></View>;
  }

  const isIn = nextType === "in";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Company mini-header */}
      <View style={styles.companyRow}>
        <Image
          source={companyLogo ? { uri: companyLogo } : require("@/assets/icon.png")}
          style={styles.companyLogo}
          resizeMode="contain"
        />
        <Text style={styles.companyName}>{companyName}</Text>
      </View>

      {/* Clock header */}
      <View style={styles.clockBlock}>
        <Text style={styles.clock}>{timeStr}</Text>
        <Text style={styles.dateLabel}>{dateStr}</Text>
      </View>

      {/* Employee */}
      <View style={styles.empBlock}>
        <Text style={styles.empName}>{session?.name ?? "—"}{session?.last_name ? ` ${session.last_name}` : ""}</Text>
        <Text style={styles.empSub}>
          {session?.employee_number ?? ""}
          {session?.job_title_name ? `  ·  ${session.job_title_name}` : ""}
        </Text>
      </View>

      {/* Status */}
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: lastType === "in" ? "#22c55e" : "#555" }]} />
        <Text style={styles.statusText}>
          {lastType === "in" ? "DENTRO DEL TURNO" : lastType === "out" ? "TURNO CERRADO" : "SIN REGISTRO"}
        </Text>
      </View>

      {/* Action button */}
      <TouchableOpacity
        style={[styles.actionBtn, loading && styles.actionBtnDisabled]}
        onPress={handleCheckin}
        activeOpacity={0.88}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="large" />
        ) : (
          <>
            <Text style={styles.actionLabel}>{isIn ? "REGISTRAR ENTRADA" : "REGISTRAR SALIDA"}</Text>
            <Text style={styles.actionSub}>Toca para tomar foto y fichar</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Today's log */}
      <View style={styles.logSection}>
        <Text style={styles.logTitle}>REGISTROS HOY</Text>
        {checkins.length === 0 ? (
          <Text style={styles.emptyText}>Sin registros aún</Text>
        ) : (
          [...checkins].reverse().map((c) => (
            <View key={c.id} style={styles.logRow}>
              <View style={styles.logLeft}>
                <View style={[styles.logDot, c.type === "in" ? styles.dotIn : styles.dotOut]} />
                <Text style={styles.logType}>{c.type === "in" ? "ENTRADA" : "SALIDA"}</Text>
              </View>
              <Text style={styles.logTime}>{fmtTime(c.timestamp)}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F1EB" },
  content: { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 32 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5F1EB" },

  companyRow: {
    flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 24,
  },
  companyLogo: { width: 28, height: 28, borderRadius: 7 },
  companyName: { fontSize: 12, fontWeight: "700", color: "#aaa", letterSpacing: 1.5 },

  clockBlock: { marginBottom: 28 },
  clock: { fontSize: 48, fontWeight: "900", color: "#1a1a1a", letterSpacing: -1 },
  dateLabel: { fontSize: 13, color: "#888", marginTop: 2, textTransform: "capitalize" },

  empBlock: { marginBottom: 16 },
  empName: { fontSize: 22, fontWeight: "800", color: "#1a1a1a", letterSpacing: 0.3 },
  empSub: { fontSize: 12, color: "#888", marginTop: 3, letterSpacing: 0.5 },

  statusRow: { flexDirection: "row", alignItems: "center", marginBottom: 32 },
  statusDot: { width: 7, height: 7, borderRadius: 4, marginRight: 8 },
  statusText: { fontSize: 11, fontWeight: "700", color: "#555", letterSpacing: 1.5 },

  actionBtn: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingVertical: 36,
    alignItems: "center",
    marginBottom: 40,
  },
  actionBtnDisabled: { opacity: 0.5 },
  actionLabel: { fontSize: 16, fontWeight: "900", color: "#fff", letterSpacing: 2 },
  actionSub: { fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 6, letterSpacing: 0.5 },

  logSection: {},
  logTitle: { fontSize: 10, fontWeight: "700", color: "#aaa", letterSpacing: 2, marginBottom: 12 },
  emptyText: { fontSize: 13, color: "#bbb" },
  logRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#e8e4de",
  },
  logLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  logDot: { width: 8, height: 8, borderRadius: 4 },
  dotIn: { backgroundColor: "#22c55e" },
  dotOut: { backgroundColor: "#ef4444" },
  logType: { fontSize: 12, fontWeight: "700", color: "#1a1a1a", letterSpacing: 1 },
  logTime: { fontSize: 14, color: "#555", fontVariant: ["tabular-nums"] },
});
