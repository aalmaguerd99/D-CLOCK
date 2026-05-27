import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, Platform, Linking, Alert,
} from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { getSession, getServerUrl, getCompanyInfo, EmployeeSession } from "@/lib/storage";

export default function CredentialScreen() {
  const [session, setSession]       = useState<EmployeeSession | null>(null);
  const [companyName, setCompanyName] = useState("D-CLOCK");
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [loading, setLoading]       = useState(false);
  const [refreshing, setRefreshing] = useState(true);

  useFocusEffect(
    useCallback(() => { loadData(); }, [])
  );

  async function loadData() {
    setRefreshing(true);
    try {
      const [s, cached] = await Promise.all([getSession(), getCompanyInfo()]);
      setSession(s);
      setCompanyName(cached.company_name);
      setCompanyLogo(cached.logo);
    } catch {}
    finally { setRefreshing(false); }
  }

  async function addToAppleWallet() {
    if (!session) return;
    setLoading(true);
    try {
      const serverUrl = await getServerUrl();
      if (!serverUrl) { Alert.alert("Sin conexión", "Conéctate al servidor antes de continuar."); return; }
      const url = `${serverUrl}/api/employees/${session.id}/pass.pkpass`;
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert("No disponible", "Tu dispositivo no puede abrir archivos Wallet.");
        return;
      }
      await Linking.openURL(url);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo generar la credencial.");
    } finally {
      setLoading(false);
    }
  }

  if (refreshing) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1a1a1a" /></View>;
  }

  const fullName = session
    ? `${session.name}${session.last_name ? " " + session.last_name : ""}`
    : "—";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Header */}
      <View style={styles.companyRow}>
        <Image
          source={companyLogo ? { uri: companyLogo } : require("@/assets/icon.png")}
          style={styles.companyLogo}
          resizeMode="contain"
        />
        <Text style={styles.companyName}>{companyName}</Text>
      </View>

      <Text style={styles.title}>TU CREDENCIAL</Text>
      <Text style={styles.subtitle}>Guárdala en tu Wallet para tenerla siempre a mano</Text>

      {/* Credential card preview */}
      <View style={styles.card}>
        <View style={styles.cardStripe} />
        <View style={styles.cardHeader}>
          <View style={styles.logoBox}>
            <Image
              source={companyLogo ? { uri: companyLogo } : require("@/assets/icon.png")}
              style={styles.cardLogo}
              resizeMode="cover"
            />
            <Text style={styles.cardCompany} numberOfLines={1}>
              {companyName.toUpperCase()}
            </Text>
          </View>
          {session?.photo ? (
            <Image source={{ uri: session.photo }} style={styles.cardPhoto} />
          ) : (
            <View style={[styles.cardPhoto, styles.cardPhotoPlaceholder]}>
              <Text style={styles.cardPhotoEmoji}>👤</Text>
            </View>
          )}
        </View>

        <Text style={styles.fieldLabel}>EMPLEADO</Text>
        <Text style={styles.fieldValue}>{fullName}</Text>

        <View style={styles.fieldsRow}>
          {session?.job_title_name ? (
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>PUESTO</Text>
              <Text style={styles.fieldValue} numberOfLines={2}>{session.job_title_name}</Text>
            </View>
          ) : null}
          {session?.area ? (
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>ÁREA</Text>
              <Text style={styles.fieldValue} numberOfLines={2}>{session.area}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.divider} />
        <View style={styles.fieldsRow}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>NO. EMPLEADO</Text>
            <Text style={styles.fieldValue}>{session?.employee_number ?? "—"}</Text>
          </View>
        </View>
      </View>

      {/* Wallet buttons */}
      {Platform.OS === "ios" ? (
        <TouchableOpacity
          style={[styles.walletBtn, loading && styles.disabled]}
          onPress={addToAppleWallet}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.walletBtnIcon}>🍎</Text>
              <Text style={styles.walletBtnLabel}>Agregar a Apple Wallet</Text>
            </>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.androidComingSoon}>
          <Text style={styles.androidComingSoonText}>
            Google Wallet — próximamente
          </Text>
        </View>
      )}

      <Text style={styles.hint}>
        Al tocar el botón se abrirá PassKit para agregar{"\n"}
        la credencial directamente a tu Wallet
      </Text>

    </ScrollView>
  );
}

const CARD_BG = "#1a1a1a";
const CARD_FG = "#ffffff";
const CARD_LBL = "rgba(255,255,255,0.55)";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F1EB" },
  content:   { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 40 },
  center:    { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5F1EB" },

  companyRow:  { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 28 },
  companyLogo: { width: 28, height: 28, borderRadius: 7 },
  companyName: { fontSize: 12, fontWeight: "700", color: "#aaa", letterSpacing: 1.5 },

  title:    { fontSize: 24, fontWeight: "900", color: "#1a1a1a", letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { fontSize: 13, color: "#888", marginBottom: 32 },

  /* Card */
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 22,
    marginBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
    overflow: "hidden",
  },
  cardStripe: {
    position: "absolute", top: 0, left: 0, right: 0, height: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  logoBox:    { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  cardLogo:   { width: 30, height: 30, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.15)" },
  cardCompany:{ fontSize: 10, fontWeight: "800", color: "rgba(255,255,255,0.7)", letterSpacing: 1.2, flex: 1 },
  cardPhoto:  { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: "rgba(255,255,255,0.2)" },
  cardPhotoPlaceholder: { backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
  cardPhotoEmoji: { fontSize: 22 },

  fieldLabel: { fontSize: 8, fontWeight: "700", letterSpacing: 1.4, color: CARD_LBL, marginBottom: 3 },
  fieldValue: { fontSize: 15, fontWeight: "700", color: CARD_FG, marginBottom: 14, letterSpacing: -0.2 },

  fieldsRow:  { flexDirection: "row", gap: 20 },
  fieldGroup: { flex: 1 },

  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.12)", marginBottom: 14, marginTop: 2 },

  /* Wallet button */
  walletBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: "#1a1a1a",
    borderRadius: 14,
    paddingVertical: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  disabled:        { opacity: 0.5 },
  walletBtnIcon:   { fontSize: 20 },
  walletBtnLabel:  { fontSize: 15, fontWeight: "800", color: "#fff", letterSpacing: 0.3 },

  androidComingSoon: {
    borderRadius: 14, paddingVertical: 18, alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
    borderWidth: 1, borderColor: "rgba(0,0,0,0.08)",
    marginBottom: 16,
  },
  androidComingSoonText: { fontSize: 14, color: "#999", fontWeight: "600" },

  hint: { fontSize: 12, color: "#aaa", textAlign: "center", lineHeight: 18 },
});
