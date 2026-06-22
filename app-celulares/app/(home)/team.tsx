import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl,
} from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getSession } from "@/lib/storage";
import { fetchMyTeam, TeamMember, MyTeam } from "@/lib/api";

const DAYS_ES   = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const MONTHS_ES = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];

function todayLabel() {
  const d = new Date();
  return `${DAYS_ES[d.getDay()]} ${d.getDate()} ${MONTHS_ES[d.getMonth()]}`;
}

function fmtTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function statusColor(type: "entrada" | "salida" | null): string {
  if (type === "entrada") return "#22c55e";
  if (type === "salida")  return "#f59e0b";
  return "#d1d5db";
}

function statusLabel(type: "entrada" | "salida" | null): string {
  if (type === "entrada") return "Presente";
  if (type === "salida")  return "Salió";
  return "Sin registro";
}

function MemberRow({ m }: { m: TeamMember }) {
  const name  = m.name + (m.last_name ? " " + m.last_name : "");
  const color = statusColor(m.last_type);
  return (
    <View style={ss.row}>
      {m.photo
        ? <Image source={{ uri: m.photo }} style={ss.avatar} />
        : <View style={[ss.avatar, ss.avatarFallback]}>
            <Text style={ss.avatarLetter}>{(m.name[0] || "").toUpperCase()}</Text>
          </View>
      }
      <View style={ss.rowMid}>
        <Text style={ss.rowName} numberOfLines={1}>{name}</Text>
        {m.job_title ? <Text style={ss.rowSub} numberOfLines={1}>{m.job_title}</Text> : null}
      </View>
      <View style={ss.rowRight}>
        <View style={[ss.dot, { backgroundColor: color }]} />
        <Text style={[ss.rowStatus, { color }]}>{statusLabel(m.last_type)}</Text>
        <Text style={ss.rowTime}>{fmtTime(m.last_time)}</Text>
      </View>
    </View>
  );
}

function TeamView({ team }: { team: MyTeam }) {
  const present  = team.members.filter(m => m.last_type === "entrada").length;
  const absent   = team.members.length - present;
  const pct      = team.members.length > 0 ? Math.round((present / team.members.length) * 100) : 0;
  const barColor = pct >= 80 ? "#22c55e" : pct >= 50 ? "#f59e0b" : pct > 0 ? "#ef4444" : "#d1d5db";

  return (
    <>
      {/* Stats strip */}
      <View style={ss.statsRow}>
        <View style={ss.statBox}>
          <Text style={ss.statNum}>{team.members.length}</Text>
          <Text style={ss.statLbl}>Total</Text>
        </View>
        <View style={[ss.statBox, { borderColor: "#22c55e22", backgroundColor: "#f0fdf4" }]}>
          <Text style={[ss.statNum, { color: "#16a34a" }]}>{present}</Text>
          <Text style={ss.statLbl}>Presentes</Text>
        </View>
        <View style={[ss.statBox, { borderColor: "#fee2e222", backgroundColor: "#fff7f7" }]}>
          <Text style={[ss.statNum, { color: "#dc2626" }]}>{absent}</Text>
          <Text style={ss.statLbl}>Ausentes</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={ss.barWrap}>
        <View style={ss.barBg}>
          <View style={[ss.barFill, { width: `${pct}%` as any, backgroundColor: barColor }]} />
        </View>
        <Text style={[ss.barPct, { color: barColor }]}>{pct}%</Text>
      </View>

      {team.description ? <Text style={ss.desc}>{team.description}</Text> : null}

      <Text style={ss.sectionTitle}>Miembros del equipo</Text>

      {team.members.length === 0 ? (
        <View style={ss.emptyList}>
          <Text style={ss.emptyListText}>Este equipo aún no tiene miembros.</Text>
        </View>
      ) : (
        <View style={ss.list}>
          {team.members.map(m => <MemberRow key={m.id} m={m} />)}
        </View>
      )}
    </>
  );
}

export default function TeamScreen() {
  const [teams,      setTeams]      = useState<MyTeam[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeIdx,  setActiveIdx]  = useState(0);

  useFocusEffect(useCallback(() => { load(); }, []));

  async function load(refresh = false) {
    if (refresh) setRefreshing(true); else setLoading(true);
    try {
      const s = await getSession();
      if (!s) return;
      const t = await fetchMyTeam(s.id);
      setTeams(t);
      setActiveIdx(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  if (loading) {
    return <View style={ss.center}><ActivityIndicator size="large" color="#1a1a1a" /></View>;
  }

  if (teams.length === 0) {
    return (
      <View style={ss.center}>
        <Ionicons name="people-outline" size={52} color="#d1d5db" />
        <Text style={ss.emptyTitle}>Sin equipo asignado</Text>
        <Text style={ss.emptySub}>Pide al administrador que te asigne como responsable de un equipo.</Text>
      </View>
    );
  }

  const activeTeam = teams[activeIdx] ?? teams[0];

  return (
    <ScrollView
      style={ss.root}
      contentContainerStyle={ss.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#1a1a1a" />}
    >
      {/* Header */}
      <View style={ss.header}>
        <View>
          <Text style={ss.title}>{activeTeam.name}</Text>
          <Text style={ss.subtitle}>{todayLabel()}</Text>
        </View>
      </View>

      {/* Tabs — solo si hay más de 1 equipo */}
      {teams.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={ss.tabsScroll}
          contentContainerStyle={ss.tabsRow}
        >
          {teams.map((t, i) => (
            <TouchableOpacity
              key={t.id}
              style={[ss.tab, i === activeIdx && ss.tabActive]}
              onPress={() => setActiveIdx(i)}
              activeOpacity={0.8}
            >
              <Text style={[ss.tabTxt, i === activeIdx && ss.tabTxtActive]}>
                {t.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <TeamView team={activeTeam} />
    </ScrollView>
  );
}

const ss = StyleSheet.create({
  root:    { flex: 1, backgroundColor: "#F5F1EB" },
  content: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 48 },
  center:  { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5F1EB", padding: 32 },

  header:   { marginBottom: 16 },
  title:    { fontSize: 26, fontWeight: "900", color: "#1a1a1a", letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: "#888", marginTop: 2 },

  tabsScroll: { marginBottom: 20 },
  tabsRow:    { gap: 8 },
  tab: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: "#fff", borderWidth: 1, borderColor: "rgba(0,0,0,0.09)",
  },
  tabActive:    { backgroundColor: "#1a1a1a", borderColor: "#1a1a1a" },
  tabTxt:       { fontSize: 13, fontWeight: "600", color: "#888" },
  tabTxtActive: { color: "#fff" },

  statsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  statBox:  {
    flex: 1, borderRadius: 14, backgroundColor: "#fff",
    borderWidth: 1, borderColor: "rgba(0,0,0,0.07)",
    paddingVertical: 14, alignItems: "center",
  },
  statNum: { fontSize: 26, fontWeight: "800", color: "#1a1a1a", letterSpacing: -0.5 },
  statLbl: { fontSize: 11, color: "#888", fontWeight: "600", marginTop: 2 },

  barWrap: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 22 },
  barBg:   { flex: 1, height: 8, borderRadius: 4, backgroundColor: "rgba(0,0,0,0.07)", overflow: "hidden" },
  barFill: { height: 8, borderRadius: 4 },
  barPct:  { fontSize: 13, fontWeight: "700", minWidth: 36, textAlign: "right" },

  desc:         { fontSize: 13, color: "#666", marginBottom: 18, lineHeight: 18 },
  sectionTitle: { fontSize: 12, fontWeight: "700", color: "#888", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 },

  list:  { borderRadius: 16, overflow: "hidden", backgroundColor: "#fff", borderWidth: 1, borderColor: "rgba(0,0,0,0.07)" },
  row:   {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.05)",
  },

  avatar:         { width: 40, height: 40, borderRadius: 10, marginRight: 12 },
  avatarFallback: { backgroundColor: "#e8e2d8", alignItems: "center", justifyContent: "center" },
  avatarLetter:   { fontSize: 16, fontWeight: "700", color: "#1a1a1a" },

  rowMid:    { flex: 1 },
  rowName:   { fontSize: 14, fontWeight: "700", color: "#1a1a1a" },
  rowSub:    { fontSize: 11, color: "#888", marginTop: 1 },

  rowRight:  { alignItems: "flex-end", gap: 2 },
  dot:       { width: 8, height: 8, borderRadius: 4 },
  rowStatus: { fontSize: 11, fontWeight: "700" },
  rowTime:   { fontSize: 11, color: "#aaa" },

  emptyTitle:    { fontSize: 17, fontWeight: "700", color: "#1a1a1a", marginTop: 16, marginBottom: 8, textAlign: "center" },
  emptySub:      { fontSize: 13, color: "#888", textAlign: "center", lineHeight: 18 },
  emptyList:     { padding: 24, alignItems: "center" },
  emptyListText: { fontSize: 13, color: "#aaa" },
});
