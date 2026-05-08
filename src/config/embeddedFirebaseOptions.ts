import type { FirebaseOptions } from "firebase/app";

/**
 * Firebase Web/JS SDK seçenekleri — `android/app/google-services.json` ile aynı projeden türetildi.
 * Backend `/config/firebase` erişilemediğinde kimlik doğrulama yine başlatılabilsin diye yedek.
 * Projeyi taşıdığınızda bu dosyayı veya google-services.json'ı güncel tutun.
 */
export function getEmbeddedFirebaseOptions(): FirebaseOptions {
  return {
    apiKey: "AIzaSyDyYkz8ZvUPYpZXvYBh-MGq7-4rExHbmUs",
    authDomain: "coachai-5fd8a.firebaseapp.com",
    projectId: "coachai-5fd8a",
    storageBucket: "coachai-5fd8a.firebasestorage.app",
    messagingSenderId: "177709679180",
  };
}
