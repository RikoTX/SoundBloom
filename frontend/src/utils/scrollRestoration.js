export function getScrollContainer() {
  return document.querySelector(".custom-scrollbar");
}

export function restoreScrollPosition(scrollTop, container) {
  const el = container || getScrollContainer();
  if (!el || scrollTop == null) return;

  const target = Math.max(0, Number(scrollTop) || 0);

  const apply = (attempt = 0) => {
    el.scrollTop = target;
    if (Math.abs(el.scrollTop - target) > 2 && attempt < 20) {
      requestAnimationFrame(() => apply(attempt + 1));
    }
  };

  requestAnimationFrame(() => apply());
}

export function buildReturnState(location, extraState = {}) {
  const container = getScrollContainer();
  return {
    ...extraState,
    returnTo: `${location.pathname}${location.search}${location.hash}`,
    returnScroll: container?.scrollTop ?? 0,
  };
}
