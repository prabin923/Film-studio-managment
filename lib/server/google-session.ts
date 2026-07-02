import { getAppUrl } from "./app-url";

export const GOOGLE_STATE_COOKIE = "google_oauth_state";
export const GOOGLE_JOIN_COOKIE = "google_oauth_join_owner_email";

export function googleRedirectUri() {
  return `${getAppUrl()}/api/auth/google/callback`;
}
