declare module "react-native-config" {
  export interface NativeConfig {
    API_BASE_URL?: string;
    API_BASE_URL_PRODUCTION?: string;
    /** true ise Android'de 127.0.0.1/localhost 10.0.2.2'ye cevrilmez (adb reverse ile). */
    ANDROID_USE_DEVICE_LOCALHOST?: string;
  }
  const Config: NativeConfig;
  export default Config;
}
