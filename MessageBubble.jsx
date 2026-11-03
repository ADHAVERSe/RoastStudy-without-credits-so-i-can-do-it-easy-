export default function MessageBubble({ role, content, pending }) {
  const isUser = role === 'user';

  return (
    <div className={`animate-rise flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`mt-1 shrink-0 w-7 h-7 rounded-full border flex items-center justify-center font-mono text-[10px] uppercase ${
          isUser
            ? 'border-border text-muted-foreground'
            : 'border-primary/40 text-primary bg-primary/5'
        }`}
      >
        {isUser ? 'you' : 'it'}
      </div>

      <div className={`max-w-[42rem] ${isUser ? 'text-right' : ''}`}>
        {pending ? (
          <div className="flex items-center gap-1.5 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/70 animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary/30 animate-pulse [animation-delay:300ms]" />
          </div>
        ) : (
          <p
            className={`whitespace-pre-wrap text-[15px] leading-relaxed ${
              isUser ? 'text-muted-foreground' : 'text-foreground'
            }`}
          >
            {content}
          </p>
        )}
      </div>
    </div>
  );
}
