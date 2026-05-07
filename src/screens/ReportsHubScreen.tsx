import { useMemo, useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Appbar, Button, Menu, Snackbar, Text } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { listAlignments, listInterviews } from "../services/api";
import type { ReportsParamList } from "../app/navigationTypes";
import { CoachAppBarTheme, CoachColors, CoachRadii, CoachShadow } from "../theme/coachTheme";

type Nav = NativeStackNavigationProp<ReportsParamList>;

export function ReportsHubScreen() {
  const navigation = useNavigation<Nav>();
  const alignQ = useQuery({ queryKey: ["alignment-list-reports"], queryFn: () => listAlignments(80) });
  const intQ = useQuery({ queryKey: ["interview-list-reports"], queryFn: () => listInterviews(80) });

  const [alignmentId, setAlignmentId] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [alignMenu, setAlignMenu] = useState(false);
  const [sessMenu, setSessMenu] = useState(false);
  const [snack, setSnack] = useState<string | null>(null);

  const alignLabel = useMemo(() => {
    const it = alignQ.data?.items.find((x) => x.id === alignmentId);
    return it ? `${it.company_name} · ${it.target_position}` : alignmentId ? alignmentId.slice(0, 8) + "…" : "Eşleşme seçin";
  }, [alignQ.data, alignmentId]);

  const sessLabel = useMemo(() => {
    if (!sessionId) return "Seçiniz… (isteğe bağlı)";
    const it = intQ.data?.items.find((x) => x.session_id === sessionId);
    return it ? `${it.type} · ${it.session_id.slice(0, 8)}…` : sessionId.slice(0, 12) + "…";
  }, [intQ.data, sessionId]);

  return (
    <View style={{ flex: 1, backgroundColor: CoachColors.background }}>
      <Appbar.Header elevated style={{ backgroundColor: CoachColors.componentSurface }} theme={CoachAppBarTheme}>
        <Appbar.Content title="Raporlar" titleStyle={{ fontWeight: "700", color: CoachColors.onComponentSurface }} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120, maxWidth: 1024, width: "100%", alignSelf: "center" }}>
        <Text style={{ fontSize: 36, fontWeight: "700", color: CoachColors.onSurface, marginBottom: 8 }}>Sonuç Raporu</Text>
        <Text style={{ fontSize: 18, lineHeight: 28, color: CoachColors.onSurfaceVariant, marginBottom: 32 }}>
          CV ve mülakat geri bildirim analizi.
        </Text>

        <View
          style={{
            backgroundColor: CoachColors.surfaceContainerLowest,
            borderWidth: 1,
            borderColor: CoachColors.outlineVariant,
            borderRadius: CoachRadii.xl,
            padding: 24,
            marginBottom: 24,
            ...CoachShadow.card,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: "600", color: CoachColors.onSurface, marginBottom: 20 }}>Rapor Seçimi</Text>
          <Text style={{ fontSize: 14, fontWeight: "500", color: CoachColors.onSurface, marginBottom: 8 }}>Eşleşme Analizi</Text>
          <Menu visible={alignMenu} onDismiss={() => setAlignMenu(false)} anchor={
            <Pressable
              onPress={() => setAlignMenu(true)}
              style={{
                borderWidth: 1,
                borderColor: CoachColors.outlineVariant,
                borderRadius: CoachRadii.md,
                padding: 14,
                backgroundColor: CoachColors.surfaceContainerLow,
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 14, color: CoachColors.onSurface }} numberOfLines={1}>
                {alignQ.isLoading ? "Yükleniyor…" : alignLabel}
              </Text>
            </Pressable>
          }>
            {(alignQ.data?.items ?? []).map((it) => (
              <Menu.Item
                key={it.id}
                onPress={() => {
                  setAlignmentId(it.id);
                  setAlignMenu(false);
                }}
                title={`${it.company_name} · ${it.target_position}`}
              />
            ))}
          </Menu>

          <Text style={{ fontSize: 14, fontWeight: "500", color: CoachColors.onSurface, marginBottom: 8 }}>
            Mülakat Seansı (İsteğe bağlı)
          </Text>
          <Menu visible={sessMenu} onDismiss={() => setSessMenu(false)} anchor={
            <Pressable
              onPress={() => setSessMenu(true)}
              style={{
                borderWidth: 1,
                borderColor: CoachColors.outlineVariant,
                borderRadius: CoachRadii.md,
                padding: 14,
                backgroundColor: CoachColors.surfaceContainerLow,
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 14, color: CoachColors.onSurface }} numberOfLines={1}>
                {intQ.isLoading ? "Yükleniyor…" : sessLabel}
              </Text>
            </Pressable>
          }>
            <Menu.Item
              onPress={() => {
                setSessionId("");
                setSessMenu(false);
              }}
              title="Seans yok"
            />
            {(intQ.data?.items ?? []).map((it) => (
              <Menu.Item
                key={it.session_id}
                onPress={() => {
                  setSessionId(it.session_id);
                  setSessMenu(false);
                }}
                title={`${it.type} · ${it.session_id.slice(0, 10)}…`}
              />
            ))}
          </Menu>

          <Button
            mode="contained"
            icon="auto-fix"
            disabled={!alignmentId}
            onPress={() => {
              if (!alignmentId) {
                setSnack("Önce eşleşme seçin.");
                return;
              }
              navigation.navigate("FeedbackReport", {
                alignmentId,
                sessionId: sessionId || null,
              });
            }}
            buttonColor={CoachColors.primaryContainer}
            textColor={CoachColors.onPrimary}
            style={{ alignSelf: "flex-start", borderRadius: CoachRadii.md }}
          >
            Raporu Oluştur
          </Button>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            padding: 16,
            backgroundColor: CoachColors.surfaceContainer,
            borderRadius: CoachRadii.xl,
            borderWidth: 1,
            borderColor: CoachColors.outlineVariant,
          }}
        >
          <MaterialCommunityIcons name="information-outline" size={22} color={CoachColors.primary} />
          <Text style={{ flex: 1, fontSize: 14, color: CoachColors.onSurfaceVariant }}>
            Rapor oluşturmak için önce bir eşleşme analizi seçin. İsterseniz belirli bir mülakat oturumunu da ekleyebilirsiniz.
          </Text>
        </View>
      </ScrollView>
      <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={4000}>
        {snack ?? ""}
      </Snackbar>
    </View>
  );
}
