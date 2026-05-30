export function dispatchAuthChange() {
  window.dispatchEvent(new Event("soundbloom-auth-change"));
}

export const PROFILE_CHANGE_EVENT = "soundbloom-profile-change";

export function dispatchProfileChange() {
  window.dispatchEvent(new Event(PROFILE_CHANGE_EVENT));
}

export function saveAuthSession({ token }) {
  sessionStorage.setItem("token", token);
  localStorage.setItem("token", token);
  dispatchAuthChange();
}

export function clearAuthSession() {
  sessionStorage.removeItem("token");
  localStorage.removeItem("token");
  sessionStorage.removeItem("username");
  localStorage.removeItem("username");
  sessionStorage.removeItem("role");
  localStorage.removeItem("role");
  dispatchAuthChange();
}
