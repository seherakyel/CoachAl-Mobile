import { useState } from "react";
import { View, ScrollView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { Snackbar, Text } from "react-native-paper";
import { AlignmentPickerPanel } from "../components/alignment/AlignmentPickerPanel";
import type { AlignmentListItem } from "../services/api";
import { alignmentIdOf } from "../utils/sessionLabels";
import { usePipelineStore } from "../store/usePipelineStore";
import type { InterviewParamList } from "../app/navigationTypes";
import { CoachScreenBar } from "../components/chrome/CoachScreenBar";
import { CoachPageTitle } from "../components/ui/CoachPageTitle";
import { CoachCard } from "../components/ui/CoachCard";
import { CoachPrimaryButton } from "../components/ui/CoachPrimaryButton";
import { CoachColors } from "../theme/coachTheme";
import { CoachTypography } from "../theme/coachTypography";

type Nav = NativeStackNavigationProp<InterviewParamList>;
type R = RouteProp<InterviewParamList, "InterviewAlignmentSetup">;

export function InterviewAlignmentSetupScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const mode = route.params.mode;
  const [selected, setSelected] = useState<AlignmentListItem | null>(null);
  const [snack, setSnack] = useState<string | null>(null);

  const title = mode === "quiz" ? "Teknik Quiz" : "Klasik Sınav";
  const subtitle =
    mode === "quiz"
      ? "Hızlı çoktan seçmeli test — her soru için 60 saniye."
      : "Daha önce yaptığınız bir eşleşme analizini seçerek klasik mülakat sınavını başlatın.";

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
      <CoachScreenBar title={title} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
        <CoachPageTitle title={title} subtitle={subtitle} />
        <CoachCard>
          <Text style={[CoachTypography.labelSm, { color: CoachColors.onSurface, marginBottom: 8 }]}>
            Geçmiş analiz
          </Text>
          <AlignmentPickerPanel
            selectedId={selected ? alignmentIdOf(selected) : null}
            onSelect={setSelected}
            limit={30}
          />
          <CoachPrimaryButton
            label={mode === "quiz" ? "Quizi Başlat" : "Sınavı Başlat"}
            icon={mode === "quiz" ? "timer" : "play"}
            onPress={start}
            disabled={!selected}
            style={{ marginTop: 20 }}
          />
        </CoachCard>
      </ScrollView>
      <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={4000}>
        {snack ?? ""}
      </Snackbar>
    </View>
  );
}
