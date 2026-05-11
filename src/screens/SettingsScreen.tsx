import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  TextInput,
  Switch,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { CoachHeader } from "../components/chrome/CoachHeader";
import { emailLogout, updateUserDisplayName, updateUserPassword } from "../services/firebaseAuth";
import { useAuthStore } from "../store/useAuthStore";

/** HTML mockup (Tailwind theme) ile hizalı ayarlar paleti */
const S = {
  background: "#f8f9fa",
  surfaceLowest: "#ffffff",
  surfaceHighest: "#e1e3e4",
  outlineVariant: "#c7c4d7",
  onSurface: "#191c1d",
  onSurfaceVariant: "#464554",
  primary: "#4648d4",
  onPrimary: "#ffffff",
  primaryFixed: "#e1e0ff",
  onPrimaryFixedVariant: "#2f2ebe",
  surfaceLow: "#f3f4f5",
  surfaceBright: "#f8f9fa",
  error: "#ba1a1a",
  onErrorContainer: "#93000a",
  errorContainer: "#ffdad6",
} as const;

const STORAGE = {
  role: "coachai_settings_role",
  bio: "coachai_settings_bio",
  notifEmail: "coachai_settings_notif_email",
  notifInterview: "coachai_settings_notif_interview",
  notifCandidates: "coachai_settings_notif_candidates",
} as const;

const CARD_RADIUS = 24;
const cardShadow = Platform.select({
  ios: {
    shadowColor: "rgba(70, 72, 212, 0.12)",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  android: { elevation: 4 },
  default: {},
});

type SettingsSection = "profile" | "files" | "notifications" | "security" | "billing";

const NAV: { id: SettingsSection; label: string; icon: string }[] = [
  { id: "profile", label: "Profil Yönetimi", icon: "account" },
  { id: "files", label: "CV ve Dosyalar", icon: "file-document-outline" },
  { id: "notifications", label: "Bildirim Ayarları", icon: "bell-ring-outline" },
  { id: "security", label: "Hesap ve Güvenlik", icon: "shield-lock-outline" },
  { id: "billing", label: "Plan ve Ödeme", icon: "credit-card-outline" },
];

export function SettingsScreen() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const email = user?.email ?? "";

  const [active, setActive] = useState<SettingsSection>("profile");
  const [hydrated, setHydrated] = useState(false);

  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [roleTitle, setRoleTitle] = useState("");
  const [about, setAbout] = useState("");
  const baseline = useRef({ displayName: "", roleTitle: "", about: "" });

  const [notifEmail, setNotifEmail] = useState(true);
  const [notifInterview, setNotifInterview] = useState(true);
  const [notifCandidates, setNotifCandidates] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pwBusy, setPwBusy] = useState(false);

  useEffect(() => {
    setDisplayName(user?.displayName ?? "");
  }, [user?.displayName]);

  const loadStorage = useCallback(async () => {
    try {
      const u = useAuthStore.getState().user;
      const [r, b, ne, ni, nc] = await Promise.all([
        AsyncStorage.getItem(STORAGE.role),
        AsyncStorage.getItem(STORAGE.bio),
        AsyncStorage.getItem(STORAGE.notifEmail),
        AsyncStorage.getItem(STORAGE.notifInterview),
        AsyncStorage.getItem(STORAGE.notifCandidates),
      ]);
      const role = r ?? "";
      const bio = b ?? "";
      setRoleTitle(role);
      setAbout(bio);
      if (ne != null) setNotifEmail(ne === "1");
      if (ni != null) setNotifInterview(ni === "1");
      if (nc != null) setNotifCandidates(nc === "1");
      baseline.current = {
        displayName: (u?.displayName ?? "").trim(),
        roleTitle: role.trim(),
        about: bio.trim(),
      };
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    loadStorage();
  }, [loadStorage]);

  useEffect(() => {
    if (!hydrated) return;
    baseline.current = {
      ...baseline.current,
      displayName: (user?.displayName ?? "").trim(),
    };
  }, [hydrated, user?.displayName]);

  const persistNotif = async (key: string, val: boolean) => {
    await AsyncStorage.setItem(key, val ? "1" : "0");
  };

  const initial = email ? email[0].toUpperCase() : "U";
  const showName = displayName.trim() || email || "Kullanıcı";

  const onCancelProfile = () => {
    setDisplayName(baseline.current.displayName || user?.displayName || "");
    setRoleTitle(baseline.current.roleTitle);
    setAbout(baseline.current.about);
  };

  const onSaveProfile = async () => {
    const n = displayName.trim();
    if (!n) {
      setMsg("Ad soyad boş olamaz.");
      setTimeout(() => setMsg(null), 2500);
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      await updateUserDisplayName(n);
      await AsyncStorage.setItem(STORAGE.role, roleTitle.trim());
      await AsyncStorage.setItem(STORAGE.bio, about.trim());
      baseline.current = { displayName: n, roleTitle: roleTitle.trim(), about: about.trim() };
      setMsg("Değişiklikler kaydedildi.");
      setTimeout(() => setMsg(null), 3000);
    } catch (e) {
      setMsg("Kayıt başarısız: " + (e instanceof Error ? e.message : String(e)));
      setTimeout(() => setMsg(null), 4000);
    }
    setSaving(false);
  };

  return (
    <View style={styles.screen}>
      <CoachHeader />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Ayarlar</Text>
        <Text style={styles.pageSubtitle}>Hesap tercihlerinizi ve platform ayarlarınızı yönetin.</Text>

        {msg ? (
          <View style={styles.banner}>
            <MaterialCommunityIcons name="check-circle-outline" size={22} color={S.primary} />
            <Text style={styles.bannerText}>{msg}</Text>
          </View>
        ) : null}

        {/* Profil özeti */}
        <View style={[styles.card, cardShadow]}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarLetter}>{initial}</Text>
            </View>
          </View>
          <Text style={styles.profileName}>{showName}</Text>
          <Text style={styles.profileRole}>{roleTitle.trim() || "Ünvan ekleyin"}</Text>
        </View>

        {/* Bölüm seçici — referans: ikon + metin, seçili lavanta zemin */}
        <View style={[styles.navCard, cardShadow]}>
          {NAV.map((item) => {
            const selected = active === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setActive(item.id)}
                android_ripple={{ color: "rgba(70, 72, 212, 0.12)" }}
                style={({ pressed }) => [
                  styles.navRow,
                  selected && styles.navRowSelected,
                  !selected && pressed && styles.navRowPressed,
                ]}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={22}
                  color={selected ? S.primary : S.onSurfaceVariant}
                />
                <Text style={[styles.navLabel, selected && styles.navLabelSelected]}>{item.label}</Text>
              </Pressable>
            );
          })}
          <View style={styles.navDivider} />
          <Pressable
            onPress={async () => {
              await emailLogout();
              qc.clear();
            }}
            android_ripple={{ color: "rgba(186,26,26,0.12)" }}
            style={({ pressed }) => [styles.navRow, styles.navRowLogout, pressed && styles.navRowLogoutPressed]}
            accessibilityLabel="Çıkış Yap"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons name="logout" size={22} color={S.error} />
            <Text style={styles.navLabelLogout}>Çıkış Yap</Text>
          </Pressable>
        </View>

        {/* İçerik panelleri */}
        {active === "profile" ? (
          <View style={[styles.panel, cardShadow]}>
            <View style={styles.panelHead}>
              <MaterialCommunityIcons name="account" size={26} color={S.primary} />
              <Text style={styles.panelTitle}>Profil Yönetimi</Text>
            </View>
            <Field label="Ad Soyad" value={displayName} onChangeText={setDisplayName} placeholder="Adınız Soyadınız" />
            <Field label="E-posta Adresi" value={email} editable={false} />
            <Field label="Ünvan / Rol" value={roleTitle} onChangeText={setRoleTitle} placeholder="Örn. Senior Technical Recruiter" />
            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Hakkımda</Text>
              <TextInput
                value={about}
                onChangeText={setAbout}
                placeholder="Kısa bir tanıtım yazın…"
                placeholderTextColor={S.onSurfaceVariant}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={styles.textArea}
              />
            </View>
            <View style={styles.actionsRow}>
              <Pressable onPress={onCancelProfile} style={({ pressed }) => [styles.btnGhost, pressed && { opacity: 0.85 }]}>
                <Text style={styles.btnGhostText}>İptal</Text>
              </Pressable>
              <Pressable
                onPress={onSaveProfile}
                disabled={saving}
                style={({ pressed }) => [styles.btnPrimary, pressed && { opacity: 0.92 }, saving && { opacity: 0.7 }]}
              >
                {saving ? (
                  <ActivityIndicator color={S.onPrimary} />
                ) : (
                  <Text style={styles.btnPrimaryText}>Değişiklikleri Kaydet</Text>
                )}
              </Pressable>
            </View>
          </View>
        ) : null}

        {active === "files" ? (
          <View style={[styles.panel, cardShadow]}>
            <View style={styles.panelHead}>
              <MaterialCommunityIcons name="file-document-outline" size={26} color={S.primary} />
              <Text style={styles.panelTitle}>CV ve Dosyalar</Text>
            </View>
            <Text style={styles.placeholderText}>
              CV ve ek dosyalarınızı buradan yönetebileceksiniz. Bu özellik mobil uygulamada yakında etkinleştirilecek.
            </Text>
          </View>
        ) : null}

        {active === "notifications" ? (
          <View style={[styles.panel, cardShadow]}>
            <View style={styles.panelHead}>
              <MaterialCommunityIcons name="bell-ring-outline" size={26} color={S.primary} />
              <Text style={styles.panelTitle}>Bildirim Tercihleri</Text>
            </View>
            <ToggleRow
              title="E-posta Bildirimleri"
              subtitle="Haftalık raporlar ve sistem güncellemeleri"
              value={notifEmail}
              onValueChange={(v) => {
                setNotifEmail(v);
                void persistNotif(STORAGE.notifEmail, v);
              }}
            />
            <ToggleRow
              title="Mülakat Hatırlatıcıları"
              subtitle="Yaklaşan mülakatlar için 1 saat önceden uyarı"
              value={notifInterview}
              onValueChange={(v) => {
                setNotifInterview(v);
                void persistNotif(STORAGE.notifInterview, v);
              }}
            />
            <ToggleRow
              title="Yeni Aday Önerileri"
              subtitle="Yapay zeka eşleşmesi yüksek adaylar bulunduğunda"
              value={notifCandidates}
              onValueChange={(v) => {
                setNotifCandidates(v);
                void persistNotif(STORAGE.notifCandidates, v);
              }}
              last
            />
          </View>
        ) : null}

        {active === "security" ? (
          <View style={[styles.panel, cardShadow]}>
            <View style={styles.panelHead}>
              <MaterialCommunityIcons name="shield-lock-outline" size={26} color={S.primary} />
              <Text style={styles.panelTitle}>Hesap ve Güvenlik</Text>
            </View>
            <Text style={styles.secHint}>Şifrenizi güncellemek için yeni şifrenizi girin (en az 6 karakter).</Text>
            <Field label="Yeni Şifre" value={newPassword} onChangeText={setNewPassword} placeholder="••••••••" secure />
            {pwError ? (
              <View style={styles.pwErrBox}>
                <Text style={styles.pwErrText}>{pwError}</Text>
              </View>
            ) : null}
            <Pressable
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
              disabled={pwBusy}
              style={({ pressed }) => [styles.btnPrimary, { alignSelf: "flex-start" }, pressed && { opacity: 0.92 }, pwBusy && { opacity: 0.7 }]}
            >
              {pwBusy ? (
                <ActivityIndicator color={S.onPrimary} />
              ) : (
                <Text style={styles.btnPrimaryText}>Şifreyi Güncelle</Text>
              )}
            </Pressable>
          </View>
        ) : null}

        {active === "billing" ? (
          <View style={[styles.panel, cardShadow]}>
            <View style={styles.panelHead}>
              <MaterialCommunityIcons name="credit-card-outline" size={26} color={S.primary} />
              <Text style={styles.panelTitle}>Plan ve Ödeme</Text>
            </View>
            <Text style={styles.placeholderText}>
              Abonelik ve fatura yönetimi web üzerinden veya yakında mobilde sunulacaktır.
            </Text>
          </View>
        ) : null}

      </ScrollView>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  editable = true,
  secure,
}: {
  label: string;
  value: string;
  onChangeText?: (t: string) => void;
  placeholder?: string;
  editable?: boolean;
  secure?: boolean;
}) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={S.onSurfaceVariant}
        editable={editable}
        secureTextEntry={secure}
        style={[styles.input, !editable && styles.inputDisabled]}
      />
    </View>
  );
}

function ToggleRow({
  title,
  subtitle,
  value,
  onValueChange,
  last,
}: {
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <View style={[styles.toggleRow, !last && styles.toggleBorder]}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleSub}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: S.surfaceHighest, true: S.primary }}
        thumbColor={S.surfaceLowest}
        ios_backgroundColor={S.surfaceHighest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: S.background,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: S.onSurface,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: S.onSurfaceVariant,
    marginBottom: 24,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: S.primaryFixed,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: S.outlineVariant,
    marginBottom: 20,
  },
  bannerText: {
    flex: 1,
    fontSize: 14,
    color: S.onSurface,
  },
  card: {
    backgroundColor: S.surfaceLowest,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: S.surfaceHighest,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  avatarWrap: { marginBottom: 16 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: S.primaryFixed,
    borderWidth: 4,
    borderColor: S.surfaceBright,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    fontSize: 36,
    fontWeight: "700",
    color: S.primary,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "600",
    color: S.onSurface,
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    lineHeight: 20,
    color: S.onSurfaceVariant,
    textAlign: "center",
  },
  navCard: {
    backgroundColor: S.surfaceLow,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: S.surfaceHighest,
    padding: 6,
    marginBottom: 20,
    gap: 6,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  navRowSelected: {
    backgroundColor: S.primaryFixed,
  },
  navRowPressed: {
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  navDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: S.outlineVariant,
    marginVertical: 2,
    marginHorizontal: 8,
    opacity: 0.8,
  },
  navRowLogout: {
    marginTop: 0,
  },
  navRowLogoutPressed: {
    backgroundColor: "rgba(255,218,214,0.35)",
  },
  navLabel: {
    fontSize: 15,
    color: S.onSurfaceVariant,
    fontWeight: "500",
    letterSpacing: -0.2,
  },
  navLabelSelected: {
    color: S.primary,
    fontWeight: "600",
  },
  navLabelLogout: {
    fontSize: 15,
    fontWeight: "600",
    color: S.error,
    letterSpacing: -0.2,
  },
  panel: {
    backgroundColor: S.surfaceLowest,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: S.surfaceHighest,
    padding: 24,
    marginBottom: 20,
    gap: 16,
  },
  panelHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingBottom: 16,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: S.surfaceHighest,
  },
  panelTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: S.onSurface,
    letterSpacing: -0.3,
  },
  fieldBlock: { gap: 8 },
  label: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.6,
    color: S.onSurfaceVariant,
    textTransform: "uppercase",
  },
  input: {
    borderWidth: 1,
    borderColor: S.outlineVariant,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: S.onSurface,
    backgroundColor: S.surfaceBright,
  },
  inputDisabled: {
    opacity: 0.75,
    backgroundColor: S.surfaceLow,
  },
  textArea: {
    borderWidth: 1,
    borderColor: S.outlineVariant,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: S.onSurface,
    backgroundColor: S.surfaceBright,
    minHeight: 100,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8,
    flexWrap: "wrap",
  },
  btnGhost: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: S.surfaceHighest,
  },
  btnGhostText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: S.onSurfaceVariant,
  },
  btnPrimary: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: S.primary,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimaryText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: S.onPrimary,
  },
  placeholderText: {
    fontSize: 15,
    lineHeight: 22,
    color: S.onSurfaceVariant,
  },
  secHint: {
    fontSize: 14,
    color: S.onSurfaceVariant,
    marginTop: -8,
    marginBottom: 4,
  },
  pwErrBox: {
    padding: 12,
    backgroundColor: S.errorContainer,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(186,26,26,0.2)",
  },
  pwErrText: {
    fontSize: 14,
    color: S.onErrorContainer,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  toggleBorder: {
    borderBottomWidth: 1,
    borderBottomColor: S.surfaceHighest,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: S.onSurface,
  },
  toggleSub: {
    fontSize: 14,
    lineHeight: 20,
    color: S.onSurfaceVariant,
    marginTop: 4,
  },
});
