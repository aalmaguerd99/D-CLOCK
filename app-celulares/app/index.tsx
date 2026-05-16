import { useEffect } from "react";
import { useRouter } from "expo-router";
import { getServerUrl, getSession } from "@/lib/storage";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const url = await getServerUrl();
      if (!url) {
        router.replace("/setup");
        return;
      }
      const session = await getSession();
      if (!session) {
        router.replace("/login");
        return;
      }
      router.replace("/(home)");
    })();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5F1EB" }}>
      <ActivityIndicator size="large" color="#1a1a1a" />
    </View>
  );
}
