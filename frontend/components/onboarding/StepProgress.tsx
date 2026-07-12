/** Thin top progress line for the onboarding stepper (design 2.5). */
export function StepProgress({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="h-0.5 w-full bg-border">
      <div
        className="h-full bg-accent transition-[width] duration-250"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
