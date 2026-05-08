declare module "react-native-config" {
  export interface NativeConfig {
    API_BASE_URL?: string;
    API_BASE_URL_PRODUCTION?: string;
  }
  const Config: NativeConfig;
  export default Config;
}
