import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, Platform, Linking, Alert,
  Dimensions,
} from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getSession, getServerUrl, getCompanyInfo, EmployeeSession } from "@/lib/storage";

const SCREEN_W = Dimensions.get("window").width;
const CARD_W   = SCREEN_W - 48;

const PRESET_COLORS: Record<string, string> = {
  midnight: "#0f3460", navy: "#1b3a5c", petrol: "#0d2d2d",
  forest:   "#0d2b1a", burgundy: "#5a1a35", slate: "#2e3f55",
  gold:     "#5c3d00", purple: "#3d1a7a", carbon: "#2d2d2d",
  copper:   "#5c2800", pearl: "#e8e2d8",  glacier: "#a8d8ea",
};

interface WalletConfig {
  bg_type: string; bg_preset: string; bg_image: string | null;
  bg_color: string; fg_color: string; label_color: string;
  overlay_color: string; overlay_opacity: string; fields_config: string | null;
}
interface FieldDef { dataKey: string; label: string; }
interface ZonesConfig { primary?: FieldDef[]; secondary?: FieldDef[]; auxiliary?: FieldDef[]; }
interface FieldsConfig { showPhoto?: boolean; zones?: ZonesConfig; }

function rgbToHex(rgb: string): string {
  const m = rgb.match(/\d+/g);
  if (!m || m.length < 3) return "#1a1a1a";
  return "#" + m.slice(0, 3).map(v => parseInt(v).toString(16).padStart(2, "0")).join("");
}

function blendColor(bg: string, overlay: string, opacity: number): string {
  if (opacity <= 0) return bg;
  const hex = (h: string) => {
    const v = h.replace("#", "").padStart(6, "0");
    return [parseInt(v.slice(0,2),16), parseInt(v.slice(2,4),16), parseInt(v.slice(4,6),16)];
  };
  const [br,bg2,bb] = hex(bg), [or,og,ob] = hex(overlay);
  const r = Math.round(br*(1-opacity)+or*opacity);
  const g = Math.round(bg2*(1-opacity)+og*opacity);
  const b = Math.round(bb*(1-opacity)+ob*opacity);
  return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
}

function fieldValue(key: string, s: EmployeeSession, company: string): string {
  const full = `${s.name}${s.last_name ? " " + s.last_name : ""}`;
  const map: Record<string, string> = {
    fullName: full, employee_number: s.employee_number || "",
    title: s.job_title_name || "", area_name: s.area || "",
    dept: s.department || "", email: s.email || "", phone: s.phone || "",
    nss: s.nss || "", rfc: s.rfc || "", curp: s.curp || "",
    birth_date: s.birth_date ? new Date(s.birth_date).toLocaleDateString("es-MX") : "",
    gender: s.gender || "", companyName: company,
  };
  return map[key] || "";
}

export default function CredentialScreen() {
  const [session,     setSession]     = useState<EmployeeSession | null>(null);
  const [companyName, setCompanyName] = useState("EMPRESA");
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [wConfig,     setWConfig]     = useState<WalletConfig | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [refreshing,  setRefreshing]  = useState(true);

  useFocusEffect(useCallback(() => { loadData(); }, []));

  async function loadData() {
    setRefreshing(true);
    try {
      const [s, cached] = await Promise.all([getSession(), getCompanyInfo()]);
      setSession(s);
      setCompanyName(cached.company_name || "EMPRESA");
      setCompanyLogo(cached.logo);
      const serverUrl = await getServerUrl();
      if (serverUrl) {
        try {
          const r = await fetch(`${serverUrl}/api/wallet/display`);
          if (r.ok) setWConfig(await r.json());
        } catch {}
      }
    } catch {}
    finally { setRefreshing(false); }
  }

  async function addToWallet() {
    if (!session) return;
    setLoading(true);
    try {
      const serverUrl = await getServerUrl();
      if (!serverUrl) { Alert.alert("Sin conexión", "Conéctate al servidor primero."); return; }
      const url = `${serverUrl}/api/employees/${session.id}/pass.pkpass`;
      if (!(await Linking.canOpenURL(url))) {
        Alert.alert("No disponible", "Tu dispositivo no puede abrir archivos Wallet.");
        return;
      }
      await Linking.openURL(url);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo generar la credencial.");
    } finally { setLoading(false); }
  }

  if (refreshing) {
    return <View style={ss.center}><ActivityIndicator size="large" color="#1a1a1a" /></View>;
  }

  // ── Resolve colors ──
  const fg  = wConfig ? rgbToHex(wConfig.fg_color)   : "#ffffff";
  const lbl = wConfig ? rgbToHex(wConfig.label_color) : "#aaaaaa";
  const bgType   = wConfig?.bg_type   || "preset";
  const bgPreset = wConfig?.bg_preset || "midnight";
  const bgImage  = wConfig?.bg_image  || null;
  const overlayColor   = wConfig?.overlay_color   || "#000000";
  const overlayOpacity = parseFloat(wConfig?.overlay_opacity || "0") / 100;

  const solidBg  = wConfig ? rgbToHex(wConfig.bg_color) : "#0f3460";
  const presetBg = PRESET_COLORS[bgPreset] || "#0f3460";
  const rawBg    = bgType === "solid" ? solidBg : presetBg;
  const cardBg   = bgType === "image" ? rawBg : blendColor(rawBg, overlayColor, overlayOpacity);

  // ── Fields config ──
  let fieldsConfig: FieldsConfig = {};
  try { if (wConfig?.fields_config) fieldsConfig = JSON.parse(wConfig.fields_config); } catch {}
  const showPhoto       = fieldsConfig.showPhoto !== false;
  const zones           = fieldsConfig.zones ?? {
    secondary: [{ dataKey: "area_name", label: "ÁREA" }, { dataKey: "dept", label: "DEPTO." }],
  };
  const secondaryFields = zones.secondary ?? [];

  // ── Card content (shared between plain View and ImageBackground) ──
  const cardContent = (
    <>
      {bgType === "image" && overlayOpacity > 0 && (
        <View style={[ss.overlay, { backgroundColor: overlayColor, opacity: overlayOpacity }]} />
      )}

      {/* Header: solo logo */}
      <View style={ss.cardHeader}>
        <Image
          source={companyLogo ? { uri: companyLogo } : require("@/assets/icon.png")}
          style={ss.cardLogo}
          resizeMode="contain"
        />
      </View>

      {/* Strip: nombre + apellido + puesto a la izquierda, foto a la derecha */}
      <View style={ss.strip}>
        <View style={ss.stripLeft}>
          <Text style={[ss.stripFirstName, { color: fg }]} numberOfLines={1}>
            {session?.name || "—"}
          </Text>
          {session?.last_name ? (
            <Text style={[ss.stripLastName, { color: fg + "DD" }]} numberOfLines={1}>
              {session.last_name}
            </Text>
          ) : null}
          <View style={[ss.stripSep, { backgroundColor: fg + "33" }]} />
          {session?.job_title_name ? (
            <Text style={[ss.stripJobTitle, { color: fg + "BB" }]} numberOfLines={2}>
              {session.job_title_name}
            </Text>
          ) : null}
        </View>
        {showPhoto ? (
          session?.photo
            ? <Image source={{ uri: session.photo }} style={ss.stripPhoto} resizeMode="cover" />
            : <View style={[ss.stripPhoto, ss.stripPhotoEmpty]}>
                <Text style={{ fontSize: 24 }}>👤</Text>
              </View>
        ) : null}
      </View>

      {/* Campos debajo del strip: solo ÁREA y DEPTO. */}
      {secondaryFields.length > 0 && session && (
        <View style={[ss.fieldsArea, { borderTopColor: fg + "1A" }]}>
          <View style={ss.fieldsRow}>
            {secondaryFields.map((f, i) => (
              <View key={i} style={ss.fieldCol}>
                <Text style={[ss.lbl, { color: lbl }]}>{f.label}</Text>
                <Text style={[ss.fieldVal, { color: fg }]} numberOfLines={2}>
                  {fieldValue(f.dataKey, session, companyName) || "—"}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </>
  );

  return (
    <ScrollView
      style={ss.root}
      contentContainerStyle={ss.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Encabezado de la página */}
      <View style={ss.pageHeader}>
        {companyLogo
          ? <Image source={{ uri: companyLogo }} style={ss.pageLogo} resizeMode="contain" />
          : null}
        <View>
          <Text style={ss.pageTitle}>Credencial digital</Text>
          <Text style={ss.pageSub}>Guárdala en tu Wallet para tenerla siempre a mano</Text>
        </View>
      </View>

      {/* Tarjeta — siempre color sólido, sin imagen de fondo */}
      <View style={[ss.card, { width: CARD_W, backgroundColor: cardBg }]}>
        {cardContent}
      </View>

      {/* Botón Apple / Google Wallet */}
      {Platform.OS === "ios" ? (
        <TouchableOpacity
          style={[ss.appleBtn, loading && ss.disabled]}
          onPress={addToWallet}
          disabled={loading}
          activeOpacity={0.88}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={ss.appleBtnInner}>
              <MaterialCommunityIcons name="apple" size={26} color="#fff" />
              <View>
                <Text style={ss.appleSmall}>Agregar a</Text>
                <Text style={ss.appleBig}>Apple Wallet</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      ) : (
        <View style={ss.googleBtn}>
          <Text style={ss.googleBtnText}>Google Wallet — próximamente</Text>
        </View>
      )}

      <Text style={ss.hint}>
        Se abrirá PassKit para agregar la credencial{"\n"}directamente a tu Wallet
      </Text>
    </ScrollView>
  );
}

const ss = StyleSheet.create({
  root:    { flex: 1, backgroundColor: "#F5F1EB" },
  content: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 48, alignItems: "center" },
  center:  { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5F1EB" },

  pageHeader: {
    flexDirection: "row", alignItems: "center", gap: 12,
    alignSelf: "flex-start", marginBottom: 28,
  },
  pageLogo:  { width: 38, height: 38, borderRadius: 10 },
  pageTitle: { fontSize: 22, fontWeight: "900", color: "#1a1a1a", letterSpacing: -0.5 },
  pageSub:   { fontSize: 13, color: "#888", marginTop: 1 },

  // ── Tarjeta ──
  card: {
    borderRadius: 20, overflow: "hidden", marginBottom: 28,
    shadowColor: "#000", shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45, shadowRadius: 28, elevation: 16,
  },
  overlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 20,
  },

  // Header: logo + nombre empresa
  cardHeader: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 18, paddingTop: 18, paddingBottom: 12,
  },
  cardLogo:    { width: 28, height: 28, borderRadius: 7, backgroundColor: "rgba(255,255,255,0.12)" },

  // Strip: texto a la izquierda, foto a la derecha
  strip: {
    flexDirection: "row", alignItems: "flex-end",
    paddingHorizontal: 18, paddingBottom: 18, gap: 14, minHeight: 110,
  },
  stripLeft:     { flex: 1, justifyContent: "flex-end" },
  stripFirstName: {
    fontSize: 30, fontWeight: "800", letterSpacing: -0.5, lineHeight: 34,
  },
  stripLastName: { fontSize: 19, fontWeight: "600", lineHeight: 23, marginTop: 1 },
  stripSep:      { width: 28, height: 2, borderRadius: 1, marginTop: 9, marginBottom: 6 },
  stripJobTitle: { fontSize: 13, fontWeight: "500", lineHeight: 17 },
  stripPhoto: {
    width: 80, height: 104, borderRadius: 12,
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.22)",
  },
  stripPhotoEmpty: {
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center", justifyContent: "center",
  },

  // Campos debajo del strip
  fieldsArea: {
    borderTopWidth: 1,
    paddingHorizontal: 18, paddingTop: 14, paddingBottom: 18,
  },
  fieldsRow: { flexDirection: "row", gap: 16, flexWrap: "wrap" },
  fieldCol:  { flex: 1, minWidth: 80 },
  lbl:       { fontSize: 8, fontWeight: "700", letterSpacing: 1.4, marginBottom: 4, textTransform: "uppercase" },
  fieldVal:  { fontSize: 13, fontWeight: "600" },
  divider:   { height: 1, marginVertical: 12 },

  // ── Apple Wallet button ──
  appleBtn: {
    width: CARD_W, backgroundColor: "#000", borderRadius: 14,
    paddingVertical: 15, alignItems: "center", marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22, shadowRadius: 12, elevation: 6,
  },
  disabled:       { opacity: 0.5 },
  appleBtnInner:  { flexDirection: "row", alignItems: "center", gap: 10 },
  appleLogo:      { fontSize: 28, color: "#fff" },
  appleSmall:     { fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: "400" },
  appleBig:       { fontSize: 18, color: "#fff", fontWeight: "700", letterSpacing: -0.3 },

  // ── Google Wallet ──
  googleBtn: {
    width: CARD_W, borderRadius: 14, paddingVertical: 15, alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)", borderWidth: 1, borderColor: "rgba(0,0,0,0.1)",
    marginBottom: 16,
  },
  googleBtnText: { fontSize: 14, color: "#999", fontWeight: "600" },

  hint: { fontSize: 12, color: "#aaa", textAlign: "center", lineHeight: 18 },
});
