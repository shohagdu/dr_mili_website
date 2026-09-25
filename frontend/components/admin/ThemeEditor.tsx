'use client';

import { useState, useTransition } from 'react';
import { Check, AlertCircle, Loader2, RotateCcw, Palette } from 'lucide-react';
import type { ThemePreset, ResolvedTheme } from '@/lib/admin-api';
import {
  switchThemeAction,
  customizeThemeAction,
  resetThemeAction,
} from '@/app/admin/(dashboard)/_actions';

interface Props {
  presets: ThemePreset[];
  activeSlug: string;
  active: ResolvedTheme | null;
}

/** Human labels + grouping for the editable colour tokens. */
const COLOR_GROUPS: { group: string; tokens: { key: string; label: string }[] }[] = [
  {
    group: 'Brand',
    tokens: [
      { key: 'color.clinical', label: 'Primary' },
      { key: 'color.clinical-dark', label: 'Primary (hover)' },
      { key: 'color.clinical-light', label: 'Primary (light)' },
      { key: 'color.clinical-tint', label: 'Primary tint' },
      { key: 'color.clinical-deep', label: 'Primary deep' },
      { key: 'color.accent', label: 'Accent' },
      { key: 'color.accent-dark', label: 'Accent (hover)' },
      { key: 'color.accent-light', label: 'Accent (light)' },
    ],
  },
  {
    group: 'Surface',
    tokens: [
      { key: 'color.paper', label: 'Background' },
      { key: 'color.paper-warm', label: 'Section background' },
      { key: 'color.paper-cream', label: 'Card / band' },
    ],
  },
  {
    group: 'Text',
    tokens: [
      { key: 'color.ink', label: 'Body text' },
      { key: 'color.ink-soft', label: 'Soft text' },
      { key: 'color.ink-muted', label: 'Muted text' },
      { key: 'color.ink-subtle', label: 'Subtle text' },
    ],
  },
  {
    group: 'Status',
    tokens: [{ key: 'color.coral', label: 'Alert / emergency' }],
  },
];

type Status = { type: 'ok' | 'err'; msg: string } | null;

export function ThemeEditor({ presets, activeSlug, active }: Props) {
  const [slug, setSlug] = useState(activeSlug);
  const [tokens, setTokens] = useState<Record<string, string>>(active?.tokens ?? {});
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<Status>(null);

  function applyResolved(theme: ResolvedTheme) {
    setSlug(theme.slug);
    setTokens(theme.tokens);
  }

  function handleActivate(targetSlug: string) {
    if (targetSlug === slug) return;
    setStatus(null);
    startTransition(async () => {
      try {
        const theme = await switchThemeAction(targetSlug);
        applyResolved(theme);
        setStatus({ type: 'ok', msg: `Activated "${theme.name}"` });
      } catch (err) {
        setStatus({ type: 'err', msg: err instanceof Error ? err.message : 'Switch failed' });
      }
    });
  }

  function handleSave() {
    setStatus(null);
    startTransition(async () => {
      try {
        const theme = await customizeThemeAction(tokens);
        applyResolved(theme);
        setStatus({ type: 'ok', msg: 'Colours saved' });
      } catch (err) {
        setStatus({ type: 'err', msg: err instanceof Error ? err.message : 'Save failed' });
      }
    });
  }

  function handleReset() {
    if (!confirm('Reset all colour customizations for this theme? This cannot be undone.')) return;
    setStatus(null);
    startTransition(async () => {
      try {
        const theme = await resetThemeAction();
        applyResolved(theme);
        setStatus({ type: 'ok', msg: 'Reset to preset defaults' });
      } catch (err) {
        setStatus({ type: 'err', msg: err instanceof Error ? err.message : 'Reset failed' });
      }
    });
  }

  const normalizeHex = (v: string) => (/^#[0-9a-f]{6}$/i.test(v.trim()) ? v.trim() : '#000000');

  return (
    <div className="space-y-10">
      {status && (
        <div
          className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
            status.type === 'ok'
              ? 'bg-tint-mint text-emerald-700 border border-emerald-200'
              : 'bg-coral/10 text-coral border border-coral/20'
          }`}
        >
          {status.type === 'ok' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {status.msg}
        </div>
      )}

      {/* Preset picker */}
      <section>
        <h2 className="font-display text-lg font-semibold text-ink mb-4">Preset themes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {presets.map((p) => {
            const isActive = p.slug === slug;
            return (
              <button
                key={p.slug}
                type="button"
                disabled={pending}
                onClick={() => handleActivate(p.slug)}
                className={`text-left rounded-2xl border p-5 transition-all disabled:opacity-60 ${
                  isActive
                    ? 'border-clinical ring-2 ring-clinical/30 bg-clinical-tint'
                    : 'border-sky-100 bg-paper hover:border-clinical/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display font-semibold text-ink">{p.name}</span>
                  {isActive && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-clinical">
                      <Check className="w-3.5 h-3.5" /> Active
                    </span>
                  )}
                </div>
                {p.description && (
                  <p className="text-xs text-ink-muted leading-relaxed">{p.description}</p>
                )}
                {p.is_dark && (
                  <span className="mt-3 inline-block text-[10px] uppercase tracking-wider text-ink-subtle">
                    Dark theme
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Colour customizer */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-ink flex items-center gap-2">
            <Palette className="w-5 h-5 text-clinical" /> Customize colours
          </h2>
          <button
            type="button"
            onClick={handleReset}
            disabled={pending}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-coral disabled:opacity-60"
          >
            <RotateCcw className="w-4 h-4" /> Reset to preset
          </button>
        </div>

        <div className="space-y-6">
          {COLOR_GROUPS.map((g) => (
            <div key={g.group} className="bg-paper rounded-2xl card-shadow border border-sky-50 p-5">
              <h3 className="text-xs uppercase tracking-wider text-ink-muted font-semibold mb-4">
                {g.group}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                {g.tokens.map((t) => {
                  const value = tokens[t.key] ?? '';
                  return (
                    <label key={t.key} className="flex items-center gap-3">
                      <input
                        type="color"
                        value={normalizeHex(value)}
                        onChange={(e) => setTokens((s) => ({ ...s, [t.key]: e.target.value }))}
                        className="w-9 h-9 rounded-lg border border-ink/15 cursor-pointer bg-transparent p-0.5 shrink-0"
                        aria-label={t.label}
                      />
                      <span className="text-sm text-ink-soft flex-1">{t.label}</span>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setTokens((s) => ({ ...s, [t.key]: e.target.value }))}
                        className="field-input font-mono text-xs !py-2 w-28"
                        placeholder="#2d5bff"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={handleSave}
            disabled={pending}
            className="btn-primary disabled:opacity-60"
          >
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save colours
          </button>
        </div>
      </section>
    </div>
  );
}
