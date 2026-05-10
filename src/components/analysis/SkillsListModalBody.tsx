import type { SkillUiItem } from "../../services/api";
import { SkillCardList } from "./SkillCardList";

type Variant = "matched" | "missing";

type Props = {
  variant: Variant;
  items: SkillUiItem[];
};

export function SkillsListModalBody({ variant, items }: Props) {
  const rows = (items ?? []).map((it) => ({
    label: (it.label as string) ?? (it.skill as string) ?? "Öğe",
    detail: String(it.detail ?? "").trim(),
  }));

  return <SkillCardList variant={variant} rows={rows} />;
}
