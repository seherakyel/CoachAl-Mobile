/** Maps Firebase Auth (and fallbacks) to short Turkish copy for snackbars. */
export function authErrorMessage(error: unknown): string {
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: string }).code ?? "")
      : "";

  switch (code) {
    case "auth/network-request-failed":
      return "Bağlantı hatası: İnternetinizi kontrol edin; VPN/proxy kapatıp tekrar deneyin. Emülatörde DNS sorunu varsa cihazı yeniden başlatın.";
    case "auth/invalid-email":
      return "Geçerli bir e-posta adresi girin.";
    case "auth/user-disabled":
      return "Bu hesap devre dışı bırakılmış.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "E-posta veya şifre hatalı.";
    case "auth/too-many-requests":
      return "Çok fazla deneme yapıldı. Bir süre sonra tekrar deneyin.";
    case "auth/email-already-in-use":
      return "Bu e-posta ile zaten bir hesap var.";
    case "auth/weak-password":
      return "Şifre çok zayıf. Daha uzun bir şifre seçin.";
    case "auth/operation-not-allowed":
      return "Bu giriş yöntemi şu an kapalı. Yönetici ayarlarını kontrol edin.";
    default:
      break;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "İşlem tamamlanamadı.";
}
