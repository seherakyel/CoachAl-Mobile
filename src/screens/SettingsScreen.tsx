import { useEffect, useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { Appbar, Button, Snackbar, Text, TextInput } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { CoachHeader } from "../components/chrome/CoachHeader";
import { emailLogout, updateUserDisplayName, updateUserPassword } from "../services/firebaseAuth";
import { useAuthStore } from "../store/useAuthStore";
import { CoachColors, CoachRadii, CoachShadow } from "../theme/coachTheme";

const APP_VERSION = "1.0.0";

export function SettingsScreen() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pwBusy, setPwBusy] = useState(false);

  useEffect(() => {
    setDisplayName(user?.displayName ?? "");
  }, [user?.displayName]);

  const initial = user?.email ? user.email[0].toUpperCase() : "U";

  return (
    <View style={{ flex: 1, backgroundColor: CoachColors.background }}>
      <CoachHeader />
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120, maxWidth: 720, width: "100%", alignSelf: "center" }}>
        <Text style={{ fontSize: 36, fontWeight: "700", color: CoachColors.onSurface, marginBottom: 8 }}>Ayarlar</Text>
        <Text style={{ fontSize: 18, lineHeight: 28, color: CoachColors.onSurfaceVariant, marginBottom: 32 }}>
          Hesap ve uygulama tercihlerinizi yönetin.
        </Text>

        {msg ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              padding: 16,
              backgroundColor: CoachColors.primaryFixed,
              borderRadius: CoachRadii.xl,
              borderWidth: 1,
              borderColor: CoachColors.primaryFixedDim,
              marginBottom: 24,
            }}
          >
            <MaterialCommunityIcons name="check-circle-outline" size={22} color={CoachColors.primary} />
            <Text style={{ flex: 1, fontSize: 14, color: CoachColors.onSurface }}>{msg}</Text>
          </View>
        ) : null}

        <View
          style={{
            backgroundColor: CoachColors.surfaceContainerLowest,
            borderWidth: 1,
            borderColor: CoachColors.outlineVariant,
            borderRadius: CoachRadii.xl,
            overflow: "hidden",
            marginBottom: 24,
            ...CoachShadow.card,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              paddingHorizontal: 24,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: CoachColors.outlineVariant,
              backgroundColor: CoachColors.surfaceContainerLow,
            }}
          >
            <MaterialCommunityIcons name="account-outline" size={22} color={CoachColors.primary} />
            <Text style={{ fontSize: 24, fontWeight: "600", color: CoachColors.onSurface }}>Hesap Bilgileri</Text>
          </View>
          <View style={{ padding: 24, gap: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: CoachColors.primaryFixed,
                  borderWidth: 2,
                  borderColor: CoachColors.primaryFixedDim,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 24, fontWeight: "700", color: CoachColors.primary }}>{initial}</Text>
              </View>
              <View>
                <Text style={{ fontSize: 14, fontWeight: "600", color: CoachColors.onSurface }}>{user?.email ?? "—"}</Text>
                <Text style={{ fontSize: 13, color: CoachColors.onSurfaceVariant, marginTop: 4 }}>Firebase Authentication</Text>
              </View>
            </View>
            <View>
              <Text style={{ fontSize: 14, fontWeight: "500", color: CoachColors.onSurface, marginBottom: 8 }}>Görünen Ad</Text>
              <TextInput
                mode="outlined"
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Adınızı girin"
                outlineColor={CoachColors.outlineVariant}
                activeOutlineColor={CoachColors.secondary}
                style={{ backgroundColor: CoachColors.surfaceContainerLow }}
              />
            </View>
            <Button
              mode="contained"
              icon="content-save-outline"
              loading={saving}
              onPress={async () => {
                const n = displayName.trim();
                if (!n) return;
                setSaving(true);
                setMsg(null);
                try {
                  await updateUserDisplayName(n);
                  setMsg("Profil güncellendi.");
                  setTimeout(() => setMsg(null), 3000);
                } catch (e) {
                  setMsg("Güncelleme başarısız: " + (e instanceof Error ? e.message : String(e)));
                }
                setSaving(false);
              }}
              buttonColor={CoachColors.primary}
              textColor={CoachColors.onPrimary}
              style={{ alignSelf: "flex-start", borderRadius: CoachRadii.md }}
            >
              Değişiklikleri Kaydet
            </Button>
          </View>
        </View>

        <View
          style={{
            backgroundColor: CoachColors.surfaceContainerLowest,
            borderWidth: 1,
            borderColor: CoachColors.outlineVariant,
            borderRadius: CoachRadii.xl,
            overflow: "hidden",
            marginBottom: 24,
            ...CoachShadow.card,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              paddingHorizontal: 24,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: CoachColors.outlineVariant,
              backgroundColor: CoachColors.surfaceContainerLow,
            }}
          >
            <MaterialCommunityIcons name="lock-outline" size={22} color={CoachColors.primary} />
            <Text style={{ fontSize: 24, fontWeight: "600", color: CoachColors.onSurface }}>Şifre Değiştir</Text>
          </View>
          <View style={{ padding: 24, gap: 16 }}>
            <View>
              <Text style={{ fontSize: 14, fontWeight: "500", color: CoachColors.onSurface, marginBottom: 8 }}>
                Yeni Şifre (min 6 karakter)
              </Text>
              <TextInput
                mode="outlined"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="••••••••"
                secureTextEntry
                outlineColor={CoachColors.outlineVariant}
                activeOutlineColor={CoachColors.secondary}
                style={{ backgroundColor: CoachColors.surfaceContainerLow }}
              />
            </View>
            {pwError ? (
              <View
                style={{
                  padding: 12,
                  backgroundColor: CoachColors.errorContainer,
                  borderRadius: CoachRadii.md,
                  borderWidth: 1,
                  borderColor: "rgba(186,26,26,0.2)",
                }}
              >
                <Text style={{ fontSize: 14, color: CoachColors.onErrorContainer }}>{pwError}</Text>
              </View>
            ) : null}
            <Button
              mode="contained"
              icon="lock-reset"
              loading={pwBusy}
              onPress={async () => {
                setPwError(null);
                if (newPassword.length < 6) {
                  setPwError("Şifre en az 6 karakter olmalı.");
                  return;
                }
                setPwBusy(true);
                try {
                  await updateUserPassword(newPassword);
                  setNewPassword("");
                  setMsg("Şifre başarıyla güncellendi.");
                  setTimeout(() => setMsg(null), 3000);
                } catch (e) {
                  setPwError(e instanceof Error ? e.message : "Şifre güncellenemedi.");
                }
                setPwBusy(false);
              }}
              buttonColor={CoachColors.primary}
              textColor={CoachColors.onPrimary}
              style={{ alignSelf: "flex-start", borderRadius: CoachRadii.md }}
            >
              Şifreyi Güncelle
            </Button>
          </View>
        </View>

        <View
          style={{
            backgroundColor: CoachColors.surfaceContainerLowest,
            borderWidth: 1,
            borderColor: CoachColors.outlineVariant,
            borderRadius: CoachRadii.xl,
            overflow: "hidden",
            marginBottom: 24,
            ...CoachShadow.card,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              paddingHorizontal: 24,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: CoachColors.outlineVariant,
              backgroundColor: CoachColors.surfaceContainerLow,
            }}
          >
            <MaterialCommunityIcons name="information-outline" size={22} color={CoachColors.onSurfaceVariant} />
            <Text style={{ fontSize: 24, fontWeight: "600", color: CoachColors.onSurface }}>Uygulama Bilgisi</Text>
          </View>
          <View style={{ padding: 24, gap: 4 }}>
            <Row label="Versiyon" value={APP_VERSION} />
            <Row label="Backend" value="FastAPI + Gemini" />
            <Row label="Veritabanı" value="Firebase Firestore" last />
          </View>
        </View>

        <View
          style={{
            backgroundColor: "rgba(255,218,214,0.35)",
            borderWidth: 1,
            borderColor: "rgba(186,26,26,0.2)",
            borderRadius: CoachRadii.xl,
            padding: 24,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: CoachColors.onSurface, marginBottom: 4 }}>Oturumu Kapat</Text>
            <Text style={{ fontSize: 14, color: CoachColors.onSurfaceVariant }}>Hesabınızdan güvenli çıkış yapın.</Text>
          </View>
          <Pressable
            onPress={async () => {
              await emailLogout();
              qc.clear();
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: CoachRadii.md,
              borderWidth: 1,
              borderColor: "rgba(186,26,26,0.3)",
            }}
          >
            <MaterialCommunityIcons name="logout" size={18} color={CoachColors.error} />
            <Text style={{ fontSize: 14, fontWeight: "600", color: CoachColors.error }}>Çıkış Yap</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: "rgba(199,196,216,0.5)",
      }}
    >
      <Text style={{ fontSize: 14, color: CoachColors.onSurfaceVariant }}>{label}</Text>
      <Text style={{ fontSize: 14, color: CoachColors.onSurface, fontFamily: "System" }}>{value}</Text>
    </View>
  );
}
