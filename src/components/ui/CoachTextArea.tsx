import { TextInput, type TextInputProps } from "react-native";
import { CoachColors, CoachRadii } from "../../theme/coachTheme";
import { CoachTypography } from "../../theme/coachTypography";

export function CoachTextArea(props: TextInputProps) {
  return (
    <TextInput
      multiline
      placeholderTextColor={CoachColors.onSurfaceVariant}
      {...props}
      style={[
        {
          minHeight: 120,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: CoachRadii.lg,
          borderWidth: 1,
          borderColor: CoachColors.outlineVariant,
          backgroundColor: CoachColors.surfaceContainerLow,
          color: CoachColors.onSurface,
          fontSize: CoachTypography.bodyMd.fontSize,
          lineHeight: CoachTypography.bodyMd.lineHeight,
          textAlignVertical: "top",
        },
        props.style,
      ]}
    />
  );
}
