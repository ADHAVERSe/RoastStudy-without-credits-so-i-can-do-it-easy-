import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function NewSetDialog({ open, onOpenChange, onCreated }) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const create = async () => {
    if (!title.trim() || busy) return;
    setBusy(true);
    setError('');
    try {
      const record = await base44.entities.StudySet.create({
        title: title.trim(),
        notes: notes.trim(),
        plan_json: '',
      });
      setTitle('');
      setNotes('');
      onOpenChange(false);
      onCreated(record);
    } catch (e) {
      setError('Could not save that. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-border bg-card">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-normal">New study set</DialogTitle>
          <DialogDescription>
            Paste your notes. The plan and the questions come only from what you paste.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              What is it about
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Cell biology, week 4"
              className="mt-2"
            />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste lecture notes, a chapter summary, definitions — anything you were given."
              className="mt-2 min-h-[180px] resize-y"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <button
            onClick={create}
            disabled={!title.trim() || busy}
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-30"
          >
            {busy ? 'Saving…' : 'Create study set'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
