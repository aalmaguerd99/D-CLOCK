import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Platform, Linking, Alert,
  Dimensions,
} from "react-native";
import { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { getSession, getServerUrl } from "@/lib/storage";

const CARD_W = Dimensions.get("window").width - 48;

export default function CredentialScreen() {
  const [loading, setLoading] = useState(false);

  async function addToWallet() {
    const session = await getSession();
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

  return (
    <View style={ss.root}>
      <View style={ss.content}>
        {/* Ícono */}
        <View style={ss.iconWrap}>
          <Ionicons name="card-outline" size={48} color="#1a1a1a" />
        </View>

        <Text style={ss.title}>Credencial digital</Text>
        <Text style={ss.sub}>Agrega tu pase de empleado directamente a Apple Wallet</Text>

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
          <View style={ss.androidNote}>
            <Ionicons name="information-circle-outline" size={18} color="#aaa" />
            <Text style={ss.androidTxt}>Apple Wallet solo disponible en iPhone</Text>
          </View>
        )}

        <Text style={ss.hint}>Se abrirá PassKit para agregar la credencial{"\n"}directamente a tu Wallet</Text>
      </View>
    </View>
  );
}

const ss = StyleSheet.create({
  root:    { flex: 1, backgroundColor: "#F5F1EB" },
  content: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingHorizontal: 24, paddingBottom: 48,
  },

  iconWrap: {
    width: 88, height: 88, borderRadius: 24,
    backgroundColor: "#fff", borderWidth: 1, borderColor: "rgba(0,0,0,0.08)",
    alignItems: "center", justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },

  title: { fontSize: 24, fontWeight: "900", color: "#1a1a1a", letterSpacing: -0.5, marginBottom: 8, textAlign: "center" },
  sub:   { fontSize: 14, color: "#666", textAlign: "center", lineHeight: 20, marginBottom: 40, maxWidth: 260 },

  appleBtn: {
    width: CARD_W, backgroundColor: "#000", borderRadius: 16,
    paddingVertical: 17, alignItems: "center", marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25, shadowRadius: 16, elevation: 8,
  },
  disabled:      { opacity: 0.5 },
  appleBtnInner: { flexDirection: "row", alignItems: "center", gap: 12 },
  appleSmall:    { fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: "400" },
  appleBig:      { fontSize: 19, color: "#fff", fontWeight: "700", letterSpacing: -0.3 },

  androidNote: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(0,0,0,0.04)", borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16,
  },
  androidTxt: { fontSize: 13, color: "#aaa" },

  hint: { fontSize: 12, color: "#bbb", textAlign: "center", lineHeight: 18 },
});
