import { useEffect } from "react";
import { View, ActivityIndicator, Text, StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { initFirebaseFromRemote, subscribeAuth } from "./src/services/firebaseAuth";
import { useAuthStore } from "./src/store/useAuthStore";
import { NavigationRoot } from "./src/app/NavigationRoot";
import { AppProviders } from "./src/app/providers";
import { AuthScreen } from "./src/screens/AuthScreen";
import { extractDetail } from "./src/services/apiClient";
import { CoachColors } from "./src/theme/coachTheme";

function Gate() {
  const phase = useAuthStore((s) => s.phase);
  const user = useAuthStore((s) => s.user);
  const bootstrapError = useAuthStore((s) => s.bootstrapError);
  if (phase === "boot") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}>
        <ActivityIndicator />
      </View>
    );
  }
  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: CoachColors.background }}>
        {bootstrapError ? (
          <Text style={{ padding: 12, textAlign: "center", color: "#b91c1c" }}>{bootstrapError}</Text>
        ) : null}
        <AuthScreen />
      </View>
    );
  }
  return <NavigationRoot />;
}

export default function App() {
  useEffect(() => {
    let unsub: (() => void) | undefined;
    let alive = true;
    void (async () => {
      try {
        await initFirebaseFromRemote();
        if (!alive) return;
        unsub = subscribeAuth((u) => useAuthStore.getState().setUser(u));
        useAuthStore.getState().setPhase("ready");
      } catch (e) {
        useAuthStore.getState().setBootstrapError(extractDetail(e));
        useAuthStore.getState().setPhase("ready");
      }
    })();
    return () => {
      alive = false;
      unsub?.();
    };
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProviders>
        <StatusBar barStyle="dark-content" />
        <Gate />
      </AppProviders>
    </GestureHandlerRootView>
  );
}
