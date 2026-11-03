export default function PlanView({ plan }) {
  if (!plan) return null;
  const days = Array.isArray(plan.days) ? plan.days : [];
  const checkpoints = Array.isArray(plan.checkpoints) ? plan.checkpoints : [];

  return (
    <div className="space-y-5">
      {plan.summary && (
        <p className="font-display text-xl leading-snug text-foreground/90 md:text-2xl">{plan.summary}</p>
      )}

      <ol className="space-y-3">
        {days.map((day, i) => (
          <li key={i} className="rounded-2xl border border-border bg-card p-4 md:p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                {day.label}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {day.minutes} min
              </span>
            </div>
            {day.focus && <p className="mt-2 text-[15px] leading-relaxed">{day.focus}</p>}
            {Array.isArray(day.tasks) && day.tasks.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {day.tasks.map((task, j) => (
                  <li key={j} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>

      {checkpoints.length > 0 && (
        <div className="rounded-2xl border border-dashed border-border p-4 md:p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">prove it</p>
          <ul className="mt-3 space-y-2">
            {checkpoints.map((item, i) => (
              <li key={i} className="text-sm leading-relaxed text-foreground/90">
                — {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
