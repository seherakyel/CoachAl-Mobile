import { useEffect, useMemo, useState } from "react";
import { Text } from "react-native-paper";

type Props = {
  secondsTotal: number;
  active: boolean;
  onExpire: () => void;
};

export function InterviewTimer({ secondsTotal, active, onExpire }: Props) {
  const [left, setLeft] = useState(secondsTotal);
  useEffect(() => {
    setLeft(secondsTotal);
  }, [secondsTotal]);
  useEffect(() => {
    if (!active) return;
    let remaining = secondsTotal;
    setLeft(remaining);
    const t = setInterval(() => {
      remaining -= 1;
      setLeft(remaining);
      if (remaining <= 0) {
        clearInterval(t);
        onExpire();
      }
    }, 1000);
    return () => clearInterval(t);
  }, [active, secondsTotal, onExpire]);
  const label = useMemo(() => {
    const m = Math.floor(Math.max(left, 0) / 60);
    const r = Math.max(left, 0) % 60;
    return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  }, [left]);
  return (
    <Text variant="titleMedium" style={{ fontVariant: ["tabular-nums"], fontWeight: "700" }}>
      {label}
    </Text>
  );
}
