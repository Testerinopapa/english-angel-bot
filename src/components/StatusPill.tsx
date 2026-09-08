import { cn } from "@/lib/utils";

type Tone = "ok" | "warn" | "bad" | "idle";

const tones: Record<Tone, string> = {
  ok: "bg-primary/15 text-primary border-primary/30",
  warn: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  bad: "bg-destructive/15 text-destructive border-destructive/30",
  idle: "bg-muted text-muted-foreground border-border",
};

export function StatusPill({
  tone = "idle",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
