import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FacebookOutlined,
  InstagramOutlined,
  XOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { getToken } from "../../utils/getToken";
import { getFooterSections } from "../../constants/footerLinks";
import {
  scrollToSectionWithRetry,
  getScrollContainer,
} from "../../utils/scrollToSection";
import DiaTextReveal from "../DiaTextReveal/DiaTextReveal";

function FooterLink({ label, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-2 text-left text-sm transition-colors duration-200 cursor-pointer ${
        isActive
          ? "text-[#EE10B0]"
          : "text-white/55 hover:text-white"
      }`}
    >
      <span
        className={`h-1 w-1 rounded-full transition-all duration-200 ${
          isActive
            ? "bg-[#EE10B0] scale-100"
            : "bg-[#EE10B0]/0 group-hover:bg-[#EE10B0] group-hover:scale-100"
        }`}
      />
      {label}
    </button>
  );
}

function FooterColumn({ title, sectionId, items, selectedItem, onItemClick }) {
  const { t } = useTranslation();
  return (
    <div>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#EE10B0]">
        {title}
      </h3>
      <ul className="space-y-2.5">
        {items.map((item) => {
          const itemId = `${sectionId}-${item.id}`;
          return (
            <li key={itemId}>
              <FooterLink
                label={t(item.labelKey)}
                isActive={selectedItem === itemId}
                onClick={() => onItemClick(sectionId, item)}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const SOCIAL_LINKS = [
  { icon: FacebookOutlined, label: "Facebook", href: "#" },
  { icon: InstagramOutlined, label: "Instagram", href: "#" },
  { icon: XOutlined, label: "X", href: "#" },
  { icon: MailOutlined, label: "Email", href: "/contact" },
];

export default function FooterPage() {
  const { isAuth } = getToken();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedItem, setSelectedItem] = useState(null);

  const footerSections = getFooterSections(isAuth);

  const handleItemClick = (sectionId, item) => {
    const itemId = `${sectionId}-${item.id}`;
    setSelectedItem(itemId);

    if (item.path === "/login" || item.path === "/register") {
      navigate(item.path);
      return;
    }

    if (item.path && !item.hash) {
      navigate(item.path);
      return;
    }

    const hash = item.hash ? `#${item.hash}` : "";
    const targetPath = item.path || location.pathname;

    if (!item.path && item.hash) {
      scrollToSectionWithRetry(item.hash, getScrollContainer());
      window.history.replaceState(null, "", `${location.pathname}${hash}`);
      return;
    }

    if (location.pathname === targetPath && item.hash) {
      scrollToSectionWithRetry(item.hash, getScrollContainer());
      window.history.replaceState(null, "", `${targetPath}${hash}`);
      return;
    }

    navigate(`${targetPath}${hash}`);
  };

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/[0.06] bg-[#09090B]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#EE10B0]/40 to-transparent" />
      <div
        className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-[#EE10B0]/[0.04] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-[#0E9EEF]/[0.04] blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-6 py-14 sm:px-10 sm:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <button
              type="button"
              onClick={() => navigate("/Home")}
              className="cursor-pointer text-left"
            >
              <DiaTextReveal
                text="SoundBloom"
                colors={["#EE10B0", "#0E9EEF"]}
                finalGradient
                duration={1.6}
                repeat
                repeatDelay={1.2}
                once={false}
                startOnView={false}
                className="text-3xl font-extrabold tracking-tight sm:text-4xl"
              />
            </button>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/45">
              {isAuth ? t("footer.taglineAuth") : t("footer.taglineGuest")}
            </p>

            <div id="footer-social" className="mt-6 flex items-center gap-3">
              {SOCIAL_LINKS.map(({ icon: Icon, label, href }) =>
                href.startsWith("/") ? (
                  <Link
                    key={label}
                    to={href}
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/50 transition-all duration-200 hover:border-[#EE10B0]/40 hover:bg-[#EE10B0]/10 hover:text-[#EE10B0]"
                  >
                    <Icon className="text-lg" />
                  </Link>
                ) : (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/50 transition-all duration-200 hover:border-[#EE10B0]/40 hover:bg-[#EE10B0]/10 hover:text-[#EE10B0]"
                  >
                    <Icon className="text-lg" />
                  </a>
                )
              )}
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 sm:gap-8">
              {footerSections.map((section) => (
                <FooterColumn
                  key={section.id}
                  title={t(section.titleKey)}
                  sectionId={section.id}
                  items={section.items}
                  selectedItem={selectedItem}
                  onItemClick={handleItemClick}
                />
              ))}
            </div>
          </div>
        </div>

        {!isAuth && (
          <div className="mt-12 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
            <p className="text-sm leading-relaxed text-white/50">
              {t("footer.aboutGuest")}
            </p>
          </div>
        )}

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
          <p className="text-xs text-white/30">
            {t("common.copyright", { year: new Date().getFullYear() })}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
            <Link
              to="/about"
              className="text-white/40 transition-colors hover:text-[#EE10B0]"
            >
              {t("common.about")}
            </Link>
            <Link
              to="/premium"
              className="text-white/40 transition-colors hover:text-[#EE10B0]"
            >
              {t("common.premium")}
            </Link>
            <Link
              to="/contact"
              className="text-white/40 transition-colors hover:text-[#EE10B0]"
            >
              {t("common.contact")}
            </Link>
            {!isAuth && (
              <Link
                to="/register"
                className="rounded-full bg-[#EE10B0]/15 px-4 py-1.5 font-medium text-[#EE10B0] transition-colors hover:bg-[#EE10B0]/25"
              >
                {t("common.getStarted")}
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
