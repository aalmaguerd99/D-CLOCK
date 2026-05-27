import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Image, RefreshControl,
} from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getSession } from "@/lib/storage";
import { fetchAdminCheckins, AdminCheckin } from "@/lib/api";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr: string, n: number) {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function fmtDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es-MX", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
}

function fmtTime(ts: string) {
  const d = new Date(ts);
  return d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

export default function RecordsScreen() {
  const [date, setDate] = useState(todayStr());
  const [checkins, setCheckins] = useState<AdminCheckin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load(d: string, empId: number, silent = false) {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminCheckins(empId, d);
      setCheckins(data);
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar registros");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      getSession().then(s => {
        if (s) {
          setEmployeeId(s.id);
          load(date, s.id);
        }
      });
    }, [])
  );

  function changeDate(n: number) {
    const nd = addDays(date, n);
    setDate(nd);
    if (employeeId) load(nd, employeeId);
  }

  function onRefresh() {
    if (!employeeId) return;
    setRefreshing(true);
    load(date, employeeId, true);
  }

  const isToday = date === todayStr();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>REGISTROS</Text>
        <View style={styles.dateNav}>
          <TouchableOpacity style={styles.navBtn} onPress={() => changeDate(-1)}>
            <Ionicons name="chevron-back" size={20} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.dateLabel}>{fmtDate(date)}</Text>
          <TouchableOpacity
            style={[styles.navBtn, isToday && styles.navBtnDisabled]}
            onPress={() => changeDate(1)}
            disabled={isToday}
          >
            <Ionicons name="chevron-forward" size={20} color={isToday ? "#ccc" : "#1a1a1a"} />
          </TouchableOpacity>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{checkins.length} registros</Text>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1a1a1a" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => employeeId && load(date, employeeId)}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : checkins.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="time-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>Sin registros para este día</Text>
        </View>
      ) : (
        <FlatList
          data={checkins}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1a1a1a" />}
          renderItem={({ item }) => <CheckinCard item={item} />}
        />
      )}
    </View>
  );
}

function CheckinCard({ item }: { item: AdminCheckin }) {
  const isIn = item.type === "in";
  return (
    <View style={card.row}>
      {item.photo ? (
        <Image source={{ uri: item.photo }} style={card.avatar} />
      ) : (
        <View style={card.avatarFallback}>
          <Text style={card.avatarInitial}>
            {[item.name?.[0], item.last_name?.[0]].filter(Boolean).join("").toUpperCase() || "?"}
          </Text>
        </View>
      )}
      <View style={card.info}>
        <Text style={card.name} numberOfLines={1}>
          {item.name}{item.last_name ? ` ${item.last_name}` : ""}
        </Text>
        <Text style={card.sub} numberOfLines={1}>
          #{item.employee_number}{item.department_name ? ` · ${item.department_name}` : ""}
        </Text>
        {item.job_title_name ? (
          <Text style={card.sub2} numberOfLines={1}>{item.job_title_name}</Text>
        ) : null}
        {item.geofence_name ? (
          <View style={card.geocercaRow}>
            <Ionicons name="location-outline" size={10} color="#aaa" />
            <Text style={card.geocercaText}>{item.geofence_name}</Text>
          </View>
        ) : null}
      </View>
      <View style={card.right}>
        <View style={[card.typeBadge, isIn ? card.inBadge : card.outBadge]}>
          <Text style={[card.typeText, isIn ? card.inText : card.outText]}>
            {isIn ? "ENTRADA" : "SALIDA"}
          </Text>
        </View>
        <Text style={card.time}>{fmtTime(item.timestamp)}</Text>
      </View>
    </View>
  );
}

const card = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#fff", borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: "#ede9e3", marginBottom: 8,
  },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  avatarFallback: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: "#e5e0d8", justifyContent: "center", alignItems: "center",
  },
  avatarInitial: { fontSize: 18, fontWeight: "800", color: "#555" },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 13, fontWeight: "700", color: "#1a1a1a" },
  sub: { fontSize: 11, color: "#888", fontWeight: "500" },
  sub2: { fontSize: 11, color: "#aaa" },
  geocercaRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
  geocercaText: { fontSize: 10, color: "#aaa" },
  right: { alignItems: "flex-end", gap: 6 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  inBadge: { backgroundColor: "#dcfce7" },
  outBadge: { backgroundColor: "#fef2f2" },
  typeText: { fontSize: 9, fontWeight: "800", letterSpacing: 0.8 },
  inText: { color: "#16a34a" },
  outText: { color: "#dc2626" },
  time: { fontSize: 15, fontWeight: "800", color: "#1a1a1a", fontVariant: ["tabular-nums"] },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F1EB" },
  header: {
    backgroundColor: "#1a1a1a",
    paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16,
    gap: 12,
  },
  headerTitle: { fontSize: 10, fontWeight: "800", color: "#aaa", letterSpacing: 2 },
  dateNav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  navBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#2a2a2a", justifyContent: "center", alignItems: "center",
  },
  navBtnDisabled: { backgroundColor: "#222" },
  dateLabel: { fontSize: 15, fontWeight: "700", color: "#fff", flex: 1, textAlign: "center" },
  countBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#2a2a2a", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6,
  },
  countText: { fontSize: 11, color: "#aaa", fontWeight: "600" },
  list: { padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  emptyText: { fontSize: 14, color: "#aaa", fontWeight: "600" },
  errorText: { fontSize: 13, color: "#d63b3b", textAlign: "center", paddingHorizontal: 32 },
  retryBtn: {
    borderWidth: 1.5, borderColor: "#ccc", borderRadius: 8,
    paddingHorizontal: 20, paddingVertical: 10,
  },
  retryText: { fontSize: 13, fontWeight: "700", color: "#1a1a1a" },
});
