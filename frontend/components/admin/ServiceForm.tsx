'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import {
  createServiceAction,
  updateServiceAction,
  deleteServiceAction,
} from '@/app/admin/(dashboard)/_actions';
import type { AdminServiceItem, CreateServiceInput } from '@/lib/admin-types';

type Mode = 'create' | 'edit';

interface Props {
  mode: Mode;
  initial?: AdminServiceItem;
}

export function ServiceForm({ mode, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<CreateServiceInput>({
    slug: initial?.slug ?? '',
    title: initial?.title ?? '',
    category: initial?.category ?? '',
    short_description: initial?.short_description ?? '',
    full_content: initial?.full_content ?? '',
    icon: initial?.icon ?? '',
    cover_image: initial?.cover_image ?? '',
    meta_title: initial?.meta_title ?? '',
    meta_description: initial?.meta_description ?? '',
    display_order: initial?.display_order ?? 0,
    is_published: initial?.is_published ?? true,
  });

  const [saving, startSaving] = useTransition();
  const [deleting, startDeleting] = useTransition();
  const [status, setStatus] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const update = <K extends keyof CreateServiceInput>(key: K, value: CreateServiceInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    startSaving(async () => {
      try {
        const payload: CreateServiceInput = {
          ...form,
          icon: form.icon || undefined,
          cover_image: form.cover_image || undefined,
          meta_title: form.meta_title || undefined,
          meta_description: form.meta_description || undefined,
        };
        if (mode === 'edit' && initial) {
          await updateServiceAction(initial.id, payload);
          setStatus({ type: 'ok', msg: 'Saved' });
        } else {
          await createServiceAction(payload);
        }
      } catch (err) {
        setStatus({ type: 'err', msg: err instanceof Error ? err.message : 'Save failed' });
      }
    });
  }

  function handleDelete() {
    if (!initial) return;
    if (!confirm('Delete this service? This cannot be undone.')) return;
    startDeleting(async () => {
      try {
        await deleteServiceAction(initial.id);
        router.push('/admin/services');
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
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="field-label">Title<span className="text-coral"> *</span></label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label">Slug<span className="text-coral"> *</span></label>
            <input
              type="text"
              required
              value={form.slug}
              onChange={(e) => update('slug', e.target.value)}
              className="field-input"
              placeholder="my-service"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="field-label">Category<span className="text-coral"> *</span></label>
            <input
              type="text"
              required
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label">Icon (CSS class)</label>
            <input
              type="text"
              value={form.icon ?? ''}
              onChange={(e) => update('icon', e.target.value)}
              className="field-input"
              placeholder="bi bi-heart-pulse"
            />
          </div>
        </div>

        <div>
          <label className="field-label">Short description<span className="text-coral"> *</span></label>
          <textarea
            required
            rows={3}
            value={form.short_description}
            onChange={(e) => update('short_description', e.target.value)}
            className="field-input"
          />
        </div>

        <div>
          <label className="field-label">Full content (HTML / markdown)<span className="text-coral"> *</span></label>
          <textarea
            required
            rows={12}
            value={form.full_content}
            onChange={(e) => update('full_content', e.target.value)}
            className="field-input font-mono text-xs"
          />
        </div>

        <ImageUpload
          label="Cover image"
          value={form.cover_image}
          onChange={(p) => update('cover_image', p ?? '')}
        />
      </section>

      <section className="bg-paper rounded-2xl card-shadow p-6 border border-sky-50 space-y-5">
        <h2 className="text-sm font-semibold text-ink-soft uppercase tracking-wider">SEO</h2>
        <div>
          <label className="field-label">Meta title</label>
          <input
            type="text"
            value={form.meta_title ?? ''}
            onChange={(e) => update('meta_title', e.target.value)}
            className="field-input"
          />
        </div>
        <div>
          <label className="field-label">Meta description</label>
          <textarea
            rows={2}
            value={form.meta_description ?? ''}
            onChange={(e) => update('meta_description', e.target.value)}
            className="field-input"
          />
        </div>
      </section>

      <section className="bg-paper rounded-2xl card-shadow p-6 border border-sky-50">
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="field-label">Display order</label>
            <input
              type="number"
              value={form.display_order ?? 0}
              onChange={(e) => update('display_order', Number(e.target.value))}
              className="field-input"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-ink-soft pb-3">
              <input
                type="checkbox"
                checked={form.is_published ?? true}
                onChange={(e) => update('is_published', e.target.checked)}
                className="w-4 h-4 accent-clinical"
              />
              Published
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
