import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { setServerUrl } from "@/lib/storage";
import { testConnection } from "@/lib/api";

export default function SetupScreen() {
  const router = useRouter();
  const [ip, setIp] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleConnect() {
    const raw = ip.trim();
    if (!raw) return;
    let url: string;
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      url = raw;
    } else if (raw.includes(":")) {
      // IP:puerto  o  host:puerto
      url = `http://${raw}`;
    } else {
      // dominio o IP sin puerto — agrega el puerto por defecto
      url = `http://${raw}:7474`;
    }
    url = url.replace(/\/$/, "");
    setLoading(true);
    try {
      await setServerUrl(url);
      const res = await fetch(`${url}/api/info`, {
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        router.replace("/login");
      } else {
        Alert.alert("Error del servidor", `HTTP ${res.status}\n${url}/api/info`);
      }
    } catch (e: any) {
      Alert.alert("Sin conexión", `${e?.message ?? "Error desconocido"}\n\nURL: ${url}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>D-CLOCK</Text>
        <Text style={styles.sub}>Configurar servidor</Text>

        <Text style={styles.label}>Dirección del servidor</Text>
        <TextInput
          style={styles.input}
          placeholder="192.168.1.100  ó  mi-app.railway.app"
          placeholderTextColor="#aaa"
          value={ip}
          onChangeText={setIp}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          onSubmitEditing={handleConnect}
        />
        <Text style={styles.hint}>IP local, dominio o URL completa. Se agrega :7474 si no hay puerto.</Text>

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleConnect}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Conectar</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F1EB" },
  inner: {
    flex: 1, justifyContent: "center", paddingHorizontal: 32,
  },
  title: {
    fontSize: 36, fontWeight: "900", letterSpacing: 4,
    color: "#1a1a1a", textAlign: "center", marginBottom: 4,
  },
  sub: {
    fontSize: 13, color: "#888", textAlign: "center",
    letterSpacing: 2, textTransform: "uppercase", marginBottom: 48,
  },
  label: { fontSize: 11, color: "#666", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 },
  input: {
    borderWidth: 1.5, borderColor: "#ccc", borderRadius: 8,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, color: "#1a1a1a", backgroundColor: "#fff",
    marginBottom: 6,
  },
  hint: { fontSize: 12, color: "#aaa", marginBottom: 32 },
  btn: {
    backgroundColor: "#1a1a1a", borderRadius: 8,
    paddingVertical: 16, alignItems: "center",
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "700", letterSpacing: 1 },
});
