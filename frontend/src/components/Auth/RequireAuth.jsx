import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../utils/getToken";

/** Redirect guests to registration (library, settings, studio). */
export default function RequireAuth({ children }) {
  const navigate = useNavigate();
  const { isAuth } = getToken();

  useEffect(() => {
    if (!isAuth) {
      navigate("/register", { replace: true, state: { reason: "auth" } });
    }
  }, [isAuth, navigate]);

  if (!isAuth) return null;
  return children;
}
