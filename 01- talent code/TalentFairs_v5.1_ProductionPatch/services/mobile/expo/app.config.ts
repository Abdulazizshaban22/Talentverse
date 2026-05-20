// services/mobile/expo/app.config.ts
import { ExpoConfig } from "expo/config";
const config: ExpoConfig = {
  name: "TalentFairs",
  slug: "talentfairs",
  scheme: "com.talentfairs.app",
  ios: { bundleIdentifier: "com.talentfairs.app", supportsTablet: true },
  android: { package: "com.talentfairs.app" },
  plugins: ["expo-notifications"],
  extra: { eas: { projectId: "REPLACE_ME" } }
};
export default config;
