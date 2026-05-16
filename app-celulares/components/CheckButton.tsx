import {
  TouchableOpacity, Text, StyleSheet, Animated, View,
} from "react-native";
import { useEffect, useRef } from "react";
import * as Haptics from "expo-haptics";

interface Props {
  type: "in" | "out" | null;
  loading: boolean;
  onPress: () => void;
}

export default function CheckButton({ type, loading, onPress }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    onPress();
  }

  const isIn = type === "in";
  const bg = loading ? "#999" : isIn ? "#1a1a1a" : "#d63b3b";
  const label = loading ? "..." : isIn ? "REGISTRAR ENTRADA" : "REGISTRAR SALIDA";
  const sublabel = isIn ? "Tocar para fichar entrada" : "Tocar para fichar salida";

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: bg }]}
        onPress={handlePress}
        activeOpacity={0.85}
        disabled={loading}
      >
        <Text style={styles.icon}>{isIn ? "▶" : "◼"}</Text>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.sub}>{sublabel}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: "100%" },
  btn: {
    borderRadius: 16,
    paddingVertical: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  icon: { fontSize: 32, color: "#fff", marginBottom: 10 },
  label: {
    fontSize: 18, fontWeight: "900", color: "#fff",
    letterSpacing: 2, textAlign: "center",
  },
  sub: {
    fontSize: 12, color: "rgba(255,255,255,0.6)",
    marginTop: 6, letterSpacing: 0.5,
  },
});
