import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const TEXT_FILE = /\.(txt|md|csv|json)$/i;
const MAX_BYTES = 15 * 1024 * 1024;

const titleFromName = (name) =>
  name
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120) || 'Imported notes';

export default function TrainingDropzone({ onImported, onActivity, onError }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [dragging, setDragging] = useState(false);

  const textOf = async (file) => {
    if (TEXT_FILE.test(file.name) || file.type.startsWith('text/')) return file.text();
    const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
    const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({
      file_uri,
      expires_in: 600,
    });
    const res = await base44.functions.invoke('readDocument', { fileUrl: signed_url });
    const data = res.data || {};
    if (!data.text) throw new Error(data.error || 'unreadable');
    return data.text;
  };

  const ingest = async (fileList) => {
    const files = Array.from(fileList || []).slice(0, 5);
    if (!files.length) return;
    setBusy(true);
    onError('');

    for (const file of files) {
      try {
        if (file.size > MAX_BYTES) throw new Error('too big');
        setStatus(`reading ${file.name}`);
        onActivity(file.name);
        const text = (await textOf(file)).trim();
        if (text.length < 20) throw new Error('no text');

        const title = titleFromName(file.name);
        const studySet = await base44.entities.StudySet.create({
          title,
          notes: text.slice(0, 20000),
        });
        const record = await base44.entities.TrainingImport.create({
          file_name: file.name,
          file_type: file.type || file.name.split('.').pop() || 'file',
          study_set_id: studySet.id,
          study_set_title: title,
          words: text.split(/\s+/).filter(Boolean).length,
          chars: text.length,
        });
        onImported(record);
      } catch (e) {
        onError(`Could not read ${file.name}. Try a text file, or a clearer copy of it.`);
      }
    }

    onActivity('');
    setStatus('');
    setBusy(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <section>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,.csv,.json,.xlsx,.docx"
        className="hidden"
        onChange={(e) => ingest(e.target.files)}
      />
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          ingest(e.dataTransfer.files);
        }}
        className={`rounded-2xl border border-dashed px-6 py-10 text-center transition-colors ${
          dragging ? 'border-primary/70 bg-primary/5' : 'border-border'
        }`}
      >
        <p className="font-display text-xl leading-snug">Feed it something.</p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          PDFs, slides, photos of handwritten notes, text, Markdown or CSV. Whatever it manages to read becomes
          a study set you can be quizzed on.
        </p>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          <Upload className="h-4 w-4" strokeWidth={2} />
          {busy ? 'reading…' : 'Choose files'}
        </button>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60">
          {busy ? status : 'or drop them here · up to 5 at once'}
        </p>
      </div>
    </section>
  );
}
