import { getClaimsFromToken } from "./jwtDecode";

export const getToken = () => {
  const token =
    sessionStorage.getItem("token") || localStorage.getItem("token");
  const claims = getClaimsFromToken(token);

  return {
    isAuth: Boolean(token),
    token,
    username: claims.username,
    role: claims.role,
    email: claims.email,
    userId: claims.userId,
    isAdmin: claims.role === "admin",
    isOperator: claims.role === "operator",
  };
};
