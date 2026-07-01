import { getAppUrl } from "./app-url";

export const GOOGLE_STATE_COOKIE = "google_oauth_state";

export function googleRedirectUri() {
  return `${getAppUrl()}/api/auth/google/callback`;
}
