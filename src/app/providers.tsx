import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MD3LightTheme, PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { ReactNode } from "react";
import { CoachColors } from "../theme/coachTheme";
import { CoachDialogsProvider } from "../components/coach/CoachDialogs";

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
  roundness: 8,
  colors: {
    ...MD3LightTheme.colors,
    primary: CoachColors.primary,
    onPrimary: CoachColors.onPrimary,
    primaryContainer: CoachColors.primaryContainer,
    onPrimaryContainer: CoachColors.onPrimary,
    secondary: CoachColors.secondary,
    onSecondary: CoachColors.onSecondary,
    secondaryContainer: CoachColors.secondaryContainer,
    tertiary: CoachColors.primaryFixed,
    background: CoachColors.background,
    onBackground: CoachColors.onBackground,
    surface: CoachColors.surfaceContainerLowest,
    onSurface: CoachColors.onSurface,
    surfaceVariant: CoachColors.surfaceVariant,
    onSurfaceVariant: CoachColors.onSurfaceVariant,
    outline: CoachColors.outline,
    outlineVariant: CoachColors.outlineVariant,
    error: CoachColors.error,
    onError: CoachColors.onError,
    errorContainer: CoachColors.errorContainer,
    onErrorContainer: CoachColors.onErrorContainer,
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level0: CoachColors.background,
      level1: CoachColors.surfaceContainerLow,
      level2: CoachColors.surfaceContainer,
    },
  },
};

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={paperTheme}>
          <CoachDialogsProvider>{children}</CoachDialogsProvider>
        </PaperProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
