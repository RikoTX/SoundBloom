import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop({ scrollRef }) {
  const { pathname } = useLocation();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pathname]);

  return null;
}
