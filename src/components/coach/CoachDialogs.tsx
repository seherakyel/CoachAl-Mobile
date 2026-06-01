import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { Portal, Dialog, Button, Text, Snackbar } from "react-native-paper";
import { CoachPalette } from "../../theme/coachTheme";

const APP_BLUE = CoachPalette.midnightIndigo;

type ToastVariant = "success" | "error" | "info";

type DialogsApi = {
  toast: (message: string, variant?: ToastVariant) => void;
  confirm: (message: string, options?: { title?: string; danger?: boolean }) => Promise<boolean>;
  alert: (message: string, options?: { title?: string }) => Promise<void>;
};

const DialogsContext = createContext<DialogsApi | null>(null);

let globalApi: DialogsApi | null = null;

export function registerCoachDialogsApi(api: DialogsApi): void {
  globalApi = api;
}

export function CoachDialogsProvider({ children }: { children: ReactNode }) {
  const [snack, setSnack] = useState<{ message: string; variant: ToastVariant } | null>(null);
  const [confirmState, setConfirmState] = useState<{
    message: string;
    title: string;
    danger: boolean;
    resolve: (v: boolean) => void;
  } | null>(null);
  const [alertState, setAlertState] = useState<{
    message: string;
    title: string;
    resolve: () => void;
  } | null>(null);

  const toast = useCallback((message: string, variant: ToastVariant = "info") => {
    setSnack({ message, variant });
  }, []);

  const confirm = useCallback(
    (message: string, options?: { title?: string; danger?: boolean }) =>
      new Promise<boolean>((resolve) => {
        setConfirmState({
          message,
          title: options?.title ?? "Onay",
          danger: options?.danger ?? false,
          resolve,
        });
      }),
    [],
  );

  const alert = useCallback(
    (message: string, options?: { title?: string }) =>
      new Promise<void>((resolve) => {
        setAlertState({
          message,
          title: options?.title ?? "Bilgi",
          resolve,
        });
      }),
    [],
  );

  const api: DialogsApi = { toast, confirm, alert };

  useEffect(() => {
    registerCoachDialogsApi(api);
  }, [toast, confirm, alert]);

  const snackBg =
    snack?.variant === "error" ? "#ffdad6" : snack?.variant === "success" ? "rgba(56, 95, 140, 0.15)" : undefined;

  return (
    <DialogsContext.Provider value={api}>
      {children}
      <Snackbar
        visible={!!snack}
        onDismiss={() => setSnack(null)}
        duration={4000}
        style={snackBg ? { backgroundColor: snackBg } : undefined}
      >
        {snack?.message ?? ""}
      </Snackbar>
      <Portal>
        <Dialog visible={!!confirmState} onDismiss={() => confirmState?.resolve(false)}>
          <Dialog.Title>{confirmState?.title}</Dialog.Title>
          <Dialog.Content>
            <Text>{confirmState?.message}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                confirmState?.resolve(false);
                setConfirmState(null);
              }}
            >
              İptal
            </Button>
            <Button
              textColor={confirmState?.danger ? "#ba1a1a" : APP_BLUE}
              onPress={() => {
                confirmState?.resolve(true);
                setConfirmState(null);
              }}
            >
              Onayla
            </Button>
          </Dialog.Actions>
        </Dialog>
        <Dialog
          visible={!!alertState}
          onDismiss={() => {
            alertState?.resolve();
            setAlertState(null);
          }}
        >
          <Dialog.Title>{alertState?.title}</Dialog.Title>
          <Dialog.Content>
            <Text>{alertState?.message}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                alertState?.resolve();
                setAlertState(null);
              }}
            >
              Tamam
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </DialogsContext.Provider>
  );
}

export function useCoachDialogs(): DialogsApi {
  const ctx = useContext(DialogsContext);
  if (!ctx) throw new Error("useCoachDialogs must be used within CoachDialogsProvider");
  return ctx;
}

export function coachToast(message: string, variant: ToastVariant = "info"): void {
  globalApi?.toast(message, variant);
}

export function coachConfirm(
  message: string,
  options?: { title?: string; danger?: boolean },
): Promise<boolean> {
  return globalApi?.confirm(message, options) ?? Promise.resolve(false);
}

export function coachAlert(message: string, options?: { title?: string }): Promise<void> {
  return globalApi?.alert(message, options) ?? Promise.resolve();
}
