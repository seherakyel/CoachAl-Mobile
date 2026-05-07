import type { Persistence } from "firebase/auth";
import type AsyncStorage from "@react-native-async-storage/async-storage";

declare module "firebase/auth" {
  /** Provided by the React Native build of `@firebase/auth` (Metro resolves to `dist/rn`). */
  export function getReactNativePersistence(storage: typeof AsyncStorage): Persistence;
}
