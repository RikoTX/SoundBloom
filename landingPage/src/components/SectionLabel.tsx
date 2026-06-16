import { Reveal } from "./Reveal";

interface SectionLabelProps {
  index: string;
  label: string;
  align?: "left" | "right";
}

export function SectionLabel({ index, label, align = "left" }: SectionLabelProps) {
  return (
    <Reveal>
      <div
        className={`flex items-center gap-4 ${
          align === "right" ? "justify-end" : ""
        }`}
      >
        <span className="font-display text-sm text-magenta">{index}</span>
        <span className="h-px w-10 bg-gradient-to-r from-magenta/70 to-transparent" />
        <span className="overline text-bone/50">{label}</span>
      </div>
    </Reveal>
  );
}
