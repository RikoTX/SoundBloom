export function getScrollContainer() {
  return document.querySelector(".custom-scrollbar");
}

export function scrollToSection(sectionId, scrollContainer, headerOffset = 100) {
  const container = scrollContainer || getScrollContainer();
  if (!container || !sectionId) return false;

  const id = sectionId.startsWith("#") ? sectionId.slice(1) : sectionId;
  const el = document.getElementById(id);
  if (!el) return false;

  const containerTop = container.getBoundingClientRect().top;
  const elTop = el.getBoundingClientRect().top;
  const offset = elTop - containerTop + container.scrollTop - headerOffset;

  container.scrollTo({
    top: Math.max(0, offset),
    behavior: "smooth",
  });

  return true;
}

export function scrollToSectionWithRetry(
  sectionId,
  scrollContainer,
  { attempts = 12, interval = 100, headerOffset = 100 } = {}
) {
  let tries = 0;

  const attempt = () => {
    if (scrollToSection(sectionId, scrollContainer, headerOffset)) return;
    tries += 1;
    if (tries < attempts) {
      setTimeout(attempt, interval);
    }
  };

  attempt();
}
