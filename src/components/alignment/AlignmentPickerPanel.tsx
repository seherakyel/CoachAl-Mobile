import { useMemo } from "react";
import { View, Pressable, ActivityIndicator } from "react-native";
import { Text } from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { listAlignments, type AlignmentListItem } from "../../services/api";
import { alignmentIdOf, alignmentOptionLabel, formatSessionDate } from "../../utils/sessionLabels";
import { CoachColors, CoachRadii } from "../../theme/coachTheme";

type Props = {
  selectedId: string | null;
  onSelect: (item: AlignmentListItem) => void;
  limit?: number;
  emptyMessage?: string;
};

export function AlignmentPickerPanel({
  selectedId,
  onSelect,
  limit = 30,
  emptyMessage = "Henüz analiz yok — önce CV analizi yapın.",
}: Props) {
  const q = useQuery({
    queryKey: ["alignment-list", limit],
    queryFn: () => listAlignments(limit),
  });

  const items = q.data?.items ?? [];
  const selected = useMemo(
    () => items.find((x) => alignmentIdOf(x) === selectedId) ?? null,
    [items, selectedId],
  );

  if (q.isLoading) {
    return (
      <View style={{ paddingVertical: 24, alignItems: "center" }}>
        <ActivityIndicator color={CoachColors.primary} />
        <Text style={{ marginTop: 12, color: CoachColors.onSurfaceVariant }}>Analizler yükleniyor…</Text>
      </View>
    );
  }

  if (q.isError) {
    return (
      <Text style={{ color: CoachColors.error, fontSize: 14 }}>
        Liste yüklenemedi. Lütfen tekrar deneyin.
      </Text>
    );
  }

  if (!items.length) {
    return <Text style={{ fontSize: 14, color: CoachColors.onSurfaceVariant }}>{emptyMessage}</Text>;
  }

  return (
    <View style={{ gap: 10 }}>
      {items.map((it) => {
        const id = alignmentIdOf(it);
        const active = selectedId === id;
        return (
          <Pressable
            key={id}
            onPress={() => onSelect(it)}
            style={{
              borderWidth: 1,
              borderColor: active ? CoachColors.primary : CoachColors.outlineVariant,
              borderRadius: CoachRadii.lg,
              padding: 14,
              backgroundColor: active ? CoachColors.primaryFixed : CoachColors.surfaceContainerLowest,
            }}
          >
            <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: CoachRadii.md,
                  backgroundColor: CoachColors.primaryFixed,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialCommunityIcons name="chart-timeline-variant" size={22} color={CoachColors.primary} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: CoachColors.onSurface }} numberOfLines={2}>
                  {alignmentOptionLabel(it)}
                </Text>
                {it.created_at ? (
                  <Text style={{ fontSize: 11, color: CoachColors.onSurfaceVariant, marginTop: 4 }}>
                    {formatSessionDate(it.created_at)}
                  </Text>
                ) : null}
              </View>
              {it.score != null ? (
                <Text style={{ fontSize: 15, fontWeight: "700", color: CoachColors.primary }}>
                  %{Math.round(Number(it.score))}
                </Text>
              ) : null}
            </View>
          </Pressable>
        );
      })}

      {selected ? (
        <View
          style={{
            marginTop: 8,
            padding: 16,
            borderRadius: CoachRadii.lg,
            borderWidth: 1,
            borderColor: CoachColors.outlineVariant,
            backgroundColor: CoachColors.surfaceContainerLow,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: "600", color: CoachColors.onSurfaceVariant, marginBottom: 8 }}>
            Seçili analiz
          </Text>
          <Text style={{ fontSize: 14, color: CoachColors.onSurface }}>{alignmentOptionLabel(selected)}</Text>
          {selected.risk_level ? (
            <Text style={{ fontSize: 12, color: CoachColors.onSurfaceVariant, marginTop: 6 }}>
              Risk: {selected.risk_level}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
