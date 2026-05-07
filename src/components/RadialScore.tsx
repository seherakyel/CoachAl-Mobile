import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Text } from "react-native-paper";

type Props = {
  percent: number;
  size?: number;
  stroke?: number;
  color?: string;
};

export function RadialScore({ percent, size = 132, stroke = 10, color = "#6366f1" }: Props) {
  const p = Math.max(0, Math.min(100, Number.isFinite(percent) ? percent : 0));
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - p / 100);
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke="#e2e8f0"
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={offset}
          fill="none"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </Svg>
      <View style={{ position: "absolute" }}>
        <Text variant="headlineLarge" style={{ fontWeight: "700" }}>
          {Math.round(p)}%
        </Text>
      </View>
    </View>
  );
}
