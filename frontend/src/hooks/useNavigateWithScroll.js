import { useNavigate, useLocation } from "react-router-dom";
import { buildReturnState, getScrollContainer } from "../utils/scrollRestoration";

const FALLBACK_ROUTES = {
  popular: "/Popular",
  search: "/Search",
  artist: "/Artist",
  home: "/Home",
};

export default function useNavigateWithScroll() {
  const navigate = useNavigate();
  const location = useLocation();

  return (to, options = {}) => {
    navigate(to, {
      ...options,
      state: buildReturnState(location, options.state),
    });
  };
}

export function useReturnNavigation(fallbackFrom = "home") {
  const navigate = useNavigate();
  const location = useLocation();

  const returnTo = location.state?.returnTo;
  const returnScroll = location.state?.returnScroll ?? 0;
  const from = location.state?.from || fallbackFrom;

  const goBack = () => {
    if (returnTo) {
      navigate(returnTo, { state: { restoreScroll: returnScroll } });
      return;
    }

    const fallback = FALLBACK_ROUTES[from] || FALLBACK_ROUTES.home;

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(fallback, { state: { restoreScroll: 0 } });
  };

  return { returnTo, returnScroll, goBack, from };
}

export { getScrollContainer };
