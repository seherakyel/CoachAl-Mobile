import { Chip } from "react-native-paper";

type Props = {
  label: string;
};

export function SkillChip({ label }: Props) {
  return <Chip compact style={{ marginRight: 6, marginBottom: 6 }}>{label}</Chip>;
}
