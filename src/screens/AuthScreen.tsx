import { useState } from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Button, Dialog, Portal, Snackbar, Text, TextInput } from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { emailLogin, emailRegister, sendReset } from "../services/firebaseAuth";
import { extractDetail } from "../services/apiClient";
import { SocialLoginButton } from "../components/SocialLoginButton";

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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 48 }}>
        <Text variant="headlineMedium" style={{ fontWeight: "800", marginBottom: 8 }}>
          CoachAI
        </Text>
        <Text variant="bodyMedium" style={{ opacity: 0.75, marginBottom: 16 }}>
          Hesabınızla devam edin
        </Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              label="E-posta"
              autoCapitalize="none"
              keyboardType="email-address"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={!!formState.errors.email}
              style={{ marginBottom: 10 }}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              label="Şifre"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={!!formState.errors.password}
              style={{ marginBottom: 10 }}
            />
          )}
        />
        <Button mode="contained" loading={busy} onPress={onSubmit} style={{ marginTop: 6 }}>
          {mode === "login" ? "Giriş yap" : "Kayıt ol"}
        </Button>
        <Button mode="text" onPress={() => setMode(mode === "login" ? "register" : "login")} style={{ marginTop: 4 }}>
          {mode === "login" ? "Hesabın yok mu? Kayıt ol" : "Zaten hesabın var mı? Giriş yap"}
        </Button>
        <Button
          mode="text"
          onPress={() => {
            setResetEmail(getValues("email"));
            setResetOpen(true);
          }}
          style={{ marginTop: 2 }}
        >
          Şifremi unuttum
        </Button>
        <View style={{ height: 14 }} />
        <SocialLoginButton
          onUnavailable={() =>
            setSnack("Google girişi yakında. Firebase Console yapılandırması gerekir.")
          }
        />
        <Text variant="bodySmall" style={{ marginTop: 18, opacity: 0.6 }}>
          Devam ederek kullanım koşullarını ve gizlilik bildirimini kabul etmiş olursunuz.
        </Text>
      </ScrollView>
      <Portal>
        <Dialog visible={resetOpen} onDismiss={() => setResetOpen(false)}>
          <Dialog.Title>Şifre sıfırlama</Dialog.Title>
          <Dialog.Content>
            <TextInput label="E-posta" value={resetEmail} onChangeText={setResetEmail} autoCapitalize="none" />
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
