import { Chip } from "react-native-paper";
import { mapRiskLevel } from "../utils/riskColors";

type Props = {
  level: string | null | undefined;
};

export function RiskBadge({ level }: Props) {
  const m = mapRiskLevel(level);
  return (
    <Chip
      compact
      style={{ backgroundColor: m.background, alignSelf: "flex-start" }}
      textStyle={{ color: m.text, fontWeight: "600" }}
    >
      {m.label}
    </Chip>
  );
}
