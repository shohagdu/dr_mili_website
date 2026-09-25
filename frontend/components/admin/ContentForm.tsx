'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import {
  createContentAction,
  updateContentAction,
  deleteContentAction,
} from '@/app/admin/(dashboard)/_actions';
import type { AdminContent, CreateContentInput } from '@/lib/admin-types';

const TYPE_OPTIONS = [
  { value: 9, label: 'Homepage Hero Section' },
  { value: 1, label: 'Why Choose Us' },
  { value: 2, label: 'About Us' },
  { value: 7, label: 'Picture' },
  { value: 8, label: 'Video' },
] as const;

type Mode = 'create' | 'edit';

interface Props {
  mode: Mode;
  initial?: AdminContent;
  initialType?: number;
}

export function ContentForm({ mode, initial, initialType }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<CreateContentInput>({
    type: initial?.type ?? initialType ?? 1,
    icon: initial?.icon ?? '',
    title: initial?.title ?? '',
    short_description: initial?.short_description ?? '',
    description: initial?.description ?? '',
    storage_type: initial?.storage_type ?? '1',
    file_path: initial?.file_path ?? '',
    display_position: initial?.display_position ?? 0,
    is_highlight_item: initial?.is_highlight_item ?? 0,
    is_active: initial?.is_active ?? 1,
  });

  const [saving, startSaving] = useTransition();
  const [deleting, startDeleting] = useTransition();
  const [status, setStatus] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const update = <K extends keyof CreateContentInput>(key: K, value: CreateContentInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const isMedia = form.type === 7 || form.type === 8;
  const isVideo = form.type === 8;
  const isHero = form.type === 9;
  const isText = form.type === 1 || form.type === 2;

  // Sync storage_type with type
  function changeType(t: number) {
    update('type', t);
    if (t === 8) update('storage_type', '2'); // video defaults to URL
    else if (t === 7) update('storage_type', '1'); // picture defaults to local upload
    else update('storage_type', '1');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    startSaving(async () => {
      try {
        // Strip empty strings → undefined so backend's Option<String> stays NULL where appropriate.
        const payload: CreateContentInput = {
          ...form,
          icon: form.icon || undefined,
          short_description: form.short_description || undefined,
          description: form.description || undefined,
          file_path: form.file_path || undefined,
          storage_type: form.storage_type || undefined,
        };
        if (mode === 'edit' && initial) {
          await updateContentAction(initial.id, payload);
          setStatus({ type: 'ok', msg: 'Saved' });
        } else {
          await createContentAction(payload);
          // createContentAction redirects; no need to setStatus
        }
      } catch (err) {
        setStatus({ type: 'err', msg: err instanceof Error ? err.message : 'Save failed' });
      }
    });
  }

  function handleDelete() {
    if (!initial) return;
    if (!confirm('Delete this content item? This cannot be undone.')) return;
    startDeleting(async () => {
      try {
        await deleteContentAction(initial.id);
        router.push('/admin/content');
      } catch (err) {
        setStatus({ type: 'err', msg: err instanceof Error ? err.message : 'Delete failed' });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {status && (
        <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
          status.type === 'ok'
            ? 'bg-tint-mint text-emerald-700 border border-emerald-200'
            : 'bg-coral/10 text-coral border border-coral/20'
        }`}>
          {status.type === 'ok' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {status.msg}
        </div>
      )}

      <section className="bg-paper rounded-2xl card-shadow p-6 border border-sky-50 space-y-5">
        <div>
          <label className="field-label">Type</label>
          <select
            value={form.type}
            onChange={(e) => changeType(Number(e.target.value))}
            className="field-input"
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {isHero && (
          <div className="rounded-lg bg-clinical-tint/60 border border-sky-200 px-4 py-3 text-xs text-ink-soft leading-relaxed">
            This drives the homepage hero. Only the first <strong>active</strong> hero row is shown.
            The patient stats, doctor name and phone number come from the <strong>Doctor</strong> profile.
          </div>
        )}

        <div>
          <label className="field-label">
            {isHero ? 'Headline' : 'Title'}<span className="text-coral"> *</span>
          </label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            className="field-input"
          />
          {isHero && (
            <p className="text-xs text-ink-muted mt-1">
              Wrap a phrase in *asterisks* to colour it, and use <code>\n</code> for a line break.
              e.g. <code>Modern *gynecological care*\nyou can trust.</code>
            </p>
          )}
        </div>

        {(isText || isHero) && (
          <div>
            <label className="field-label">
              {isHero ? 'Tag / badge text' : 'Icon (Bootstrap / FontAwesome class)'}
            </label>
            <input
              type="text"
              value={form.icon ?? ''}
              onChange={(e) => update('icon', e.target.value)}
              className="field-input"
              placeholder={isHero ? 'Creating a better tomorrow' : 'bi bi-clipboard-data'}
            />
            <p className="text-xs text-ink-muted mt-1">
              {isHero
                ? 'Small pill shown above the headline.'
                : 'Optional — used for "Why Choose" feature cards.'}
            </p>
          </div>
        )}

        {(isText || isHero) && (
          <div>
            <label className="field-label">{isHero ? 'Subtitle paragraph' : 'Short description'}</label>
            <textarea
              rows={3}
              value={form.short_description ?? ''}
              onChange={(e) => update('short_description', e.target.value)}
              className="field-input"
            />
          </div>
        )}

        {!isMedia && !isHero && (
          <div>
            <label className="field-label">Description (long form)</label>
            <textarea
              rows={6}
              value={form.description ?? ''}
              onChange={(e) => update('description', e.target.value)}
              className="field-input"
            />
          </div>
        )}

        {(form.type === 7 || isHero) && (
          <ImageUpload
            label={isHero ? 'Hero portrait' : 'Picture'}
            value={form.file_path}
            onChange={(p) => update('file_path', p ?? '')}
          />
        )}

        {isVideo && (
          <div>
            <label className="field-label">Video URL (YouTube/Vimeo embed URL)</label>
            <input
              type="url"
              value={form.file_path ?? ''}
              onChange={(e) => update('file_path', e.target.value)}
              className="field-input"
              placeholder="https://www.youtube.com/embed/XXXX"
            />
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-5">
          <div>
            <label className="field-label">Display position</label>
            <input
              type="number"
              value={form.display_position ?? 0}
              onChange={(e) => update('display_position', Number(e.target.value))}
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label">Status</label>
            <select
              value={form.is_active ?? 1}
              onChange={(e) => update('is_active', Number(e.target.value))}
              className="field-input"
            >
              <option value={1}>Active</option>
              <option value={2}>Inactive</option>
              <option value={3}>Deleted (hidden)</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-ink-soft pb-3">
              <input
                type="checkbox"
                checked={form.is_highlight_item === 1}
                onChange={(e) => update('is_highlight_item', e.target.checked ? 1 : 0)}
                className="w-4 h-4 accent-clinical"
              />
              Highlight item
            </label>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {mode === 'create' ? 'Create' : 'Save'}
        </button>
        {mode === 'edit' && initial && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-coral/10 text-coral text-sm font-medium hover:bg-coral hover:text-paper transition-colors disabled:opacity-60"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
