import type { CapacitorConfig } from "@capacitor/cli";

// The Android app is a native shell that loads the deployed WedStudio OS web
// app. `server.url` must point at a PUBLICLY reachable deployment (Vercel
// Deployment Protection must be OFF for production, or the app will show
// Vercel's login page). Override at build time with CAP_SERVER_URL if needed.
const serverUrl =
  process.env.CAP_SERVER_URL || "https://film-studio-managment-prabin-sharmas-projects.vercel.app";

const config: CapacitorConfig = {
  appId: "com.infinitycreations.wedstudio",
  appName: "WedStudio OS",
  webDir: "mobile/www",
  server: {
    url: serverUrl,
    cleartext: false,
    // keep in-app navigation inside the webview for the app's own domain
    allowNavigation: ["*.vercel.app"],
  },
  android: {
    backgroundColor: "#ffffff",
  },
};

export default config;
