import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Modal, Platform,
} from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { getSession } from "@/lib/storage";
import {
  fetchVacation, submitVacationRequest,
  VacationBalance, VacationRequest,
} from "@/lib/api";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
};
const STATUS_COLOR: Record<string, string> = {
  pending: "#d97706",
  approved: "#16a34a",
  rejected: "#dc2626",
};
const STATUS_BG: Record<string, string> = {
  pending: "#fef3c7",
  approved: "#f0fdf4",
  rejected: "#fef2f2",
};

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString("en-CA");
}

function countWeekdays(start: string, end: string): number {
  let count = 0;
  const cur = new Date(start + "T12:00:00");
  const endD = new Date(end + "T12:00:00");
  while (cur <= endD) {
    const dow = cur.getDay();
    if (dow !== 0 && dow !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

function today(): string {
  return new Date().toLocaleDateString("en-CA");
}

export default function VacacionesScreen() {
  const [balance, setBalance] = useState<VacationBalance | null>(null);
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [empId, setEmpId] = useState<number | null>(null);

  // Request form state
  const [modalVisible, setModalVisible] = useState(false);
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(addDays(today(), 4));
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  async function load() {
    setLoading(true);
    try {
      const session = await getSession();
      if (!session) return;
      setEmpId(session.id);
      const data = await fetchVacation(session.id);
      setBalance(data.balance);
      setRequests(data.requests ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  const weekdays = countWeekdays(startDate, endDate);
  const canSubmit = weekdays > 0 && (balance ? weekdays <= balance.days_available : false);

  async function handleSubmit() {
    if (!empId) return;
    if (endDate < startDate) {
      Alert.alert("Fechas inválidas", "La fecha fin debe ser después de la fecha inicio.");
      return;
    }
    if (!canSubmit) {
      Alert.alert("Saldo insuficiente", `Tienes ${balance?.days_available ?? 0} días disponibles pero estás solicitando ${weekdays}.`);
      return;
    }
    Alert.alert(
      "Confirmar solicitud",
      `Solicitar ${weekdays} días de vacaciones\n${fmtDate(startDate)} al ${fmtDate(endDate)}`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Enviar", onPress: async () => {
            setSubmitting(true);
            try {
              await submitVacationRequest(empId, startDate, endDate, weekdays, notes || undefined);
              setModalVisible(false);
              setNotes("");
              await load();
              Alert.alert("Solicitud enviada", "Tu solicitud fue enviada. Espera la aprobación de tu administrador.");
            } catch (e: any) {
              Alert.alert("Error", e?.message ?? "No se pudo enviar la solicitud");
            } finally {
              setSubmitting(false);
            }
          }
        }
      ]
    );
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1a1a1a" /></View>;
  }

  const available = balance?.days_available ?? 0;
  const granted = balance?.days_granted ?? 0;
  const used = balance?.days_used ?? 0;
  const pct = granted > 0 ? Math.min(1, available / granted) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Header */}
      <Text style={styles.pageTitle}>VACACIONES</Text>
      <Text style={styles.pageSub}>{new Date().getFullYear()}</Text>

      {/* Balance card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceRow}>
          <View style={styles.balanceStat}>
            <Text style={[styles.balanceNum, { color: "#16a34a" }]}>{granted}</Text>
            <Text style={styles.balanceLbl}>Ganados</Text>
          </View>
          <View style={[styles.balanceStat, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: "rgba(255,255,255,0.15)" }]}>
            <Text style={[styles.balanceNum, { color: "#ef4444" }]}>{used}</Text>
            <Text style={styles.balanceLbl}>Usados</Text>
          </View>
          <View style={styles.balanceStat}>
            <Text style={[styles.balanceNum, { color: "#fff", fontSize: 40, lineHeight: 48 }]}>{available}</Text>
            <Text style={styles.balanceLbl}>Disponibles</Text>
          </View>
        </View>
        {/* Progress bar */}
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${Math.round(pct * 100)}%` }]} />
        </View>
        <Text style={styles.progressLabel}>
          {granted > 0 ? `${Math.round(pct * 100)}% disponible` : "Sin días asignados este año"}
        </Text>
      </View>

      {/* Request button */}
      <TouchableOpacity
        style={[styles.requestBtn, available <= 0 && styles.requestBtnDisabled]}
        onPress={() => setModalVisible(true)}
        disabled={available <= 0}
      >
        <Text style={styles.requestBtnText}>SOLICITAR VACACIONES</Text>
        {available > 0
          ? <Text style={styles.requestBtnSub}>{available} días disponibles · toca para solicitar</Text>
          : <Text style={styles.requestBtnSub}>Sin días disponibles este año</Text>
        }
      </TouchableOpacity>

      {/* History */}
      <Text style={styles.sectionTitle}>MIS SOLICITUDES</Text>
      {requests.length === 0 ? (
        <Text style={styles.emptyText}>Sin solicitudes registradas</Text>
      ) : (
        requests.map((r) => (
          <View key={r.id} style={styles.requestRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.requestDates}>
                {fmtDate(r.start_date)} — {fmtDate(r.end_date)}
              </Text>
              <Text style={styles.requestDays}>{r.days_count} día{r.days_count !== 1 ? "s" : ""}</Text>
              {r.review_notes ? <Text style={styles.requestNote}>{r.review_notes}</Text> : null}
            </View>
            <View style={[styles.statusBadge, { backgroundColor: STATUS_BG[r.status] ?? "#f3f4f6" }]}>
              <Text style={[styles.statusText, { color: STATUS_COLOR[r.status] ?? "#6b7280" }]}>
                {STATUS_LABEL[r.status] ?? r.status}
              </Text>
            </View>
          </View>
        ))
      )}

      {/* Modal solicitud */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modal} contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>SOLICITAR VACACIONES</Text>

          <Text style={styles.fieldLabel}>FECHA INICIO</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setStartDate(addDays(startDate, -1))}>
              <Text style={styles.dateBtnTxt}>◀</Text>
            </TouchableOpacity>
            <Text style={styles.dateVal}>{fmtDate(startDate)}</Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setStartDate(addDays(startDate, 1))}>
              <Text style={styles.dateBtnTxt}>▶</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.fieldLabel}>FECHA FIN</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setEndDate(addDays(endDate, -1))}>
              <Text style={styles.dateBtnTxt}>◀</Text>
            </TouchableOpacity>
            <Text style={styles.dateVal}>{fmtDate(endDate)}</Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setEndDate(addDays(endDate, 1))}>
              <Text style={styles.dateBtnTxt}>▶</Text>
            </TouchableOpacity>
          </View>

          {/* Summary */}
          <View style={styles.summaryBox}>
            <Text style={styles.summaryDays}>{weekdays}</Text>
            <Text style={styles.summaryLabel}>días hábiles solicitados</Text>
            {balance && (
              <Text style={[styles.summaryRemaining, { color: canSubmit ? "#16a34a" : "#dc2626" }]}>
                {canSubmit
                  ? `Te quedarán ${available - weekdays} días después`
                  : `Saldo insuficiente (tienes ${available})`
                }
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, (!canSubmit || submitting) && styles.submitBtnOff]}
            onPress={handleSubmit}
            disabled={!canSubmit || submitting}
          >
            {submitting
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitBtnTxt}>ENVIAR SOLICITUD</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
            <Text style={styles.cancelBtnTxt}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F1EB" },
  content: { padding: 24, paddingTop: 56, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5F1EB" },

  pageTitle: { fontSize: 11, fontWeight: "800", color: "#aaa", letterSpacing: 2, marginBottom: 2 },
  pageSub: { fontSize: 28, fontWeight: "900", color: "#1a1a1a", letterSpacing: -0.5, marginBottom: 24 },

  balanceCard: {
    backgroundColor: "#1a1a1a", borderRadius: 16, padding: 20, marginBottom: 20,
  },
  balanceRow: { flexDirection: "row", marginBottom: 16 },
  balanceStat: { flex: 1, alignItems: "center", paddingVertical: 4 },
  balanceNum: { fontSize: 32, fontWeight: "900", letterSpacing: -1, lineHeight: 40 },
  balanceLbl: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.5)", letterSpacing: 1, marginTop: 4, textTransform: "uppercase" },
  progressBg: { height: 4, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 2, marginBottom: 8 },
  progressFill: { height: "100%", backgroundColor: "#16a34a", borderRadius: 2 },
  progressLabel: { fontSize: 11, color: "rgba(255,255,255,0.45)", textAlign: "center" },

  requestBtn: {
    backgroundColor: "#2563EB", borderRadius: 12,
    paddingVertical: 20, alignItems: "center", marginBottom: 32,
  },
  requestBtnDisabled: { backgroundColor: "#ccc" },
  requestBtnText: { fontSize: 14, fontWeight: "900", color: "#fff", letterSpacing: 1.5 },
  requestBtnSub: { fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 4 },

  sectionTitle: { fontSize: 10, fontWeight: "700", color: "#aaa", letterSpacing: 2, marginBottom: 12 },
  emptyText: { fontSize: 13, color: "#bbb" },

  requestRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#e8e4de",
  },
  requestDates: { fontSize: 14, fontWeight: "700", color: "#1a1a1a" },
  requestDays: { fontSize: 12, color: "#888", marginTop: 2 },
  requestNote: { fontSize: 11, color: "#dc2626", marginTop: 3, fontStyle: "italic" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: "700" },

  modal: { flex: 1, backgroundColor: "#F5F1EB" },
  modalContent: { padding: 24, paddingTop: 48, paddingBottom: 48 },
  modalTitle: { fontSize: 11, fontWeight: "800", color: "#aaa", letterSpacing: 2, marginBottom: 32 },

  fieldLabel: { fontSize: 10, fontWeight: "700", color: "#aaa", letterSpacing: 1.5, marginBottom: 8 },
  dateRow: { flexDirection: "row", alignItems: "center", marginBottom: 24, justifyContent: "space-between" },
  dateBtn: { width: 44, height: 44, borderRadius: 10, backgroundColor: "#e8e4de", justifyContent: "center", alignItems: "center" },
  dateBtnTxt: { fontSize: 14, color: "#1a1a1a" },
  dateVal: { fontSize: 20, fontWeight: "800", color: "#1a1a1a", letterSpacing: 0.5 },

  summaryBox: {
    backgroundColor: "#fff", borderRadius: 14, padding: 20,
    alignItems: "center", marginBottom: 28, marginTop: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  summaryDays: { fontSize: 56, fontWeight: "900", color: "#1a1a1a", lineHeight: 60, letterSpacing: -2 },
  summaryLabel: { fontSize: 13, color: "#888", marginTop: 4 },
  summaryRemaining: { fontSize: 12, fontWeight: "700", marginTop: 8 },

  submitBtn: { backgroundColor: "#1a1a1a", borderRadius: 12, paddingVertical: 18, alignItems: "center", marginBottom: 12 },
  submitBtnOff: { opacity: 0.4 },
  submitBtnTxt: { fontSize: 14, fontWeight: "900", color: "#fff", letterSpacing: 1.5 },
  cancelBtn: { paddingVertical: 14, alignItems: "center" },
  cancelBtnTxt: { fontSize: 14, color: "#888" },
});
