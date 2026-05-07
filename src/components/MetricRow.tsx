import { View } from "react-native";
import { Card, Text } from "react-native-paper";

type Props = {
  cvCount: number;
  companyCount: number;
  interviewCount: number;
  loading?: boolean;
};

export function MetricRow({ cvCount, companyCount, interviewCount, loading }: Props) {
  const items = [
    { title: "CV", value: String(cvCount) },
    { title: "Şirket", value: String(companyCount) },
    { title: "Mülakat", value: String(interviewCount) },
  ];
  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      {items.map((it) => (
        <View key={it.title} style={{ flex: 1 }}>
          <Card mode="outlined">
            <Card.Content style={{ paddingVertical: 10 }}>
              <Text variant="labelSmall" style={{ opacity: 0.7 }}>
                {it.title}
              </Text>
              <Text variant="titleLarge" style={{ fontWeight: "700", marginTop: 4 }}>
                {loading ? "—" : it.value}
              </Text>
            </Card.Content>
          </Card>
        </View>
      ))}
    </View>
  );
}
