import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MD3LightTheme, PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { ReactNode } from "react";
import { CoachColors } from "../theme/coachTheme";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: CoachColors.primaryContainer,
    onPrimary: CoachColors.onPrimary,
    primaryContainer: CoachColors.primaryFixed,
    onPrimaryContainer: CoachColors.onSurface,
    background: CoachColors.background,
    surface: CoachColors.surfaceContainerLowest,
    surfaceVariant: CoachColors.surfaceVariant,
    outline: CoachColors.outlineVariant,
    error: CoachColors.error,
  },
};

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={paperTheme}>{children}</PaperProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
