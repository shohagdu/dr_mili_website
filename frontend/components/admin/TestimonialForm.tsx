'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import {
  createTestimonialAction,
  updateTestimonialAction,
  deleteTestimonialAction,
} from '@/app/admin/(dashboard)/_actions';
import type { AdminTestimonialItem, CreateTestimonialInput } from '@/lib/admin-types';

type Mode = 'create' | 'edit';

interface Props {
  mode: Mode;
  initial?: AdminTestimonialItem;
}

export function TestimonialForm({ mode, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<CreateTestimonialInput>({
    patient_name: initial?.patient_name ?? '',
    patient_age: initial?.patient_age ?? undefined,
    location: initial?.location ?? '',
    rating: initial?.rating ?? 5,
    message: initial?.message ?? '',
    treatment_for: initial?.treatment_for ?? '',
    is_published: initial?.is_published ?? false,
    consent_given: initial?.consent_given ?? false,
    display_order: initial?.display_order ?? 0,
  });

  const [saving, startSaving] = useTransition();
  const [deleting, startDeleting] = useTransition();
  const [status, setStatus] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const update = <K extends keyof CreateTestimonialInput>(
    key: K,
    value: CreateTestimonialInput[K],
  ) => setForm((f) => ({ ...f, [key]: value }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    startSaving(async () => {
      try {
        const payload: CreateTestimonialInput = {
          ...form,
          location: form.location || undefined,
          treatment_for: form.treatment_for || undefined,
          patient_age: form.patient_age || undefined,
        };
        if (mode === 'edit' && initial) {
          await updateTestimonialAction(initial.id, payload);
          setStatus({ type: 'ok', msg: 'Saved' });
        } else {
          await createTestimonialAction(payload);
        }
      } catch (err) {
        setStatus({ type: 'err', msg: err instanceof Error ? err.message : 'Save failed' });
      }
    });
  }

  function handleDelete() {
    if (!initial) return;
    if (!confirm('Delete this testimonial? This cannot be undone.')) return;
    startDeleting(async () => {
      try {
        await deleteTestimonialAction(initial.id);
        router.push('/admin/testimonials');
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
            <label className="field-label">Patient name<span className="text-coral"> *</span></label>
            <input
              type="text"
              required
              value={form.patient_name}
              onChange={(e) => update('patient_name', e.target.value)}
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label">Age</label>
            <input
              type="number"
              min={1}
              max={130}
              value={form.patient_age ?? ''}
              onChange={(e) => update('patient_age', e.target.value ? Number(e.target.value) : undefined)}
              className="field-input"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="field-label">Location</label>
            <input
              type="text"
              value={form.location ?? ''}
              onChange={(e) => update('location', e.target.value)}
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label">Treatment for</label>
            <input
              type="text"
              value={form.treatment_for ?? ''}
              onChange={(e) => update('treatment_for', e.target.value)}
              className="field-input"
            />
          </div>
        </div>

        <div>
          <label className="field-label">Rating<span className="text-coral"> *</span></label>
          <select
            value={form.rating}
            onChange={(e) => update('rating', Number(e.target.value))}
            className="field-input"
          >
            {[1, 2, 3, 4, 5].map((r) => (
              <option key={r} value={r}>{'★'.repeat(r)}{'☆'.repeat(5 - r)} ({r})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label">Message<span className="text-coral"> *</span></label>
          <textarea
            required
            rows={6}
            value={form.message}
            onChange={(e) => update('message', e.target.value)}
            className="field-input"
          />
        </div>
      </section>

      <section className="bg-paper rounded-2xl card-shadow p-6 border border-sky-50">
        <div className="grid sm:grid-cols-3 gap-5">
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
                checked={form.is_published ?? false}
                onChange={(e) => update('is_published', e.target.checked)}
                className="w-4 h-4 accent-clinical"
              />
              Published
            </label>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-ink-soft pb-3">
              <input
                type="checkbox"
                checked={form.consent_given ?? false}
                onChange={(e) => update('consent_given', e.target.checked)}
                className="w-4 h-4 accent-clinical"
              />
              Consent given
            </label>
          </div>
        </div>
        <p className="text-xs text-ink-muted mt-3">
          Only testimonials with both <strong>Published</strong> and <strong>Consent given</strong> appear on the public site.
        </p>
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
