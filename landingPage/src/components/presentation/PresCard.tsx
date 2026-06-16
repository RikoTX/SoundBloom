import { Reveal } from "../Reveal";

interface PresCardProps {
  title: string;
  text: string;
  delay?: number;
  variant?: "light" | "mint" | "dark";
}

export function PresCard({ title, text, delay = 0, variant = "light" }: PresCardProps) {
  const cls =
    variant === "mint"
      ? "pres-card pres-card-mint"
      : variant === "dark"
        ? "pres-card pres-card-dark"
        : "pres-card pres-card-light";

  return (
    <Reveal delay={delay} y={20} className={cls}>
      <span className="pres-card-dot" aria-hidden />
      <h3 className="pres-card-title">{title}</h3>
      <p className="pres-card-text">{text}</p>
    </Reveal>
  );
}
