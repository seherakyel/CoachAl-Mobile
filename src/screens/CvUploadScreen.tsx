import { useState } from "react";
import { View, ScrollView } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as DocumentPicker from "expo-document-picker";
import { Appbar, Button, Card, Snackbar, Text } from "react-native-paper";
import { uploadCvPdf } from "../services/api";
import { extractDetail } from "../services/apiClient";
import { SkillChip } from "../components/SkillChip";
import { usePipelineStore } from "../store/usePipelineStore";
import type { AnalyzeParamList } from "../app/navigationTypes";

type Nav = NativeStackNavigationProp<AnalyzeParamList>;

export function CvUploadScreen() {
  const navigation = useNavigation<Nav>();
  const qc = useQueryClient();
  const setCv = usePipelineStore((s) => s.setCv);
  const [snack, setSnack] = useState<string | null>(null);
  const [preview, setPreview] = useState<string[] | null>(null);

  const mutation = useMutation({
    mutationFn: uploadCvPdf,
    onSuccess: (res) => {
      setCv(res.cv_id);
      setPreview(res.parsed_data.skills ?? []);
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e) => setSnack(extractDetail(e)),
  });

  const pickAndUpload = async () => {
    const picked = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
    });
    if (picked.canceled) return;
    const asset = picked.assets[0];
    const form = new FormData();
    form.append(
      "file",
      { uri: asset.uri, name: asset.name ?? "cv.pdf", type: "application/pdf" } as unknown as Blob
    );
    mutation.mutate(form);
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="CV yükleme" />
      </Appbar.Header>
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        <Card mode="outlined">
          <Card.Content>
            <Text variant="titleMedium" style={{ fontWeight: "700" }}>
              PDF yükleyin
            </Text>
            <Text variant="bodyMedium" style={{ marginTop: 8, opacity: 0.75 }}>
              Yalnızca dijital PDF dosyaları desteklenir. Taranmış görüntüler çalışmayabilir.
            </Text>
            <Button
              mode="contained"
              icon="file-upload"
              style={{ marginTop: 12 }}
              loading={mutation.isPending}
              onPress={() => {
                void pickAndUpload();
              }}
            >
              PDF seç ve yükle
            </Button>
          </Card.Content>
        </Card>
        {preview && preview.length > 0 ? (
          <Card mode="outlined" style={{ marginTop: 12 }}>
            <Card.Content>
              <Text variant="titleSmall" style={{ fontWeight: "700", marginBottom: 8 }}>
                Önizleme: beceriler
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {preview.map((s) => (
                  <SkillChip key={s} label={s} />
                ))}
              </View>
              <Button
                mode="contained-tonal"
                style={{ marginTop: 12 }}
                onPress={() => navigation.navigate("CompanyTarget")}
              >
                Şirket ve pozisyon
              </Button>
            </Card.Content>
          </Card>
        ) : null}
      </ScrollView>
      <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={5000}>
        {snack ?? ""}
      </Snackbar>
    </View>
  );
}
