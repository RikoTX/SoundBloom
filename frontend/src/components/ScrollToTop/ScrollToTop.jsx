import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { scrollToSectionWithRetry } from "../../utils/scrollToSection";
import { restoreScrollPosition } from "../../utils/scrollRestoration";

export default function ScrollToTop({ scrollRef }) {
  const { pathname, hash, state } = useLocation();

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const sectionId = hash?.replace("#", "");

    if (sectionId) {
      scrollToSectionWithRetry(sectionId, container);
      return;
    }

    if (typeof state?.restoreScroll === "number") {
      restoreScrollPosition(state.restoreScroll, container);
      return;
    }

    container.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname, hash, state, scrollRef]);

  return null;
}
