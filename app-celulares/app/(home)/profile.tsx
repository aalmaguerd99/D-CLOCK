import {
  View, Text, StyleSheet, TouchableOpacity, Alert, Image,
  ScrollView, ActivityIndicator, Platform,
} from "react-native";
import { useState, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  getSession, clearSession, getServerUrl, clearServerUrl,
  getCompanyInfo, EmployeeSession, saveSession,
} from "@/lib/storage";
import { registerFace } from "@/lib/api";
import { registerPushToken, getPushStatus } from "@/lib/notifications";

export default function ProfileScreen() {
  const router = useRouter();
  const [session, setSession] = useState<EmployeeSession | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("D-CLOCK");
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [hasFace, setHasFace] = useState(false);
  const [faceLoading, setFaceLoading] = useState(false);
  const [pushRegistered, setPushRegistered] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      Promise.all([getSession(), getServerUrl(), getCompanyInfo(), getPushStatus()]).then(
        ([s, url, info, push]) => {
          setSession(s);
          setHasFace(!!s?.has_face);
          setServerUrl(url);
          setCompanyName(info.company_name);
          setCompanyLogo(info.logo);
          setPushRegistered(push);
        }
      );
    }, [])
  );

  async function handleLogout() {
    Alert.alert("Cerrar sesión", "¿Confirmas que deseas salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir", style: "destructive",
        onPress: async () => { await clearSession(); router.replace("/login"); },
      },
    ]);
  }

  async function handleChangeServer() {
    Alert.alert("Cambiar servidor", "Se cerrará la sesión actual.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Continuar", style: "destructive",
        onPress: async () => {
          await clearSession();
          await clearServerUrl();
          router.replace("/setup");
        },
      },
    ]);
  }

  async function handleRegisterFace() {
    if (!session) return;
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Cámara requerida", "Activa el permiso de cámara en Configuración.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      cameraType: ImagePicker.CameraType.front,
      quality: 0.6,
      base64: true,
      exif: false,
      allowsEditing: false,
    });
    if (result.canceled) return;
    setFaceLoading(true);
    try {
      const b64 = result.assets[0].base64;
      const photo = b64 ? `data:image/jpeg;base64,${b64}` : null;
      if (!photo) throw new Error("No se pudo capturar la foto");
      const res = await registerFace(session.id, photo);
      if (res.ok) {
        setHasFace(true);
        const updated = { ...session, has_face: true };
        await saveSession(updated);
        setSession(updated);
        Alert.alert("Rostro registrado", "Tu identidad ya puede verificarse al fichar.");
      } else if (res.error === "no_face_detected") {
        Alert.alert("Rostro no detectado", "No se detectó ningún rostro en la foto.\n\nIntenta con mejor iluminación, mirando directo a la cámara frontal.");
      } else {
        Alert.alert("Error", res.error ?? "Error desconocido");
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo conectar al servidor");
    } finally {
      setFaceLoading(false);
    }
  }

  async function handleRegisterPush() {
    if (!session?.id) return;
    setPushLoading(true);
    const result = await registerPushToken(session.id);
    setPushLoading(false);
    if (result.ok) {
      setPushRegistered(true);
      Alert.alert("Notificaciones activadas", "Tu dispositivo recibirá mensajes del administrador.");
    } else {
      Alert.alert("Error al registrar", result.error ?? "Error desconocido");
    }
  }

  const initials = [session?.name?.[0], session?.last_name?.[0]].filter(Boolean).join("").toUpperCase() || "?";

  function fmtDate(s: string | null) {
    if (!s) return null;
    const d = new Date(s + "T12:00:00");
    return d.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Header strip */}
      <View style={styles.strip}>
        {session?.photo ? (
          <Image source={{ uri: session.photo }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitial}>{initials}</Text>
          </View>
        )}
        <View style={styles.stripInfo}>
          <Text style={styles.empName}>{session?.name ?? "—"}</Text>
          {session?.last_name ? <Text style={styles.empLastName}>{session.last_name}</Text> : null}
          <View style={styles.badgeRow}>
            <View style={styles.numBadge}>
              <Text style={styles.numBadgeText}>#{session?.employee_number ?? "—"}</Text>
            </View>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Activo</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Work info */}
      <Section label="EMPRESA">
        <Row label="Empresa">
          <View style={styles.companyInline}>
            <Image
              source={companyLogo ? { uri: companyLogo } : require("@/assets/icon.png")}
              style={styles.inlineLogo}
              resizeMode="contain"
            />
            <Text style={styles.rowValue}>{companyName}</Text>
          </View>
        </Row>
        {session?.job_title_name ? <Row label="Puesto" value={session.job_title_name} /> : null}
        {session?.department ? <Row label="Depto" value={session.department} upper /> : null}
        {session?.area ? <Row label="Área" value={session.area} upper /> : null}
        {session?.schedule_name ? <Row label="Horario" value={session.schedule_name} /> : null}
      </Section>

      {/* Contact */}
      {(session?.email || session?.phone) ? (
        <Section label="CONTACTO">
          {session?.email ? <Row label="Email" value={session.email} mono /> : null}
          {session?.phone ? <Row label="Tel" value={session.phone} mono /> : null}
        </Section>
      ) : null}

      {/* Personal */}
      {(session?.rfc || session?.curp || session?.nss || session?.birth_date || session?.gender || session?.address) ? (
        <Section label="DATOS PERSONALES">
          {session?.rfc ? <Row label="RFC" value={session.rfc} mono /> : null}
          {session?.curp ? <Row label="CURP" value={session.curp} mono small /> : null}
          {session?.nss ? <Row label="NSS" value={session.nss} mono /> : null}
          {session?.birth_date ? <Row label="Nac." value={fmtDate(session.birth_date) ?? session.birth_date} /> : null}
          {session?.gender ? <Row label="Género" value={session.gender} /> : null}
          {session?.address ? <Row label="Dir." value={session.address} wrap /> : null}
        </Section>
      ) : null}

      {/* Server */}
      {serverUrl ? (
        <Section label="CONEXIÓN">
          <Row label="Servidor" value={serverUrl} mono small />
        </Section>
      ) : null}

      {/* Face registration */}
      <Section label="VERIFICACIÓN FACIAL">
        <View style={{ paddingHorizontal: 16, paddingVertical: 14, gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={[faceStyles.indicator, hasFace ? faceStyles.indicatorOn : faceStyles.indicatorOff]} />
            <Text style={faceStyles.statusText}>
              {hasFace ? "Rostro registrado — verificación activa" : "Sin registro — la verificación está desactivada"}
            </Text>
          </View>
          <TouchableOpacity
            style={[faceStyles.faceBtn, hasFace && faceStyles.faceBtnRegistered]}
            onPress={handleRegisterFace}
            disabled={faceLoading}
            activeOpacity={0.8}
          >
            {faceLoading ? (
              <ActivityIndicator size="small" color={hasFace ? "#16a34a" : "#fff"} />
            ) : (
              <Text style={[faceStyles.faceBtnText, hasFace && faceStyles.faceBtnTextRegistered]}>
                {hasFace ? "Actualizar registro facial" : "Registrar mi rostro"}
              </Text>
            )}
          </TouchableOpacity>
          {!hasFace && (
            <Text style={faceStyles.hint}>
              Toma una selfie con buena iluminación mirando directo a la cámara frontal.
            </Text>
          )}
        </View>
      </Section>

      {/* Push notifications */}
      <Section label="NOTIFICACIONES PUSH">
        <View style={{ paddingHorizontal: 16, paddingVertical: 14, gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={[faceStyles.indicator, pushRegistered ? faceStyles.indicatorOn : faceStyles.indicatorOff]} />
            <Text style={faceStyles.statusText}>
              {pushRegistered ? "Dispositivo registrado — recibirás mensajes" : "Sin registrar — no recibirás notificaciones"}
            </Text>
          </View>
          <TouchableOpacity
            style={[faceStyles.faceBtn, pushRegistered && faceStyles.faceBtnRegistered]}
            onPress={handleRegisterPush}
            disabled={pushLoading}
            activeOpacity={0.8}
          >
            {pushLoading ? (
              <ActivityIndicator size="small" color={pushRegistered ? "#16a34a" : "#fff"} />
            ) : (
              <Text style={[faceStyles.faceBtnText, pushRegistered && faceStyles.faceBtnTextRegistered]}>
                {pushRegistered ? "Re-registrar dispositivo" : "Activar notificaciones"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </Section>

      {/* Credencial digital */}
      <Section label="CREDENCIAL DIGITAL">
        <View style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
          <TouchableOpacity
            style={faceStyles.faceBtn}
            onPress={() => router.push("/credential")}
            activeOpacity={0.8}
          >
            <Text style={faceStyles.faceBtnText}>
              {Platform.OS === "ios" ? "Agregar a Apple Wallet" : "Ver credencial"}
            </Text>
          </TouchableOpacity>
        </View>
      </Section>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.btn} onPress={handleChangeServer}>
          <Text style={styles.btnText}>Cambiar servidor</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={handleLogout}>
          <Text style={[styles.btnText, styles.btnDangerText]}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={secStyles.wrap}>
      <Text style={secStyles.label}>{label}</Text>
      <View style={secStyles.card}>{children}</View>
    </View>
  );
}

function Row({
  label, value, children, mono, upper, small, wrap,
}: {
  label: string;
  value?: string | null;
  children?: React.ReactNode;
  mono?: boolean;
  upper?: boolean;
  small?: boolean;
  wrap?: boolean;
}) {
  if (!value && !children) return null;
  return (
    <View style={[rowStyles.row, wrap && rowStyles.rowWrap]}>
      <Text style={rowStyles.label}>{label}</Text>
      {children ?? (
        <Text
          style={[
            rowStyles.value,
            mono && rowStyles.mono,
            upper && rowStyles.upper,
            small && rowStyles.small,
            wrap && rowStyles.wrapText,
          ]}
          numberOfLines={wrap ? 4 : 1}
        >
          {value}
        </Text>
      )}
    </View>
  );
}

const secStyles = StyleSheet.create({
  wrap: { marginBottom: 24, paddingHorizontal: 20 },
  label: { fontSize: 10, fontWeight: "800", color: "#aaa", letterSpacing: 1.5, marginBottom: 8 },
  card: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#ede9e3", overflow: "hidden" },
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: "#f0ece6",
  },
  rowWrap: { alignItems: "flex-start", flexDirection: "column", gap: 4 },
  label: { fontSize: 12, color: "#999", fontWeight: "600" },
  value: { fontSize: 13, color: "#1a1a1a", fontWeight: "600", maxWidth: "65%", textAlign: "right" },
  mono: { fontVariant: ["tabular-nums"] },
  upper: { textTransform: "uppercase", letterSpacing: 0.5 },
  small: { fontSize: 11 },
  wrapText: { maxWidth: "100%", textAlign: "left", fontSize: 12, color: "#444", fontWeight: "400" },
});

const faceStyles = StyleSheet.create({
  indicator: { width: 8, height: 8, borderRadius: 4 },
  indicatorOn: { backgroundColor: "#22c55e" },
  indicatorOff: { backgroundColor: "#ccc" },
  statusText: { fontSize: 12, color: "#555", fontWeight: "600", flex: 1 },
  faceBtn: { backgroundColor: "#1a1a1a", borderRadius: 10, paddingVertical: 14, alignItems: "center" },
  faceBtnRegistered: { backgroundColor: "#f0fdf4", borderWidth: 1.5, borderColor: "#86efac" },
  faceBtnText: { fontSize: 13, fontWeight: "700", color: "#fff", letterSpacing: 0.5 },
  faceBtnTextRegistered: { color: "#16a34a" },
  hint: { fontSize: 11, color: "#aaa", textAlign: "center", lineHeight: 16 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F1EB" },
  content: { paddingTop: 56, paddingBottom: 40 },

  strip: {
    flexDirection: "row", alignItems: "center", gap: 16,
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 20, paddingVertical: 20,
    marginBottom: 28,
  },
  avatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: "#333" },
  avatarFallback: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: "#333", justifyContent: "center", alignItems: "center",
  },
  avatarInitial: { fontSize: 24, fontWeight: "800", color: "#fff" },
  stripInfo: { flex: 1 },
  empName: { fontSize: 20, fontWeight: "800", color: "#fff", letterSpacing: 0.2 },
  empLastName: { fontSize: 16, fontWeight: "600", color: "#aaa", marginTop: 1 },
  badgeRow: { flexDirection: "row", gap: 6, marginTop: 8 },
  numBadge: {
    backgroundColor: "#2a2a2a", paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 4, borderWidth: 1, borderColor: "#333",
  },
  numBadgeText: { fontSize: 10, color: "#aaa", fontWeight: "700", fontVariant: ["tabular-nums"] },
  activeBadge: { backgroundColor: "#14532d", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  activeBadgeText: { fontSize: 10, color: "#4ade80", fontWeight: "700" },

  companyInline: { flexDirection: "row", alignItems: "center", gap: 6 },
  inlineLogo: { width: 20, height: 20, borderRadius: 4 },
  rowValue: { fontSize: 13, color: "#1a1a1a", fontWeight: "600" },

  actions: { paddingHorizontal: 20, gap: 10 },
  btn: {
    borderWidth: 1.5, borderColor: "#ccc", borderRadius: 10,
    paddingVertical: 14, alignItems: "center",
  },
  btnText: { fontSize: 13, fontWeight: "700", color: "#1a1a1a", letterSpacing: 0.5 },
  btnDanger: { borderColor: "#d63b3b" },
  btnDangerText: { color: "#d63b3b" },
});
