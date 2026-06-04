import { useState } from "react";
import { View, ScrollView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { Appbar, Button, Snackbar, Text } from "react-native-paper";
import { AlignmentPickerPanel } from "../components/alignment/AlignmentPickerPanel";
import type { AlignmentListItem } from "../services/api";
import { alignmentIdOf } from "../utils/sessionLabels";
import { usePipelineStore } from "../store/usePipelineStore";
import type { InterviewParamList } from "../app/navigationTypes";
import { CoachAppBarTheme, CoachColors, CoachRadii } from "../theme/coachTheme";

type Nav = NativeStackNavigationProp<InterviewParamList>;
type R = RouteProp<InterviewParamList, "InterviewAlignmentSetup">;

export function InterviewAlignmentSetupScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const mode = route.params.mode;
  const [selected, setSelected] = useState<AlignmentListItem | null>(null);
  const [snack, setSnack] = useState<string | null>(null);

  const title = mode === "quiz" ? "Teknik quiz kurulumu" : "Klasik sınav kurulumu";
  const subtitle =
    mode === "quiz"
      ? "Geçmiş bir hizalama analizi seçin; quiz bu CV ve şirket profiline göre üretilir."
      : "Geçmiş bir hizalama analizi seçin; sorular bu eşleşmeye göre üretilir.";

  const start = () => {
    if (!selected) {
      setSnack("Lütfen listeden bir analiz seçin.");
      return;
    }
    const alignmentId = alignmentIdOf(selected);
    usePipelineStore.getState().hydrateFromApplication({
      cvId: selected.cv_id,
      profileId: selected.profile_id,
      alignmentId,
      companyName: selected.company_name,
      positionTitle: selected.position || selected.target_position,
    });
    if (selected.cv_name) {
      usePipelineStore.getState().setCv(selected.cv_id, selected.cv_name);
    }

    if (mode === "quiz") {
      navigation.navigate("QuizInterview", { alignmentId });
    } else {
      navigation.navigate("ClassicInterview", { alignmentId });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: CoachColors.background }}>
      <Appbar.Header elevated style={{ backgroundColor: CoachColors.componentSurface }} theme={CoachAppBarTheme}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={title} titleStyle={{ color: CoachColors.onComponentSurface }} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
        <Text style={{ fontSize: 15, lineHeight: 22, color: CoachColors.onSurfaceVariant, marginBottom: 20 }}>
          {subtitle}
        </Text>
        <AlignmentPickerPanel
          selectedId={selected ? alignmentIdOf(selected) : null}
          onSelect={setSelected}
          limit={30}
        />
        <Button
          mode="contained"
          onPress={start}
          disabled={!selected}
          style={{ marginTop: 24, borderRadius: CoachRadii.md }}
          buttonColor={CoachColors.primary}
          textColor={CoachColors.onPrimary}
        >
          {mode === "quiz" ? "Quiz'e başla" : "Sınava başla"}
        </Button>
      </ScrollView>
      <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={4000}>
        {snack ?? ""}
      </Snackbar>
    </View>
  );
}
