import { Link } from 'react-router-dom';
import { shortDate } from '@/lib/format';

export default function ImportList({ imports, loading }) {
  if (loading) {
    return (
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">loading</p>
    );
  }

  if (!imports.length) {
    return (
      <p className="rounded-2xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">
        Nothing read yet. Until you feed it something, it knows nothing but its own opinion.
      </p>
    );
  }

  return (
    <section>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        what it has read
      </p>
      <div className="mt-3 space-y-2">
        {imports.map((item) => (
          <Link
            key={item.id}
            to={`/study/${item.study_set_id}`}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3.5 transition-colors hover:border-primary/40"
          >
            <div className="min-w-0">
              <p className="truncate text-[15px]">{item.file_name}</p>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
                {(item.words || 0).toLocaleString()} words · {shortDate(item.created_date)} ·{' '}
                {item.study_set_title || 'study set'}
              </p>
            </div>
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
              open
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
