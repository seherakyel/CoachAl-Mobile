import { type ReactNode } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { AR, fontTight } from "./analysisResultTokens";

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  /** iOS: called when dismiss animation completes; use to clear modal content state. */
  onDismiss?: () => void;
  children: ReactNode;
};

export function AnalysisBottomModal({ visible, title, onClose, onDismiss, children }: Props) {
  const { height: winH } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const sheetMaxH = Math.min(winH * 0.92, winH - insets.top);
  const bottomPad = Math.max(insets.bottom, 12);
  const headerBlockH = 88;
  const scrollMaxH = Math.max(160, sheetMaxH - headerBlockH - bottomPad);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      onDismiss={onDismiss}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Kapat" />
        <View
          style={[
            styles.sheet,
            {
              maxHeight: sheetMaxH,
              paddingBottom: bottomPad,
            },
          ]}
        >
          <View style={styles.grab} />
          <View style={styles.header}>
            <Text style={[styles.headerTitle, fontTight]} numberOfLines={2}>
              {title}
            </Text>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
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
            nestedScrollEnabled
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
  },
  sheet: {
    backgroundColor: AR.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: AR.slate200,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: { elevation: 16 },
    }),
  },
  grab: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: AR.slate200,
    marginTop: 10,
    marginBottom: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
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
  scroll: {
    flexShrink: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
});
