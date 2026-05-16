import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Image,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { authEmployee, fetchInfo, ServerInfo } from "@/lib/api";
import { saveSession, saveCompanyInfo, getServerUrl } from "@/lib/storage";

export default function LoginScreen() {
  const router = useRouter();
  const [info, setInfo] = useState<ServerInfo | null>(null);
  const [empNumber, setEmpNumber] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInfo().then(info => {
      setInfo(info);
      saveCompanyInfo(info).catch(() => null);
    }).catch(() => null);
  }, []);

  async function handleLogin() {
    if (!empNumber.trim() || !pin.trim()) return;
    setLoading(true);
    try {
      const res = await authEmployee(empNumber.trim(), pin.trim());
      await saveSession({
        id: res.id,
        employee_number: res.employee_number,
        name: res.name,
        last_name: res.last_name,
        photo: res.photo,
        department: res.department,
        area: res.area,
        job_title_name: res.job_title_name,
        schedule_name: res.schedule_name,
        email: res.email,
        phone: res.phone,
        rfc: res.rfc,
        curp: res.curp,
        nss: res.nss,
        birth_date: res.birth_date,
        gender: res.gender,
        address: res.address,
      });
      router.replace("/(home)");
    } catch (e: any) {
      Alert.alert("Error al iniciar sesión", e?.message ?? "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  function handleChangeServer() {
    router.replace("/setup");
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.inner}>
        {/* Company branding */}
        <View style={styles.brand}>
          {info?.logo ? (
            <Image
              source={{ uri: info.logo }}
              style={styles.logo}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.logoPlaceholder} />
          )}
          <Text style={styles.company}>
            {info?.company_name ?? "D-CLOCK"}
          </Text>
          <Text style={styles.welcomeText}>Bienvenido</Text>
        </View>

        {/* Form */}
        <Text style={styles.label}>Número de empleado</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. EMP-001"
          placeholderTextColor="#aaa"
          value={empNumber}
          onChangeText={setEmpNumber}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="next"
        />

        <Text style={styles.label}>PIN</Text>
        <TextInput
          style={styles.input}
          placeholder="••••"
          placeholderTextColor="#aaa"
          value={pin}
          onChangeText={setPin}
          secureTextEntry
          keyboardType="number-pad"
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Entrar</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkBtn} onPress={handleChangeServer}>
          <Text style={styles.linkText}>Cambiar servidor</Text>
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
  brand: { alignItems: "center", marginBottom: 48 },
  logo: { width: 80, height: 80, marginBottom: 12 },
  logoPlaceholder: {
    width: 80, height: 80, borderRadius: 8,
    backgroundColor: "#e0dbd2", marginBottom: 12,
  },
  company: {
    fontSize: 22, fontWeight: "800", color: "#1a1a1a",
    letterSpacing: 2, textAlign: "center",
  },
  welcomeText: {
    fontSize: 13, color: "#888", marginTop: 4,
    letterSpacing: 1, textTransform: "uppercase",
  },
  label: { fontSize: 11, color: "#666", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 },
  input: {
    borderWidth: 1.5, borderColor: "#ccc", borderRadius: 8,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, color: "#1a1a1a", backgroundColor: "#fff",
    marginBottom: 16,
  },
  btn: {
    backgroundColor: "#1a1a1a", borderRadius: 8,
    paddingVertical: 16, alignItems: "center", marginTop: 8,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "700", letterSpacing: 1 },
  linkBtn: { marginTop: 24, alignItems: "center" },
  linkText: { fontSize: 13, color: "#888", letterSpacing: 0.5 },
});
