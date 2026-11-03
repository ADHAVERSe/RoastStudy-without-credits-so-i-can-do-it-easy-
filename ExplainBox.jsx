import { useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ExplainBox({ studySetId }) {
  const [question, setQuestion] = useState('');
  const [thread, setThread] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const ask = async () => {
    const asked = question.trim();
    if (!asked || busy) return;
    setError('');
    setQuestion('');
    setBusy(true);
    setThread((prev) => [...prev, { role: 'q', text: asked }]);
    try {
      const res = await base44.functions.invoke('explainConcept', { studySetId, question: asked });
      const text = res.data && res.data.explanation;
      if (!text) throw new Error('no answer');
      setThread((prev) => [...prev, { role: 'a', text }]);
    } catch (e) {
      setError('The tutor did not answer. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="border-b border-border/70 px-4 py-3 md:px-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Ask the tutor
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          It explains the idea and asks you something back. It will not hand you a finished answer.
        </p>
      </div>

      <div className="space-y-4 px-4 py-4 md:px-5">
        {thread.length === 0 && !busy ? (
          <p className="text-sm text-muted-foreground/70">
            Try: “I don’t get how this part works” or “why does that happen”.
          </p>
        ) : null}

        {thread.map((item, i) =>
          item.role === 'q' ? (
            <p key={i} className="text-sm text-muted-foreground">
              <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60">
                you
              </span>
              {item.text}
            </p>
          ) : (
            <p key={i} className="animate-rise whitespace-pre-wrap text-[15px] leading-relaxed">
              <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
                tutor
              </span>
              {item.text}
            </p>
          )
        )}

        {busy && (
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary/70" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary/50 [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary/30 [animation-delay:300ms]" />
          </div>
        )}

        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <div className="flex items-end gap-2 border-t border-border/70 px-3 py-3">
        <textarea
          rows={1}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              ask();
            }
          }}
          placeholder="What are you stuck on?"
          className="max-h-32 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-relaxed outline-none placeholder:text-muted-foreground/60"
        />
        <button
          onClick={ask}
          disabled={busy || !question.trim()}
          aria-label="Ask"
          className="mb-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-30"
        >
          <ArrowUp className="h-4 w-4" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}
