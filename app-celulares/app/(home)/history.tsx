import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity, Linking,
} from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { getSession } from "@/lib/storage";
import { fetchTodayCheckins, Checkin } from "@/lib/api";

export default function HistoryScreen() {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [empName, setEmpName] = useState("");

  useFocusEffect(
    useCallback(() => { load(); }, [])
  );

  async function load() {
    setLoading(true);
    try {
      const session = await getSession();
      if (!session) return;
      setEmpName(`${session.name}${session.last_name ? " " + session.last_name : ""}`);
      const rows = await fetchTodayCheckins(session.id);
      setCheckins(rows.slice().reverse());
    } catch {}
    finally { setLoading(false); }
  }

  function fmtTimestamp(ts: string) {
    return new Date(ts).toLocaleString("es-MX", {
      day: "2-digit", month: "short",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  }

  function openMap(lat: number, lng: number) {
    Linking.openURL(`https://maps.google.com/?q=${lat},${lng}`);
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1a1a1a" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>HISTORIAL HOY</Text>
        <Text style={styles.sub}>{empName}</Text>
      </View>

      {checkins.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Sin registros</Text>
          <Text style={styles.emptySub}>No hay registros para hoy</Text>
        </View>
      ) : (
        <FlatList
          data={checkins}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.cardLeft}>
                  <View style={[styles.typePill, item.type === "in" ? styles.pillIn : styles.pillOut]}>
                    <Text style={[styles.pillText, item.type === "in" ? styles.pillTextIn : styles.pillTextOut]}>
                      {item.type === "in" ? "ENTRADA" : "SALIDA"}
                    </Text>
                  </View>
                  <Text style={styles.cardTime}>{fmtTimestamp(item.timestamp)}</Text>
                </View>
                {(item as any).lat != null && (
                  <TouchableOpacity
                    onPress={() => openMap((item as any).lat, (item as any).lng)}
                    style={styles.mapBtn}
                  >
                    <Text style={styles.mapBtnText}>VER MAPA</Text>
                  </TouchableOpacity>
                )}
              </View>
              {(item as any).photo && (
                <Image
                  source={{ uri: (item as any).photo }}
                  style={styles.photo}
                  resizeMode="cover"
                />
              )}
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F1EB" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingTop: 64, paddingHorizontal: 24, paddingBottom: 20,
    borderBottomWidth: 1, borderBottomColor: "#e0dbd2",
  },
  title: { fontSize: 12, fontWeight: "700", color: "#888", letterSpacing: 2 },
  sub: { fontSize: 20, fontWeight: "800", color: "#1a1a1a", marginTop: 4 },
  list: { padding: 24 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e8e4de",
  },
  cardTop: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: 16,
  },
  cardLeft: { gap: 6 },
  typePill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 4,
  },
  pillIn: { backgroundColor: "#dcfce7" },
  pillOut: { backgroundColor: "#fee2e2" },
  pillText: { fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  pillTextIn: { color: "#16a34a" },
  pillTextOut: { color: "#dc2626" },
  cardTime: { fontSize: 14, color: "#555", fontVariant: ["tabular-nums"] },
  mapBtn: {
    borderWidth: 1, borderColor: "#ccc", borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  mapBtnText: { fontSize: 10, fontWeight: "700", letterSpacing: 1, color: "#555" },
  photo: {
    width: "100%", height: 200,
    borderTopWidth: 1, borderTopColor: "#e8e4de",
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#555" },
  emptySub: { fontSize: 13, color: "#aaa", marginTop: 4 },
});
