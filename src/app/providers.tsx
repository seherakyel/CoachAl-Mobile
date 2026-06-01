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
  colors: {
    ...MD3LightTheme.colors,
    primary: CoachColors.primary,
    onPrimary: CoachColors.onPrimary,
    primaryContainer: CoachColors.primaryFixedDim,
    onPrimaryContainer: CoachColors.onSurface,
    secondary: CoachColors.secondary,
    onSecondary: CoachColors.onSecondary,
    tertiary: CoachColors.secondaryContainer,
    background: CoachColors.background,
    surface: CoachColors.surfaceCard,
    surfaceVariant: CoachColors.surfaceVariant,
    outline: CoachColors.outlineVariant,
    error: CoachColors.error,
    onError: CoachColors.onError,
    errorContainer: CoachColors.errorContainer,
    onErrorContainer: CoachColors.onErrorContainer,
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
