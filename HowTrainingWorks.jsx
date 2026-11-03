import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const STEPS = [
  {
    title: '1 · It reads the file once',
    body: 'Photos, PDFs and slides are turned into plain text. Text files are read as they are. That text is the only thing that goes any further.',
  },
  {
    title: '2 · The text becomes a study set',
    body: 'The words are saved in your own study set, so plans, quizzes and tutor answers can be built from them later.',
  },
  {
    title: '3 · Nothing is retrained',
    body: 'No model is trained on your notes and no weights change. The model is fixed. Each time you ask for a plan or a quiz, it reads your notes again from scratch.',
  },
  {
    title: '4 · The dots are a picture',
    body: 'The firing neurons show a reading step that takes a few seconds, not a brain being rewired. It is a visual for what is happening to your file, not a peek inside the model.',
  },
  {
    title: '5 · Your files stay yours',
    body: 'Uploaded files are stored privately and never leave your account. The text lands in your study sets and nowhere else.',
  },
];

export default function HowTrainingWorks() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
      >
        <HelpCircle className="h-3.5 w-3.5" strokeWidth={1.8} />
        how it works
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">the honest version</p>
            <DialogTitle className="font-display text-2xl">How the training works</DialogTitle>
            <DialogDescription>
              Short answer: it does not train anything. It reads your file and keeps the text.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {STEPS.map((step) => (
              <div key={step.title} className="border-l border-border/70 pl-4">
                <p className="text-sm font-medium tracking-tight">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>

          <p className="border-t border-border/60 pt-4 text-xs leading-relaxed text-muted-foreground/70">
            What that buys you: delete the study set and it genuinely forgets the material. Nothing is baked in.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
