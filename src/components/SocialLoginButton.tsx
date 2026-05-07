import { Button } from "react-native-paper";

type Props = {
  onUnavailable: () => void;
};

export function SocialLoginButton({ onUnavailable }: Props) {
  return (
    <Button mode="outlined" icon="google" onPress={onUnavailable}>
      Google ile devam et
    </Button>
  );
}
