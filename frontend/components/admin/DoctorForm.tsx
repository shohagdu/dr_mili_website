'use client';

import { useState, useTransition } from 'react';
import { Plus, Trash2, Loader2, Check, AlertCircle, X } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { updateDoctorAction } from '@/app/admin/(dashboard)/_actions';
import type { AdminDoctor, DoctorChamber } from '@/lib/admin-types';

export function DoctorForm({ doctor }: { doctor: AdminDoctor }) {
  const [form, setForm] = useState<AdminDoctor>(doctor);
  const [saving, startSaving] = useTransition();
  const [status, setStatus] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const update = <K extends keyof AdminDoctor>(key: K, value: AdminDoctor[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    startSaving(async () => {
      try {
        const { id: _id, created_at: _c, updated_at: _u, ...rest } = form;
        await updateDoctorAction(form.id, rest);
        setStatus({ type: 'ok', msg: 'Saved successfully' });
      } catch (err) {
        setStatus({ type: 'err', msg: err instanceof Error ? err.message : 'Save failed' });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
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

      {/* Identity */}
      <section className="bg-paper rounded-2xl card-shadow p-6 border border-sky-50">
        <h2 className="font-display text-lg font-semibold text-ink mb-5">Identity</h2>
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Name" value={form.name} onChange={(v) => update('name', v)} required />
          <Field label="Short name (header / footer / hero card)" value={form.slug_name ?? ''} onChange={(v) => update('slug_name', v)} placeholder="Dr. Mili" />
          <Field label="Qualifications" value={form.qualifications ?? ''} onChange={(v) => update('qualifications', v)} placeholder="MBBS, FCPS (Gynecology & Obstetrics)" />
          <Field label="Positions / Job title" value={form.positions ?? ''} onChange={(v) => update('positions', v)} placeholder="Professor, Dept. of Gynecology & Obstetrics" />
          <Field label="Special training" value={form.special_training ?? ''} onChange={(v) => update('special_training', v)} />
          <Field label="Hero tag (eyebrow text)" value={form.hero_tag ?? ''} onChange={(v) => update('hero_tag', v)} placeholder="Creating a better tomorrow" />
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active === 1}
              onChange={(e) => update('is_active', e.target.checked ? 1 : 0)}
              className="w-4 h-4 accent-clinical"
            />
            <label htmlFor="is_active" className="text-sm text-ink-soft">Active (drives the public site)</label>
          </div>
        </div>
        <div className="mt-5">
          <label className="field-label">Profile (bio)</label>
          <textarea
            rows={4}
            value={form.doctor_profile ?? ''}
            onChange={(e) => update('doctor_profile', e.target.value)}
            className="field-input"
            placeholder="Doctor's biography for the About page"
          />
        </div>
      </section>

      {/* Picture */}
      <section className="bg-paper rounded-2xl card-shadow p-6 border border-sky-50">
        <h2 className="font-display text-lg font-semibold text-ink mb-5">Portrait</h2>
        <ImageUpload
          label="Hero portrait"
          value={form.picture}
          onChange={(p) => update('picture', p)}
        />
      </section>

      {/* Stats */}
      <section className="bg-paper rounded-2xl card-shadow p-6 border border-sky-50">
        <h2 className="font-display text-lg font-semibold text-ink mb-5">Stats (homepage badges)</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="Experience" value={form.stat_experience ?? ''} onChange={(v) => update('stat_experience', v)} placeholder="20+" />
          <Field label="Patients" value={form.stat_patients ?? ''} onChange={(v) => update('stat_patients', v)} placeholder="10,000+" />
          <Field label="Publications" value={form.stat_publications ?? ''} onChange={(v) => update('stat_publications', v)} placeholder="20+" />
          <Field label="Success rate" value={form.stat_success_rate ?? ''} onChange={(v) => update('stat_success_rate', v)} placeholder="98%" />
        </div>
      </section>

      {/* Expertise */}
      <section className="bg-paper rounded-2xl card-shadow p-6 border border-sky-50">
        <h2 className="font-display text-lg font-semibold text-ink mb-5">Areas of expertise</h2>
        <TagListEditor
          value={form.expertise ?? []}
          onChange={(v) => update('expertise', v)}
          placeholder="Add an expertise (e.g. Infertility Treatment)"
        />
      </section>

      {/* Chambers */}
      <section className="bg-paper rounded-2xl card-shadow p-6 border border-sky-50">
        <h2 className="font-display text-lg font-semibold text-ink mb-5">Chambers</h2>
        <ChambersEditor
          value={form.chambers ?? []}
          onChange={(v) => update('chambers', v)}
        />
      </section>

      {/* Contact */}
      <section className="bg-paper rounded-2xl card-shadow p-6 border border-sky-50">
        <h2 className="font-display text-lg font-semibold text-ink mb-5">Contact</h2>
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Mobile" value={form.mobile ?? ''} onChange={(v) => update('mobile', v)} placeholder="02-9660015" />
          <Field label="Email" value={form.email ?? ''} onChange={(v) => update('email', v)} placeholder="info@drtapan.com" />
        </div>
      </section>

      {/* Socials */}
      <section className="bg-paper rounded-2xl card-shadow p-6 border border-sky-50">
        <h2 className="font-display text-lg font-semibold text-ink mb-5">Social links</h2>
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Facebook" value={form.facebook ?? ''} onChange={(v) => update('facebook', v)} />
          <Field label="Twitter / X" value={form.twitter ?? ''} onChange={(v) => update('twitter', v)} />
          <Field label="Instagram" value={form.instagram ?? ''} onChange={(v) => update('instagram', v)} />
          <Field label="LinkedIn" value={form.linkedin ?? ''} onChange={(v) => update('linkedin', v)} />
          <Field label="TikTok" value={form.tiktok ?? ''} onChange={(v) => update('tiktok', v)} />
          <Field label="YouTube" value={form.youtube ?? ''} onChange={(v) => update('youtube', v)} />
        </div>
      </section>

      <div className="flex items-center gap-3 sticky bottom-4 bg-paper rounded-full card-shadow-lg p-2 pl-6 border border-sky-100">
        <span className="text-sm text-ink-muted flex-1">Changes save to MySQL; the public site refreshes within ~5 min.</span>
        <button
          type="submit"
          disabled={saving}
          className="btn-primary disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Save profile
        </button>
      </div>
    </form>
  );
}

function Field({ label, value, onChange, required, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="field-label">{label}{required && <span className="text-coral"> *</span>}</label>
      <input
        type="text"
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="field-input"
      />
    </div>
  );
}

function TagListEditor({ value, onChange, placeholder }: {
  value: string[]; onChange: (v: string[]) => void; placeholder: string;
}) {
  const [draft, setDraft] = useState('');
  function add() {
    const v = draft.trim();
    if (!v) return;
    onChange([...value, v]);
    setDraft('');
  }
  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {value.length === 0 && <p className="text-sm text-ink-subtle">No items yet.</p>}
        {value.map((v, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-clinical-tint text-clinical">
            {v}
            <button type="button" onClick={() => remove(i)} className="hover:text-coral">
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="field-input flex-1"
        />
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-clinical text-paper text-sm font-medium hover:bg-clinical-dark"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>
    </div>
  );
}

function ChambersEditor({ value, onChange }: {
  value: DoctorChamber[]; onChange: (v: DoctorChamber[]) => void;
}) {
  function update(i: number, key: keyof DoctorChamber, val: string | string[] | DoctorChamber['geo']) {
    onChange(value.map((c, idx) => (idx === i ? { ...c, [key]: val } : c)));
  }
  function addChamber() {
    onChange([...value, { name: '', address: '', phones: [], hours: '' }]);
  }
  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }
  function updatePhones(i: number, raw: string) {
    const phones = raw.split(',').map((p) => p.trim()).filter(Boolean);
    update(i, 'phones', phones);
  }
  return (
    <div className="space-y-4">
      {value.length === 0 && <p className="text-sm text-ink-subtle">No chambers added.</p>}
      {value.map((c, i) => (
        <div key={i} className="border border-sky-100 rounded-xl p-5 bg-paper-warm/40">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs uppercase tracking-wider font-semibold text-ink-muted">Chamber #{i + 1}</p>
            <button type="button" onClick={() => remove(i)} className="text-coral hover:bg-coral/10 rounded-full p-2">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Name" value={c.name} onChange={(v) => update(i, 'name', v)} required />
            <Field label="Hours" value={c.hours ?? ''} onChange={(v) => update(i, 'hours', v)} placeholder="Open 24 hours" />
            <div className="md:col-span-2">
              <label className="field-label">Address</label>
              <textarea
                rows={2}
                value={c.address}
                onChange={(e) => update(i, 'address', e.target.value)}
                className="field-input"
              />
            </div>
            <div className="md:col-span-2">
              <Field
                label="Phones (comma-separated)"
                value={(c.phones ?? []).join(', ')}
                onChange={(v) => updatePhones(i, v)}
                placeholder="02-9660015, 02-9660016"
              />
            </div>
            <Field
              label="Latitude (optional)"
              value={c.geo?.lat?.toString() ?? ''}
              onChange={(v) => update(i, 'geo', { ...c.geo, lat: v ? Number(v) : undefined })}
              placeholder="23.7747"
            />
            <Field
              label="Longitude (optional)"
              value={c.geo?.lng?.toString() ?? ''}
              onChange={(v) => update(i, 'geo', { ...c.geo, lng: v ? Number(v) : undefined })}
              placeholder="90.3618"
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addChamber}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-clinical text-clinical text-sm font-medium hover:bg-clinical-tint"
      >
        <Plus className="w-4 h-4" /> Add chamber
      </button>
    </div>
  );
}
