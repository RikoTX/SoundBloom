export function decodeJwtPayload(token) {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "="));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getClaimsFromToken(token) {
  const payload = decodeJwtPayload(token);

  if (!payload) {
    return { username: "", role: "user", email: "", userId: "" };
  }

  return {
    userId: payload.sub || "",
    email: payload.email || "",
    username: payload.username || "",
    role: payload.role || "user",
  };
}
