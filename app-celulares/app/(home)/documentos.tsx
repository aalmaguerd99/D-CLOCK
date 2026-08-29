import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Linking, Platform,
} from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import * as LocalAuthentication from "expo-local-authentication";
import { getSession, getServerUrl } from "@/lib/storage";
import { fetchHrDocuments, signHrDocument, HrDocument } from "@/lib/api";

const BG = "#F5F1EB";
const SURFACE = "#FEFCF9";
const ACCENT = "#2563EB";
const TEXT = "#1a1a1a";
const MUTED = "#9b8f84";
const BORDER = "rgba(0,0,0,0.08)";
const GREEN = "#16a34a";
const GREEN_BG = "#dcfce7";
const AMBER = "#92400e";
const AMBER_BG = "#fef3c7";
const BLUE_BG = "#dbeafe";
const BLUE = "#1e3a8a";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const months = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function StatusChip({ doc }: { doc: HrDocument }) {
  if (doc.signed_at) return (
    <View style={[styles.chip, { backgroundColor: GREEN_BG }]}>
      <Text style={[styles.chipText, { color: GREEN }]}>Firmado</Text>
    </View>
  );
  if (doc.viewed_at) return (
    <View style={[styles.chip, { backgroundColor: AMBER_BG }]}>
      <Text style={[styles.chipText, { color: AMBER }]}>Visto · Pendiente firma</Text>
    </View>
  );
  return (
    <View style={[styles.chip, { backgroundColor: BLUE_BG }]}>
      <Text style={[styles.chipText, { color: BLUE }]}>Pendiente</Text>
    </View>
  );
}

export default function DocumentosScreen() {
  const [docs, setDocs] = useState<HrDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState<number | null>(null);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [serverUrl, setServerUrl] = useState<string>("");

  useFocusEffect(
    useCallback(() => {
      let active = true;
      async function load() {
        setLoading(true);
        try {
          const [session, url] = await Promise.all([getSession(), getServerUrl()]);
          if (!session?.id || !active) return;
          setEmployeeId(session.id);
          setServerUrl(url ?? "");
          const data = await fetchHrDocuments(session.id);
          if (active) setDocs(data ?? []);
        } catch {
          if (active) setDocs([]);
        } finally {
          if (active) setLoading(false);
        }
      }
      load();
      return () => { active = false; };
    }, [])
  );

  async function handleView(doc: HrDocument) {
    if (!employeeId || !serverUrl) return;
    const url = `${serverUrl}/api/mobile/hr/documents/${doc.id}/file?employee_id=${employeeId}`;
    try {
      await Linking.openURL(url);
      // Refresh after viewing so viewed_at updates
      setTimeout(async () => {
        try {
          const session = await getSession();
          if (session?.id) {
            const data = await fetchHrDocuments(session.id);
            setDocs(data ?? []);
          }
        } catch {}
      }, 2000);
    } catch {
      Alert.alert("Error", "No se pudo abrir el documento.");
    }
  }

  async function handleSign(doc: HrDocument) {
    if (!employeeId) return;
    const hasHW = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHW || !isEnrolled) {
      Alert.alert(
        "Sin biométrico",
        "Este dispositivo no tiene huella o Face ID configurado. No se puede firmar.",
      );
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Firma el documento con tu biométrico",
      cancelLabel: "Cancelar",
      disableDeviceFallback: false,
    });

    if (!result.success) return;

    setSigning(doc.id);
    try {
      const device_info: Record<string, string> = {
        os: Platform.OS,
        version: String(Platform.Version),
      };
      await signHrDocument(doc.id, employeeId, device_info);

      // Refresh list
      const data = await fetchHrDocuments(employeeId);
      setDocs(data ?? []);
      Alert.alert("Firmado", "El documento ha sido firmado correctamente.");
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "No se pudo firmar.");
    } finally {
      setSigning(null);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Documentos</Text>
        <Text style={styles.headerSub}>{docs.length} documento{docs.length !== 1 ? "s" : ""}</Text>
      </View>

      {docs.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>📄</Text>
          <Text style={styles.emptyText}>Sin documentos pendientes</Text>
          <Text style={styles.emptyHint}>Aquí aparecerán los documentos que RH te envíe para firmar.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {docs.map((doc) => (
            <View key={doc.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.docIcon}>
                  <Text style={{ fontSize: 20 }}>
                    {doc.file_type?.includes("pdf") ? "📄" : "🖼️"}
                  </Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.docTitle} numberOfLines={2}>{doc.title}</Text>
                  {doc.description ? (
                    <Text style={styles.docDesc} numberOfLines={2}>{doc.description}</Text>
                  ) : null}
                </View>
              </View>

              <StatusChip doc={doc} />

              <Text style={styles.docDate}>Recibido {fmtDate(doc.sent_at)}</Text>
              {doc.expires_at ? (
                <Text style={[styles.docDate, { color: "#dc2626" }]}>Vence {fmtDate(doc.expires_at)}</Text>
              ) : null}

              <View style={styles.actions}>
                <TouchableOpacity style={styles.btnSecondary} onPress={() => handleView(doc)}>
                  <Text style={styles.btnSecondaryText}>Ver documento</Text>
                </TouchableOpacity>
                {!doc.signed_at && (
                  <TouchableOpacity
                    style={[styles.btnPrimary, signing === doc.id && styles.btnDisabled]}
                    onPress={() => handleSign(doc)}
                    disabled={signing === doc.id}
                  >
                    {signing === doc.id ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.btnPrimaryText}>Firmar</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {doc.signed_at ? (
                <View style={styles.signedBadge}>
                  <Text style={styles.signedText}>✓ Firmado el {fmtDate(doc.signed_at)}</Text>
                </View>
              ) : null}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  header: {
    paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20,
    backgroundColor: SURFACE,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: TEXT },
  headerSub: { fontSize: 13, color: MUTED, marginTop: 2 },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: SURFACE, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: BORDER,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardTop: { flexDirection: "row", gap: 12, marginBottom: 12, alignItems: "flex-start" },
  docIcon: {
    width: 42, height: 42, borderRadius: 10,
    backgroundColor: "rgba(37,99,235,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  docTitle: { fontSize: 15, fontWeight: "700", color: TEXT, lineHeight: 20 },
  docDesc: { fontSize: 12, color: MUTED, marginTop: 3, lineHeight: 17 },
  chip: { alignSelf: "flex-start", borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 8 },
  chipText: { fontSize: 11, fontWeight: "700" },
  docDate: { fontSize: 11, color: MUTED, marginBottom: 2 },
  actions: { flexDirection: "row", gap: 8, marginTop: 12 },
  btnSecondary: {
    flex: 1, borderRadius: 10, paddingVertical: 10,
    borderWidth: 1.5, borderColor: BORDER,
    alignItems: "center",
  },
  btnSecondaryText: { fontSize: 13, fontWeight: "700", color: TEXT },
  btnPrimary: {
    flex: 1, borderRadius: 10, paddingVertical: 10,
    backgroundColor: ACCENT, alignItems: "center",
  },
  btnPrimaryText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  btnDisabled: { opacity: 0.6 },
  signedBadge: {
    marginTop: 10, padding: 8, borderRadius: 8,
    backgroundColor: GREEN_BG, alignItems: "center",
  },
  signedText: { fontSize: 12, fontWeight: "700", color: GREEN },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: "700", color: TEXT, marginBottom: 8 },
  emptyHint: { fontSize: 13, color: MUTED, textAlign: "center", lineHeight: 18 },
});
