import { useMemo, useState } from "react";
import { View, Pressable, ActivityIndicator, ScrollView, useWindowDimensions } from "react-native";
import { Text } from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { listAlignments, type AlignmentListItem } from "../../services/api";
import { alignmentIdOf, alignmentOptionLabel, formatSessionDate } from "../../utils/sessionLabels";
import { CoachColors, CoachRadii } from "../../theme/coachTheme";
import { CoachTypography } from "../../theme/coachTypography";

type Props = {
  selectedId: string | null;
  onSelect: (item: AlignmentListItem) => void;
  limit?: number;
  emptyMessage?: string;
  placeholder?: string;
  maxListHeight?: number;
};

function AlignmentListRow({
  item,
  active,
  onPress,
}: {
  item: AlignmentListItem;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderBottomColor: CoachColors.outlineVariant,
        backgroundColor: active ? CoachColors.primaryFixed : CoachColors.surfaceContainerLowest,
      }}
    >
      <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={[CoachTypography.labelSm, { fontWeight: "600", color: CoachColors.onSurface }]}
            numberOfLines={2}
          >
            {alignmentOptionLabel(item)}
          </Text>
          {item.created_at ? (
            <Text style={[CoachTypography.caption, { color: CoachColors.onSurfaceVariant, marginTop: 2 }]}>
              {formatSessionDate(item.created_at)}
            </Text>
          ) : null}
        </View>
        {item.score != null ? (
          <Text style={{ fontSize: 14, fontWeight: "700", color: CoachColors.primary }}>
            %{Math.round(Number(item.score))}
          </Text>
        ) : null}
        {active ? (
          <MaterialCommunityIcons name="check" size={18} color={CoachColors.primary} />
        ) : null}
      </View>
    </Pressable>
  );
}

function SelectedDetailPanel({ selected }: { selected: AlignmentListItem }) {
  return (
    <View
      style={{
        marginTop: 12,
        padding: 16,
        borderRadius: CoachRadii.lg,
        borderWidth: 1,
        borderColor: CoachColors.outlineVariant,
        backgroundColor: CoachColors.surfaceContainerLow,
      }}
    >
      <Text
        style={[CoachTypography.caption, { fontWeight: "600", color: CoachColors.onSurfaceVariant, marginBottom: 8 }]}
      >
        Seçili analiz
      </Text>
      <Text style={[CoachTypography.bodyMd, { color: CoachColors.onSurface }]}>{alignmentOptionLabel(selected)}</Text>
      {selected.risk_level ? (
        <Text style={[CoachTypography.caption, { color: CoachColors.onSurfaceVariant, marginTop: 6 }]}>
          Risk: {selected.risk_level}
        </Text>
      ) : null}
      {selected.score != null ? (
        <Text style={[CoachTypography.labelSm, { color: CoachColors.primary, marginTop: 4, fontWeight: "600" }]}>
          Eşleşme: %{Math.round(Number(selected.score))}
        </Text>
      ) : null}
    </View>
  );
}

export function AlignmentPickerPanel({
  selectedId,
  onSelect,
  limit = 30,
  emptyMessage = "Henüz analiz yok — önce CV analizi yapın.",
  placeholder = "Geçmiş analiz seçin…",
  maxListHeight = 240,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const { height: windowHeight } = useWindowDimensions();
  const listMaxHeight = Math.min(maxListHeight, Math.round(windowHeight * 0.35));

  const q = useQuery({
    queryKey: ["alignment-list", limit],
    queryFn: () => listAlignments(limit),
  });

  const items = q.data?.items ?? [];
  const selected = useMemo(
    () => items.find((x) => alignmentIdOf(x) === selectedId) ?? null,
    [items, selectedId],
  );

  const triggerLabel = selected ? alignmentOptionLabel(selected) : placeholder;

  const handleSelect = (item: AlignmentListItem) => {
    onSelect(item);
    setExpanded(false);
  };

  if (q.isLoading) {
    return (
      <View style={{ paddingVertical: 24, alignItems: "center" }}>
        <ActivityIndicator color={CoachColors.primary} />
        <Text style={[CoachTypography.bodyMd, { marginTop: 12, color: CoachColors.onSurfaceVariant }]}>
          Analizler yükleniyor…
        </Text>
      </View>
    );
  }

  if (q.isError) {
    return (
      <Text style={{ color: CoachColors.error, fontSize: 14 }}>Liste yüklenemedi. Lütfen tekrar deneyin.</Text>
    );
  }

  if (!items.length) {
    return <Text style={[CoachTypography.bodyMd, { color: CoachColors.onSurfaceVariant }]}>{emptyMessage}</Text>;
  }

  return (
    <View>
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={selected ? `Seçili analiz: ${triggerLabel}` : placeholder}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderWidth: 1,
          borderColor: expanded ? CoachColors.primary : CoachColors.outlineVariant,
          borderRadius: CoachRadii.lg,
          backgroundColor: CoachColors.surfaceContainerLow,
        }}
      >
        <MaterialCommunityIcons name="chart-timeline-variant" size={20} color={CoachColors.primary} />
        <Text
          style={[
            CoachTypography.labelSm,
            {
              flex: 1,
              color: selected ? CoachColors.onSurface : CoachColors.onSurfaceVariant,
              fontWeight: selected ? "600" : "400",
            },
          ]}
          numberOfLines={2}
        >
          {triggerLabel}
        </Text>
        {selected?.score != null ? (
          <Text style={{ fontSize: 14, fontWeight: "700", color: CoachColors.primary }}>
            %{Math.round(Number(selected.score))}
          </Text>
        ) : null}
        <MaterialCommunityIcons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={22}
          color={CoachColors.onSurfaceVariant}
        />
      </Pressable>

      {expanded ? (
        <View
          style={{
            marginTop: 4,
            borderWidth: 1,
            borderColor: CoachColors.outlineVariant,
            borderRadius: CoachRadii.lg,
            overflow: "hidden",
            backgroundColor: CoachColors.surfaceContainerLowest,
          }}
        >
          <ScrollView
            style={{ maxHeight: listMaxHeight }}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
          >
            {items.map((it) => {
              const id = alignmentIdOf(it);
              return (
                <AlignmentListRow
                  key={id}
                  item={it}
                  active={selectedId === id}
                  onPress={() => handleSelect(it)}
                />
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      {selected ? <SelectedDetailPanel selected={selected} /> : null}
    </View>
  );
}
