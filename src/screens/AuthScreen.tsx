import { useState } from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { Button, Dialog, Portal, Snackbar, Text, TextInput } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { emailLogin, emailRegister, sendReset } from "../services/firebaseAuth";
import { extractDetail } from "../services/apiClient";
import { SocialLoginRow } from "../components/SocialLoginButton";
import { CoachColors, CoachRadii, CoachShadow } from "../theme/coachTheme";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

export function AuthScreen() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [busy, setBusy] = useState(false);
  const [snack, setSnack] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { control, handleSubmit, getValues, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setBusy(true);
    try {
      if (mode === "login") {
        await emailLogin(values.email, values.password);
      } else {
        await emailRegister(values.email, values.password);
      }
    } catch (e) {
      setSnack(extractDetail(e));
    } finally {
      setBusy(false);
    }
  });

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: CoachColors.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 24,
          paddingVertical: 40,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            maxWidth: 440,
            width: "100%",
            alignSelf: "center",
            backgroundColor: CoachColors.surfaceCard,
            borderRadius: 24,
            padding: 28,
            borderWidth: 1,
            borderColor: CoachColors.outlineVariant,
            ...CoachShadow.card,
          }}
        >
          <View style={{ alignItems: "center", marginBottom: 28 }}>
            <Text style={{ fontSize: 30, fontWeight: "700", letterSpacing: -0.6, color: CoachColors.primary }}>
              CoachAI
            </Text>
            <Text style={{ fontSize: 16, lineHeight: 24, color: CoachColors.onSurfaceVariant, marginTop: 8, textAlign: "center" }}>
              {mode === "login" ? "Tekrar hoş geldiniz. Kaldığınız yerden devam edin." : "Executive precision ile kariyer yolculuğuna başlayın."}
            </Text>
          </View>

          <View style={{ flexDirection: "row", marginBottom: 20, backgroundColor: CoachColors.background, borderRadius: CoachRadii.lg, padding: 4, borderWidth: 1, borderColor: CoachColors.outlineVariant }}>
            <Pressable
              onPress={() => setMode("login")}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: CoachRadii.md,
                backgroundColor: mode === "login" ? CoachColors.surfaceCard : "transparent",
                alignItems: "center",
                ...CoachShadow.card,
                shadowOpacity: mode === "login" ? 0.06 : 0,
                elevation: mode === "login" ? 2 : 0,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: CoachColors.primary }}>Giriş</Text>
            </Pressable>
            <Pressable
              onPress={() => setMode("register")}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: CoachRadii.md,
                backgroundColor: mode === "register" ? CoachColors.surfaceCard : "transparent",
                alignItems: "center",
                ...CoachShadow.card,
                shadowOpacity: mode === "register" ? 0.06 : 0,
                elevation: mode === "register" ? 2 : 0,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: CoachColors.primary }}>Kayıt</Text>
            </Pressable>
          </View>

          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                mode="outlined"
                label="E-posta"
                autoCapitalize="none"
                keyboardType="email-address"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!formState.errors.email}
                left={<TextInput.Icon icon="email-outline" />}
                outlineColor={CoachColors.outlineVariant}
                activeOutlineColor={CoachColors.secondary}
                style={{ marginBottom: 14, backgroundColor: CoachColors.surfaceCard }}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                mode="outlined"
                label="Şifre"
                secureTextEntry={!showPassword}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!formState.errors.password}
                left={<TextInput.Icon icon="lock-outline" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off-outline" : "eye-outline"}
                    onPress={() => setShowPassword((v) => !v)}
                    forceTextInputFocus={false}
                  />
                }
                outlineColor={CoachColors.outlineVariant}
                activeOutlineColor={CoachColors.secondary}
                style={{ marginBottom: 8, backgroundColor: CoachColors.surfaceCard }}
              />
            )}
          />

          {mode === "login" ? (
            <View style={{ alignItems: "flex-end", marginBottom: 8 }}>
              <Button mode="text" compact onPress={() => { setResetEmail(getValues("email")); setResetOpen(true); }} textColor={CoachColors.ghostText}>
                Şifremi unuttum
              </Button>
            </View>
          ) : null}

          <Pressable
            onPress={onSubmit}
            disabled={busy}
            style={({ pressed }) => ({
              marginTop: 12,
              backgroundColor: pressed && !busy ? CoachColors.primaryPressed : CoachColors.primary,
              borderRadius: CoachRadii.xl,
              paddingVertical: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity: busy ? 0.7 : 1,
              ...CoachShadow.elevated,
            })}
          >
            <Text style={{ fontSize: 16, fontWeight: "600", color: CoachColors.onPrimary }}>
              {busy ? "Bekleyin…" : mode === "login" ? "Giriş yap" : "Hesap oluştur"}
            </Text>
            {!busy ? <MaterialCommunityIcons name="arrow-right" size={20} color={CoachColors.onPrimary} /> : null}
          </Pressable>

          <View style={{ marginTop: 28, paddingTop: 20, borderTopWidth: 1, borderTopColor: CoachColors.outlineVariant }}>
            <SocialLoginRow
              onGoogle={() => setSnack("Google girişi yakında. Firebase Console yapılandırması gerekir.")}
              onLinkedIn={() => setSnack("LinkedIn girişi yakında.")}
            />
          </View>

          <Text style={{ fontSize: 12, lineHeight: 18, color: CoachColors.secondaryText, marginTop: 22, textAlign: "center" }}>
            Devam ederek kullanım koşullarını ve gizlilik bildirimini kabul etmiş olursunuz.
          </Text>
        </View>
      </ScrollView>
      <Portal>
        <Dialog visible={resetOpen} onDismiss={() => setResetOpen(false)}>
          <Dialog.Title>Şifre sıfırlama</Dialog.Title>
          <Dialog.Content>
            <TextInput label="E-posta" value={resetEmail} onChangeText={setResetEmail} autoCapitalize="none" mode="outlined" />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setResetOpen(false)}>Vazgeç</Button>
            <Button
              onPress={async () => {
                try {
                  await sendReset(resetEmail);
                  setSnack("Sıfırlama bağlantısı e-posta adresinize gönderildi");
                } catch (e) {
                  setSnack(extractDetail(e));
                } finally {
                  setResetOpen(false);
                }
              }}
            >
              Gönder
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={4000}>
        {snack ?? ""}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}
