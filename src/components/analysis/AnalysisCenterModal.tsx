import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Platform,
  Animated,
  Easing,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { AR, fontTight } from "./analysisResultTokens";

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  onDismiss?: () => void;
  children: ReactNode;
};

export function AnalysisCenterModal({ visible, title, onClose, onDismiss, children }: Props) {
  const insets = useSafeAreaInsets();
  const { width: winW, height: winH } = useWindowDimensions();
  const [present, setPresent] = useState(false);
  const backdropOp = useRef(new Animated.Value(0)).current;
  const panelOp = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.94)).current;
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  const cardMaxW = Math.min(420, winW - 40);
  const cardMaxH = Math.min(winH * 0.82, winH - insets.top - insets.bottom - 20);
  const headerBlock = 56;
  const scrollMaxH = Math.max(180, cardMaxH - headerBlock);

  useLayoutEffect(() => {
    if (visible) {
      setPresent(true);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    backdropOp.setValue(0);
    panelOp.setValue(0);
    scale.setValue(0.94);
    const durIn = 260;
    Animated.parallel([
      Animated.timing(backdropOp, {
        toValue: 1,
        duration: durIn,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(panelOp, {
        toValue: 1,
        duration: durIn,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 68,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, backdropOp, panelOp, scale]);

  useEffect(() => {
    if (visible || !present) return;
    const durOut = 220;
    Animated.parallel([
      Animated.timing(backdropOp, {
        toValue: 0,
        duration: durOut,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(panelOp, {
        toValue: 0,
        duration: durOut,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.96,
        duration: durOut,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setPresent(false);
        onDismissRef.current?.();
      }
    });
  }, [visible, present, backdropOp, panelOp, scale]);

  if (!visible && !present) {
    return null;
  }

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root} accessibilityViewIsModal>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Kapat">
          <Animated.View
            style={[styles.backdrop, { opacity: backdropOp }]}
            pointerEvents="none"
          />
        </Pressable>
        <View style={[styles.centerWrap, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }]} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.panel,
              {
                width: cardMaxW,
                maxHeight: cardMaxH,
                opacity: panelOp,
                transform: [{ scale }],
              },
            ]}
          >
            <View style={styles.header}>
              <Text style={[styles.headerTitle, fontTight]} numberOfLines={2}>
                {title}
              </Text>
              <Pressable
                onPress={onClose}
                hitSlop={12}
                style={({ pressed }) => [styles.closeBtn, pressed && styles.closePressed]}
                accessibilityRole="button"
                accessibilityLabel="Kapat"
              >
                <MaterialCommunityIcons name="close" size={22} color={AR.slate500} />
              </Pressable>
            </View>
            <ScrollView
              style={[styles.scroll, { maxHeight: scrollMaxH }]}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
              bounces
            >
              {children}
            </ScrollView>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.52)",
  },
  centerWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  panel: {
    backgroundColor: AR.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AR.slate200,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.18,
        shadowRadius: 28,
      },
      android: { elevation: 12 },
    }),
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AR.slate200,
    gap: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: AR.slate900,
    lineHeight: 24,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: AR.bg,
  },
  closePressed: {
    opacity: 0.75,
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 22,
  },
});
