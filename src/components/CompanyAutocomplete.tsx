import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { extractDetail } from "../services/apiClient";
import type { CompanySearchItem } from "../services/api";
import { searchCompanies } from "../services/api";
import { getApiBaseUrl } from "../config/env";
import { CoachColors, CoachRadii } from "../theme/coachTheme";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  selectedCompany: CompanySearchItem | null;
  onSelectCompany: (company: CompanySearchItem | null) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
};

export function CompanyAutocomplete({
  value,
  onChangeText,
  selectedCompany,
  onSelectCompany,
  placeholder = "örn: Trendyol",
  disabled,
  label = "Hedef Şirket",
}: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CompanySearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const q = useMemo(() => value.trim(), [value]);
  const canSearch = !disabled && q.length >= 2;

  useEffect(() => {
    if (!open) return;
    if (!canSearch) {
      setItems([]);
      setLoading(false);
      setError(null);
      abortRef.current?.abort();
      abortRef.current = null;
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setLoading(true);
      setError(null);
      if (__DEV__) {
        console.info("[CompanyAutocomplete] company search start", {
          endpoint: `${getApiBaseUrl()}/api/company/search`,
          q,
          limit: 8,
        });
      }
      searchCompanies(q, { signal: ac.signal, limit: 8 })
        .then((res) => {
          setItems(res);
          if (__DEV__) {
            console.info("[CompanyAutocomplete] company search success", {
              q,
              count: Array.isArray(res) ? res.length : 0,
              first: Array.isArray(res) && res.length > 0 ? res[0] : null,
            });
            console.info(
              "[CompanyAutocomplete] companies",
              Array.isArray(res)
                ? res.map((c) => ({
                    id: c.id,
                    name: c.name,
                    universal_name: c.universal_name,
                    industry: c.industry,
                    has_logo: !!c.logo_url,
                  }))
                : res,
            );
          }
        })
        .catch((e: unknown) => {
          if ((e as Error)?.name === "AbortError") return;
          setItems([]);
          // Debug log: endpoint, status, response data (if any)
          try {
            const errAny = e as any;
            const status = errAny?.response?.status;
            const data = errAny?.response?.data;
            const msg = errAny?.message;
            const code = errAny?.code;
            console.warn("[CompanyAutocomplete] company search failed", {
              endpoint: `${getApiBaseUrl()}/api/company/search`,
              q,
              status,
              code,
              message: msg,
              data,
            });
          } catch {
            // ignore logging failures
          }

          setError(extractDetail(e));
        })
        .finally(() => {
          setLoading(false);
        });
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q, open, canSearch]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const onPick = (c: CompanySearchItem) => {
    onSelectCompany(c);
    onChangeText(c.name);
    setOpen(false);
  };

  const clearSelection = () => {
    onSelectCompany(null);
    onChangeText("");
    setItems([]);
    setError(null);
    setOpen(false);
  };

  return (
    <View style={styles.root}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          value={value}
          onChangeText={(t) => {
            if (selectedCompany) onSelectCompany(null);
            onChangeText(t);
            setOpen(true);
          }}
          placeholder={placeholder}
          placeholderTextColor={CoachColors.secondaryText}
          editable={!disabled}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // küçük gecikme: liste tıklaması blur’dan önce gelsin
            setTimeout(() => setOpen(false), 150);
          }}
          style={styles.input}
        />
        {loading ? <ActivityIndicator size="small" color={CoachColors.secondary} /> : null}
        {value.trim().length > 0 ? (
          <Pressable onPress={clearSelection} hitSlop={10} accessibilityLabel="Şirketi temizle">
            <MaterialCommunityIcons name="close-circle" size={18} color={CoachColors.onSurfaceVariant} />
          </Pressable>
        ) : null}
      </View>

      {open ? (
        <View style={styles.dropdown} pointerEvents="box-none">
          {error ? <Text style={styles.miniError}>{error}</Text> : null}
          {!error && !loading && canSearch && items.length === 0 ? (
            <Text style={styles.miniHint}>Sonuç bulunamadı</Text>
          ) : null}
          {items.length > 0 ? (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            >
              {items.map((item, idx) => (
                <Pressable
                  key={String(item.id || item.universal_name || item.name || idx)}
                  onPress={() => onPick(item)}
                  style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                >
                  {item.logo_url ? (
                    <Image
                      source={{ uri: item.logo_url }}
                      style={styles.logo}
                      resizeMode="cover"
                      onError={(ev) => {
                        if (__DEV__) {
                          console.warn("[CompanyAutocomplete] logo load failed", {
                            name: item.name,
                            logo_url: item.logo_url,
                            error: ev?.nativeEvent,
                          });
                        }
                      }}
                    />
                  ) : (
                    <View style={styles.logoFallback}>
                      <Text style={styles.logoFallbackText}>
                        {(item.name || "?")[0]?.toUpperCase?.() ?? "?"}
                      </Text>
                    </View>
                  )}
                  <View style={styles.rowText}>
                    <Text style={styles.name} numberOfLines={1}>
                      {item.name}
                    </Text>
                    {item.industry ? (
                      <Text style={styles.industry} numberOfLines={1}>
                        {item.industry}
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { position: "relative" },
  label: { fontSize: 14, fontWeight: "500", color: CoachColors.onSurface, marginBottom: 8 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: CoachColors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: CoachColors.outlineVariant,
    borderRadius: CoachRadii.md,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    fontSize: 16,
    color: CoachColors.onSurface,
  },
  dropdown: {
    position: "absolute",
    top: 78,
    left: 0,
    right: 0,
    backgroundColor: CoachColors.surfaceCard,
    borderWidth: 1,
    borderColor: CoachColors.outlineVariant,
    borderRadius: CoachRadii.lg,
    overflow: "hidden",
    zIndex: 50,
    elevation: 6,
  },
  list: { maxHeight: 240 },
  listContent: { paddingVertical: 2 },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10, gap: 10 },
  rowPressed: { backgroundColor: CoachColors.surfaceContainer },
  logo: { width: 28, height: 28, borderRadius: 6, backgroundColor: CoachColors.surfaceContainerHighest },
  logoFallback: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: CoachColors.surfaceContainerHighest,
    alignItems: "center",
    justifyContent: "center",
  },
  logoFallbackText: { fontSize: 12, fontWeight: "700", color: CoachColors.onSurfaceVariant },
  rowText: { flex: 1, minWidth: 0 },
  name: { fontSize: 14, fontWeight: "600", color: CoachColors.onSurface },
  industry: { marginTop: 2, fontSize: 12, color: CoachColors.onSurfaceVariant },
  miniHint: { paddingHorizontal: 12, paddingVertical: 10, fontSize: 12, color: CoachColors.onSurfaceVariant },
  miniError: { paddingHorizontal: 12, paddingVertical: 10, fontSize: 12, color: CoachColors.onSurfaceVariant },
});

