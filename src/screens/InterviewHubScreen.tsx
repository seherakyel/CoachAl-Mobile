import { useState } from "react";
import { View, ScrollView } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Appbar, Button, Card, Snackbar, Text } from "react-native-paper";
import { listInterviews } from "../services/api";
import { usePipelineStore } from "../store/usePipelineStore";
import type { InterviewParamList } from "../app/navigationTypes";

type Nav = NativeStackNavigationProp<InterviewParamList>;

export function InterviewHubScreen() {
  const navigation = useNavigation<Nav>();
  const cvId = usePipelineStore((s) => s.cvId);
  const profileId = usePipelineStore((s) => s.profileId);
  const companyName = usePipelineStore((s) => s.companyName);
  const positionTitle = usePipelineStore((s) => s.positionTitle);
  const [snack, setSnack] = useState<string | null>(null);

  const history = useQuery({
    queryKey: ["interview-list"],
    queryFn: () => listInterviews(20),
  });

  const requireContext = () => {
    if (!cvId || !profileId) {
      setSnack("Önce panelden bir başvuru seçin veya analiz akışını tamamlayın.");
      return false;
    }
    return true;
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header elevated>
        <Appbar.Content title="Mülakat merkezi" />
      </Appbar.Header>
      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 96 }}>
        <Card mode="outlined">
          <Card.Content>
            <Text variant="titleSmall" style={{ fontWeight: "700" }}>
              Hedef
            </Text>
            <Text variant="bodyMedium" style={{ marginTop: 6 }}>
              {companyName || "—"} · {positionTitle || "—"}
            </Text>
            <Text variant="bodySmall" style={{ marginTop: 8, opacity: 0.7 }}>
              cv_id: {cvId || "—"}
            </Text>
            <Text variant="bodySmall" style={{ opacity: 0.7 }}>
              profile_id: {profileId || "—"}
            </Text>
          </Card.Content>
        </Card>

        <View style={{ height: 12 }} />

        <Card mode="outlined">
          <Card.Content>
            <Text variant="titleMedium" style={{ fontWeight: "800" }}>
              Klasik mülakat
            </Text>
            <Text variant="bodyMedium" style={{ marginTop: 8, opacity: 0.75 }}>
              Açık uçlu sorular ve yapay zekâ değerlendirmesi.
            </Text>
            <Button
              mode="contained"
              style={{ marginTop: 12 }}
              onPress={() => {
                if (!requireContext()) return;
                navigation.navigate("ClassicInterview");
              }}
            >
              Başlat
            </Button>
          </Card.Content>
        </Card>

        <View style={{ height: 12 }} />

        <Card mode="outlined">
          <Card.Content>
            <Text variant="titleMedium" style={{ fontWeight: "800" }}>
              Quiz mülakat
            </Text>
            <Text variant="bodyMedium" style={{ marginTop: 8, opacity: 0.75 }}>
              Çoktan seçmeli sorular ve süre sınırı.
            </Text>
            <Button
              mode="contained-tonal"
              style={{ marginTop: 12 }}
              onPress={() => {
                if (!requireContext()) return;
                navigation.navigate("QuizInterview");
              }}
            >
              Başlat
            </Button>
          </Card.Content>
        </Card>

        <View style={{ height: 12 }} />

        <Card mode="outlined" style={{ opacity: 0.58 }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ fontWeight: "800" }}>
              Sesli mülakat
            </Text>
            <Text variant="bodyMedium" style={{ marginTop: 8, opacity: 0.75 }}>
              Yakında. Backend şu an 501 döndürür; istemci çağrısı yapılmaz.
            </Text>
            <Button
              mode="outlined"
              disabled
              style={{ marginTop: 12 }}
              onPress={() => {}}
            >
              Yakında
            </Button>
          </Card.Content>
        </Card>

        <View style={{ height: 18 }} />
        <Text variant="titleSmall" style={{ fontWeight: "700", marginBottom: 8 }}>
          Son oturumlar
        </Text>
        {(history.data?.items ?? []).length === 0 ? (
          <Text variant="bodySmall" style={{ opacity: 0.7 }}>
            Kayıt yok
          </Text>
        ) : (
          (history.data?.items ?? []).map((it) => (
            <Card key={it.session_id} mode="outlined" style={{ marginBottom: 8 }}>
              <Card.Content>
                <Text variant="titleSmall" style={{ fontWeight: "700" }}>
                  {it.type}
                </Text>
                <Text variant="bodySmall" style={{ marginTop: 6, opacity: 0.75 }}>
                  Skor: {it.score === null || it.score === undefined ? "—" : String(it.score)}
                </Text>
                <Text variant="bodySmall" style={{ opacity: 0.6 }} numberOfLines={1}>
                  {it.session_id}
                </Text>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
      <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={5000}>
        {snack ?? ""}
      </Snackbar>
    </View>
  );
}
