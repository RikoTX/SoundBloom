import { getToken } from "./getToken";

export const REGISTER_FOR_PLAYBACK_STATE = { reason: "playback" };

export function isAuthenticated() {
  return getToken().isAuth;
}

/** Guests may browse and search; playback requires registration. */
export function redirectToRegisterForPlayback(navigate) {
  navigate("/register", { state: REGISTER_FOR_PLAYBACK_STATE });
}
