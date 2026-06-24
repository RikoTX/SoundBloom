import { useLanguage } from "../i18n/LanguageProvider";
import { Container } from "../components/Container";
import { BrandLogo } from "../components/BrandLogo";

export function Footer() {
  const { c } = useLanguage();

  return (
    <footer className="relative border-t border-white/[0.08] py-14">
      <Container className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <BrandLogo
            playOnView
            className="font-display text-lg font-extrabold tracking-tight sm:text-xl"
          />
          <p className="mt-4 font-display text-2xl font-semibold text-spectrum">
            {c.footer.tagline}
          </p>
        </div>

        <div className="text-sm text-bone/65 sm:text-right">
          <p>{c.footer.madeWith}</p>
          <p className="mt-1">{c.footer.copyright}</p>
        </div>
      </Container>
    </footer>
  );
}
