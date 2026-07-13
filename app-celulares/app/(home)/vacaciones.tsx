import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Modal,
} from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { getSession } from "@/lib/storage";
import {
  fetchVacation, submitVacationRequest,
  VacationBalance, VacationRequest,
} from "@/lib/api";

const MONTHS_ES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];
const DAYS_ES = ["L","M","M","J","V","S","D"];

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
};
const STATUS_COLOR: Record<string, string> = {
  pending: "#d97706", approved: "#16a34a", rejected: "#dc2626",
};
const STATUS_BG: Record<string, string> = {
  pending: "#fef3c7", approved: "#f0fdf4", rejected: "#fef2f2",
};

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  const months = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${d} ${months[parseInt(m) - 1]} ${y}`;
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

function todayIso(): string {
  return new Date().toLocaleDateString("en-CA");
}

function getDaysInMonth(y: number, m: number): number {
  return new Date(y, m + 1, 0).getDate();
}

function getFirstDOW(y: number, m: number): number {
  const d = new Date(y, m, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

function isoFromParts(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function isDOWWeekend(iso: string): boolean {
  const d = new Date(iso + "T12:00:00").getDay();
  return d === 0 || d === 6;
}

type SelPhase = "idle" | "picking_end" | "complete";

export default function VacacionesScreen() {
  const [balance, setBalance] = useState<VacationBalance | null>(null);
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [empId, setEmpId] = useState<number | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [startDate, setStartDate] = useState(todayIso());
  const [endDate, setEndDate] = useState(todayIso());
  const [submitting, setSubmitting] = useState(false);

  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [selPhase, setSelPhase] = useState<SelPhase>("idle");

  useFocusEffect(
    useCallback(() => { load(); }, [])
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
    } catch { }
    finally { setLoading(false); }
  }

  function openModal() {
    const now = new Date();
    setCalYear(now.getFullYear());
    setCalMonth(now.getMonth());
    setStartDate(todayIso());
    setEndDate(todayIso());
    setSelPhase("idle");
    setModalVisible(true);
  }

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  }

  function handleCalendarDay(iso: string) {
    if (selPhase === "idle" || selPhase === "complete") {
      setStartDate(iso);
      setEndDate(iso);
      setSelPhase("picking_end");
    } else {
      if (iso < startDate) {
        setStartDate(iso);
        setEndDate(iso);
        setSelPhase("picking_end");
      } else {
        setEndDate(iso);
        setSelPhase("complete");
      }
    }
  }

  const weekdays = selPhase === "complete" ? countWeekdays(startDate, endDate) : 0;
  const available = balance?.days_available ?? 0;
  const canSubmit = selPhase === "complete" && weekdays > 0 && weekdays <= available;

  async function handleSubmit() {
    if (!empId) return;
    if (weekdays <= 0) {
      Alert.alert("Sin días hábiles", "El rango seleccionado no incluye días hábiles.");
      return;
    }
    if (weekdays > available) {
      Alert.alert("Saldo insuficiente", `Tienes ${available} días disponibles, estás solicitando ${weekdays}.`);
      return;
    }
    Alert.alert(
      "Confirmar solicitud",
      `${weekdays} día${weekdays !== 1 ? "s" : ""} de vacaciones\n${fmtDate(startDate)} — ${fmtDate(endDate)}`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Enviar", onPress: async () => {
            setSubmitting(true);
            try {
              await submitVacationRequest(empId, startDate, endDate, weekdays);
              setModalVisible(false);
              await load();
              Alert.alert("Solicitud enviada", "Espera la aprobación de tu administrador.");
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

  const granted = balance?.days_granted ?? 0;
  const used = balance?.days_used ?? 0;
  const pct = granted > 0 ? Math.min(1, available / granted) : 0;

  // Calendar grid
  const todayStr = todayIso();
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDOW = getFirstDOW(calYear, calMonth);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

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
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${Math.round(pct * 100)}%` as any }]} />
        </View>
        <Text style={styles.progressLabel}>
          {granted > 0 ? `${Math.round(pct * 100)}% disponible` : "Sin días asignados este año"}
        </Text>
      </View>

      {/* Request button */}
      <TouchableOpacity
        style={[styles.requestBtn, available <= 0 && styles.requestBtnDisabled]}
        onPress={openModal}
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
      ) : requests.map((r) => (
        <View key={r.id} style={styles.requestRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.requestDates}>{fmtDate(r.start_date)} — {fmtDate(r.end_date)}</Text>
            <Text style={styles.requestDays}>{r.days_count} día{r.days_count !== 1 ? "s" : ""} hábiles</Text>
            {r.review_notes ? <Text style={styles.requestNote}>{r.review_notes}</Text> : null}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_BG[r.status] ?? "#f3f4f6" }]}>
            <Text style={[styles.statusText, { color: STATUS_COLOR[r.status] ?? "#6b7280" }]}>
              {STATUS_LABEL[r.status] ?? r.status}
            </Text>
          </View>
        </View>
      ))}

      {/* Calendar modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={cal.root}>

          {/* Header */}
          <View style={cal.header}>
            <Text style={cal.headerTitle}>Solicitar vacaciones</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={cal.closeBtn}>
              <Text style={cal.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Instruction banner */}
          <View style={[
            cal.instrBanner,
            selPhase === "complete" && cal.instrBannerDone,
          ]}>
            <Text style={[cal.instrTxt, selPhase === "complete" && cal.instrTxtDone]}>
              {selPhase === "idle"
                ? "Toca el primer día de tus vacaciones"
                : selPhase === "picking_end"
                  ? `Inicio: ${fmtDate(startDate)}  ·  Ahora toca el último día`
                  : `${fmtDate(startDate)}  —  ${fmtDate(endDate)}`
              }
            </Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Month navigation */}
            <View style={cal.monthNav}>
              <TouchableOpacity onPress={prevMonth} style={cal.navBtn}>
                <Text style={cal.navArrow}>‹</Text>
              </TouchableOpacity>
              <Text style={cal.monthLabel}>{MONTHS_ES[calMonth]} {calYear}</Text>
              <TouchableOpacity onPress={nextMonth} style={cal.navBtn}>
                <Text style={cal.navArrow}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Day names */}
            <View style={cal.dayNamesRow}>
              {DAYS_ES.map((d, i) => (
                <Text key={i} style={[cal.dayName, i >= 5 && cal.dayNameWknd]}>{d}</Text>
              ))}
            </View>

            {/* Grid */}
            <View style={cal.grid}>
              {Array.from({ length: firstDOW }).map((_, i) => (
                <View key={`e-${i}`} style={cal.cell} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const iso = isoFromParts(calYear, calMonth, day);
                const isStart = iso === startDate && selPhase !== "idle";
                const isEnd = iso === endDate && selPhase === "complete";
                const inRange = selPhase === "complete" && iso > startDate && iso < endDate;
                const isEdge = isStart || isEnd;
                const isSingle = isStart && isEnd;
                const isToday = iso === todayStr;
                const isWknd = isDOWWeekend(iso);

                return (
                  <TouchableOpacity
                    key={iso}
                    style={[
                      cal.cell,
                      inRange && cal.cellRange,
                      isStart && !isSingle && cal.cellStart,
                      isEnd && !isSingle && cal.cellEnd,
                    ]}
                    onPress={() => handleCalendarDay(iso)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      cal.dayCircle,
                      isEdge && cal.dayCircleSel,
                      isToday && !isEdge && cal.dayCircleToday,
                    ]}>
                      <Text style={[
                        cal.dayTxt,
                        isWknd && !isEdge && !inRange && cal.dayTxtWknd,
                        isEdge && cal.dayTxtSel,
                        inRange && !isEdge && cal.dayTxtRange,
                        isToday && !isEdge && cal.dayTxtToday,
                      ]}>
                        {day}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Legend */}
            <View style={cal.legend}>
              <View style={cal.legendItem}>
                <View style={[cal.legendDot, { backgroundColor: "#1a1a1a" }]} />
                <Text style={cal.legendTxt}>Inicio / Fin</Text>
              </View>
              <View style={cal.legendItem}>
                <View style={[cal.legendDot, { backgroundColor: "#bbf7d0" }]} />
                <Text style={cal.legendTxt}>Días solicitados</Text>
              </View>
              <View style={cal.legendItem}>
                <View style={[cal.legendDot, { backgroundColor: "#dbeafe", borderWidth: 1.5, borderColor: "#93c5fd" }]} />
                <Text style={cal.legendTxt}>Hoy</Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={cal.footer}>
            {selPhase === "complete" ? (
              <>
                <View style={cal.summaryRow}>
                  <Text style={cal.summaryNum}>{weekdays}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={cal.summaryLabel}>días hábiles solicitados</Text>
                    <Text style={[cal.summaryBal, { color: weekdays <= available ? "#16a34a" : "#dc2626" }]}>
                      {weekdays <= available
                        ? `Quedarán ${available - weekdays} días disponibles`
                        : `Saldo insuficiente — tienes ${available}`
                      }
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[cal.submitBtn, (!canSubmit || submitting) && cal.submitBtnOff]}
                  onPress={handleSubmit}
                  disabled={!canSubmit || submitting}
                >
                  {submitting
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={cal.submitTxt}>ENVIAR SOLICITUD</Text>
                  }
                </TouchableOpacity>
                <TouchableOpacity style={cal.resetBtn} onPress={() => setSelPhase("idle")}>
                  <Text style={cal.resetTxt}>Seleccionar otras fechas</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={cal.footerHint}>
                {selPhase === "picking_end"
                  ? "Toca el último día de tus vacaciones"
                  : "Selecciona el rango de fechas en el calendario"}
              </Text>
            )}
          </View>
        </View>
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

  balanceCard: { backgroundColor: "#1a1a1a", borderRadius: 16, padding: 20, marginBottom: 20 },
  balanceRow: { flexDirection: "row", marginBottom: 16 },
  balanceStat: { flex: 1, alignItems: "center", paddingVertical: 4 },
  balanceNum: { fontSize: 32, fontWeight: "900", letterSpacing: -1, lineHeight: 40 },
  balanceLbl: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.5)", letterSpacing: 1, marginTop: 4, textTransform: "uppercase" },
  progressBg: { height: 4, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 2, marginBottom: 8 },
  progressFill: { height: "100%", backgroundColor: "#16a34a", borderRadius: 2 },
  progressLabel: { fontSize: 11, color: "rgba(255,255,255,0.45)", textAlign: "center" },

  requestBtn: { backgroundColor: "#2563EB", borderRadius: 12, paddingVertical: 20, alignItems: "center", marginBottom: 32 },
  requestBtnDisabled: { backgroundColor: "#ccc" },
  requestBtnText: { fontSize: 14, fontWeight: "900", color: "#fff", letterSpacing: 1.5 },
  requestBtnSub: { fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 4 },

  sectionTitle: { fontSize: 10, fontWeight: "700", color: "#aaa", letterSpacing: 2, marginBottom: 12 },
  emptyText: { fontSize: 13, color: "#bbb" },

  requestRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#e8e4de" },
  requestDates: { fontSize: 14, fontWeight: "700", color: "#1a1a1a" },
  requestDays: { fontSize: 12, color: "#888", marginTop: 2 },
  requestNote: { fontSize: 11, color: "#dc2626", marginTop: 3, fontStyle: "italic" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: "700" },
});

const cal = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F5F1EB" },

  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
    backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e8e4de",
  },
  headerTitle: { fontSize: 17, fontWeight: "800", color: "#1a1a1a" },
  closeBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#f0ece6", justifyContent: "center", alignItems: "center" },
  closeTxt: { fontSize: 13, color: "#666", fontWeight: "600" },

  instrBanner: { backgroundColor: "#f8f4ee", paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#e8e4de" },
  instrBannerDone: { backgroundColor: "#f0fdf4" },
  instrTxt: { fontSize: 13, fontWeight: "600", color: "#555" },
  instrTxtDone: { color: "#16a34a" },

  monthNav: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 18 },
  navBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#fff", justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4, elevation: 2 },
  navArrow: { fontSize: 24, color: "#1a1a1a", lineHeight: 28 },
  monthLabel: { fontSize: 18, fontWeight: "800", color: "#1a1a1a", letterSpacing: -0.3 },

  dayNamesRow: { flexDirection: "row", paddingHorizontal: 16, marginBottom: 6 },
  dayName: { flex: 1, textAlign: "center", fontSize: 11, fontWeight: "700", color: "#999", letterSpacing: 0.5 },
  dayNameWknd: { color: "#ccc" },

  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, marginBottom: 8 },
  cell: { width: "14.2857%" as any, aspectRatio: 1, justifyContent: "center", alignItems: "center" },

  cellRange: { backgroundColor: "#bbf7d0" },
  cellStart: { borderTopLeftRadius: 100, borderBottomLeftRadius: 100, backgroundColor: "#bbf7d0" },
  cellEnd: { borderTopRightRadius: 100, borderBottomRightRadius: 100, backgroundColor: "#bbf7d0" },

  dayCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  dayCircleSel: { backgroundColor: "#1a1a1a" },
  dayCircleToday: { backgroundColor: "#dbeafe", borderWidth: 1.5, borderColor: "#93c5fd" },

  dayTxt: { fontSize: 15, fontWeight: "500", color: "#1a1a1a", textAlign: "center" },
  dayTxtWknd: { color: "#ccc" },
  dayTxtSel: { color: "#fff", fontWeight: "700" },
  dayTxtRange: { color: "#15803d", fontWeight: "600" },
  dayTxtToday: { color: "#1d4ed8", fontWeight: "700" },

  legend: { flexDirection: "row", justifyContent: "center", gap: 20, paddingHorizontal: 20, paddingBottom: 16 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendTxt: { fontSize: 11, color: "#888" },

  footer: {
    padding: 20, paddingBottom: 32,
    backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#e8e4de",
  },
  footerHint: { fontSize: 13, color: "#aaa", textAlign: "center", paddingVertical: 6 },

  summaryRow: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 16 },
  summaryNum: { fontSize: 52, fontWeight: "900", color: "#1a1a1a", letterSpacing: -2, lineHeight: 56 },
  summaryLabel: { fontSize: 14, fontWeight: "700", color: "#1a1a1a" },
  summaryBal: { fontSize: 12, fontWeight: "600", marginTop: 3 },

  submitBtn: { backgroundColor: "#1a1a1a", borderRadius: 12, paddingVertical: 16, alignItems: "center", marginBottom: 10 },
  submitBtnOff: { opacity: 0.35 },
  submitTxt: { fontSize: 14, fontWeight: "900", color: "#fff", letterSpacing: 1.5 },
  resetBtn: { paddingVertical: 10, alignItems: "center" },
  resetTxt: { fontSize: 13, color: "#888" },
});
