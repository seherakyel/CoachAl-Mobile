import { Card, Text } from "react-native-paper";
import { View } from "react-native";
import { formatScore, formatDash } from "../utils/format";
import { RiskBadge } from "./RiskBadge";

type Props = {
  companyName: string;
  position: string;
  alignmentScore: number | null;
  riskLevel: string | null;
  classicBest: number | null;
  quizBest: number | null;
  onOpenInterviews: () => void;
};

export function ApplicationCard({
  companyName,
  position,
  alignmentScore,
  riskLevel,
  classicBest,
  quizBest,
  onOpenInterviews,
}: Props) {
  return (
    <Card mode="outlined" style={{ marginBottom: 10 }} onPress={onOpenInterviews}>
      <Card.Content>
        <Text variant="titleMedium" style={{ fontWeight: "700" }}>
          {formatDash(companyName)}
        </Text>
        <Text variant="bodyMedium" style={{ marginTop: 4, opacity: 0.8 }}>
          {formatDash(position)}
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10, alignItems: "center" }}>
          <Text variant="labelLarge">Skor: {formatScore(alignmentScore)}</Text>
          <RiskBadge level={riskLevel} />
        </View>
        <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
          <Text variant="bodySmall" style={{ opacity: 0.8 }}>
            Klasik en iyi: {classicBest === null || classicBest === undefined ? "—" : `${classicBest}`}
          </Text>
          <Text variant="bodySmall" style={{ opacity: 0.8 }}>
            Quiz en iyi: {quizBest === null || quizBest === undefined ? "—" : `${quizBest}`}
          </Text>
        </View>
        <Text variant="labelSmall" style={{ marginTop: 8, opacity: 0.6 }}>
          Mülakat sekmesine gitmek için dokunun
        </Text>
      </Card.Content>
    </Card>
  );
}
