import { useState } from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Appbar, Button, Card, Snackbar, Text, TextInput } from "react-native-paper";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { analyzeCompany } from "../services/api";
import { extractDetail } from "../services/apiClient";
import { usePipelineStore } from "../store/usePipelineStore";
import type { AnalyzeParamList } from "../app/navigationTypes";

const schema = z.object({
  company_name: z.string().min(1).max(200),
  position: z.string().min(1).max(200),
});

type FormValues = z.infer<typeof schema>;

type Nav = NativeStackNavigationProp<AnalyzeParamList>;

export function CompanyTargetScreen() {
  const navigation = useNavigation<Nav>();
  const qc = useQueryClient();
  const cvId = usePipelineStore((s) => s.cvId);
  const setCompany = usePipelineStore((s) => s.setCompany);
  const [snack, setSnack] = useState<string | null>(null);
  const { control, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { company_name: "", position: "" },
  });

  const mutation = useMutation({
    mutationFn: analyzeCompany,
    onSuccess: (res) => {
      setCompany(res.profile_id, res.company_name, res.position);
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      navigation.navigate("AlignmentResult", {});
    },
    onError: (e) => setSnack(extractDetail(e)),
  });

  const onSubmit = handleSubmit((values) => {
    if (!cvId) {
      setSnack("Önce geçerli bir CV yükleyin");
      return;
    }
    mutation.mutate({ company_name: values.company_name.trim(), position: values.position.trim() });
  });

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={{ flex: 1 }}>
        <Appbar.Header elevated>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Hedef şirket" />
        </Appbar.Header>
        <ScrollView contentContainerStyle={{ padding: 12 }}>
          <Card mode="outlined">
            <Card.Content>
              <Text variant="bodyMedium" style={{ opacity: 0.75, marginBottom: 10 }}>
                Şirket adı ve hedef pozisyonu girin. Model kapalıysa 503 görebilirsiniz.
              </Text>
              <Controller
                control={control}
                name="company_name"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    label="Şirket adı"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={!!formState.errors.company_name}
                    style={{ marginBottom: 10 }}
                  />
                )}
              />
              <Controller
                control={control}
                name="position"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    label="Pozisyon"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={!!formState.errors.position}
                    style={{ marginBottom: 10 }}
                  />
                )}
              />
              <Button mode="contained" loading={mutation.isPending} onPress={onSubmit}>
                Analizi başlat
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
        <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={6000}>
          {snack ?? ""}
        </Snackbar>
      </View>
    </KeyboardAvoidingView>
  );
}
