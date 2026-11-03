import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import MessageBubble from '@/components/chat/MessageBubble';
import Composer from '@/components/chat/Composer';
import PageHeader from '@/components/PageHeader';
import useSettings from '@/hooks/useSettings';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

const BAIT = [
  'why is it raining cats and dogs',
  'im dying to know what photosynthesis is',
  'how do i get my foot in the door',
];

function ModeChip({ on, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors',
        on
          ? 'border-primary/50 bg-primary/10 text-primary'
          : 'border-border bg-transparent text-muted-foreground/60'
      )}
    >
      {label}
    </button>
  );
}

export default function Chat() {
  const { settings, update } = useSettings();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const scroller = useRef(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const page = await base44.entities.Message.filter({}, { sort: 'created_date', limit: 200 });
        if (alive) setMessages(page.items);
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, sending]);

  const send = async (text) => {
    setError('');
    const withUser = [...messages, { id: `tmp-${Date.now()}`, role: 'user', content: text }];
    setMessages(withUser);
    setSending(true);
    try {
      const res = await base44.functions.invoke('aiChat', {
        messages: withUser.map((m) => ({ role: m.role, content: m.content })),
      });
      const reply = res.data && res.data.reply;
      if (!reply) throw new Error('empty reply');
      await base44.entities.Message.bulkCreate([
        { role: 'user', content: text },
        { role: 'assistant', content: reply },
      ]);
      const page = await base44.entities.Message.filter({}, { sort: 'created_date', limit: 200 });
      setMessages(page.items);
    } catch (e) {
      setMessages(messages);
      setError('That did not go through. Try again.');
    } finally {
      setSending(false);
    }
  };

  const clear = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    await base44.entities.Message.deleteMany({});
    setMessages([]);
    setConfirmClear(false);
  };

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <PageHeader
        eyebrow="Literal mode"
        title="Everything at face value"
        description="No idioms. No reading between the lines. It will answer exactly what you typed, and it will not be nice about it."
      >
        <div className="flex items-center gap-1.5">
          {settings ? (
            <>
              <ModeChip on={settings.literal_mode !== false} label="literal" onClick={() => update({ literal_mode: !(settings.literal_mode !== false) })} />
              <ModeChip on={settings.roast_mode !== false} label="roast" onClick={() => update({ roast_mode: !(settings.roast_mode !== false) })} />
              <ModeChip on={settings.profanity === true} label="swear" onClick={() => update({ profanity: !(settings.profanity === true) })} />
              <Link
                to="/settings"
                className="ml-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground"
              >
                settings
              </Link>
            </>
          ) : null}
        </div>
      </PageHeader>

      <div ref={scroller} className="flex-1 overflow-y-auto px-5 py-8 md:px-8">
        <div className="mx-auto max-w-3xl space-y-7">
          {loading ? (
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">loading</p>
          ) : messages.length === 0 ? (
            <div className="animate-rise pt-8">
              <Sparkles className="h-5 w-5 text-primary" strokeWidth={1.5} />
              <h2 className="mt-5 font-display text-3xl leading-tight md:text-4xl">
                Say something badly.
                <br />
                <span className="text-muted-foreground">It will take you at your word.</span>
              </h2>
              <div className="mt-8 flex flex-wrap gap-2">
                {BAIT.map((line) => (
                  <button
                    key={line}
                    onClick={() => send(line)}
                    className="rounded-full border border-border px-3.5 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    {line}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((m) => (
                <MessageBubble key={m.id} role={m.role} content={m.content} />
              ))}
              {sending && <MessageBubble role="assistant" pending />}
            </>
          )}
        </div>
      </div>

      {messages.length > 0 && (
        <div className="mx-auto w-full max-w-3xl px-5 md:px-8">
          <button
            onClick={clear}
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/50 transition-colors hover:text-destructive"
          >
            {confirmClear ? 'confirm: delete this conversation' : 'clear conversation'}
          </button>
        </div>
      )}

      {error && (
        <p className="mx-auto w-full max-w-3xl px-5 pb-1 text-xs text-destructive md:px-8">{error}</p>
      )}

      <Composer onSend={send} disabled={sending || loading} />
    </div>
  );
}
