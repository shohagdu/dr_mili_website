'use client';

import { useState, useTransition } from 'react';
import { Loader2, Check, AlertCircle, Plus, Trash2 } from 'lucide-react';
import {
  saveSettingsAction,
  deleteSettingAction,
} from '@/app/admin/(dashboard)/_actions';

interface Props {
  initial: Record<string, string>;
}

interface Row {
  id: string;
  key: string;
  value: string;
  originalKey?: string; // present for existing rows
}

function makeId() {
  return Math.random().toString(36).slice(2);
}

export function SettingsForm({ initial }: Props) {
  const [rows, setRows] = useState<Row[]>(
    Object.entries(initial)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => ({ id: makeId(), key: k, value: v, originalKey: k })),
  );
  const [saving, startSaving] = useTransition();
  const [status, setStatus] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  function updateRow(id: string, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((rs) => [...rs, { id: makeId(), key: '', value: '' }]);
  }

  async function removeRow(row: Row) {
    if (row.originalKey) {
      if (!confirm(`Delete setting "${row.originalKey}"? This cannot be undone.`)) return;
      try {
        await deleteSettingAction(row.originalKey);
        setRows((rs) => rs.filter((r) => r.id !== row.id));
        setStatus({ type: 'ok', msg: `Deleted ${row.originalKey}` });
      } catch (err) {
        setStatus({ type: 'err', msg: err instanceof Error ? err.message : 'Delete failed' });
      }
    } else {
      setRows((rs) => rs.filter((r) => r.id !== row.id));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);

    // Validate: all rows must have a non-empty key; keys must be unique.
    const keys = new Set<string>();
    for (const r of rows) {
      const k = r.key.trim();
      if (!k) {
        setStatus({ type: 'err', msg: 'All settings must have a key' });
        return;
      }
      if (keys.has(k)) {
        setStatus({ type: 'err', msg: `Duplicate key: ${k}` });
        return;
      }
      keys.add(k);
    }

    const payload: Record<string, string> = {};
    for (const r of rows) payload[r.key.trim()] = r.value;

    startSaving(async () => {
      try {
        await saveSettingsAction(payload);
        // Reflect renames: any new keys become the new "originalKey"
        setRows((rs) =>
          rs.map((r) => ({ ...r, key: r.key.trim(), originalKey: r.key.trim() })),
        );
        // Delete settings that were renamed (originalKey exists, but key changed) — only after successful save
        // The bulk endpoint upserts but doesn't delete; we delete renames separately.
        const renames = rows.filter(
          (r) => r.originalKey && r.originalKey !== r.key.trim(),
        );
        for (const r of renames) {
          if (r.originalKey) await deleteSettingAction(r.originalKey);
        }
        setStatus({ type: 'ok', msg: 'Saved' });
      } catch (err) {
        setStatus({ type: 'err', msg: err instanceof Error ? err.message : 'Save failed' });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
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

      <div className="bg-paper rounded-2xl card-shadow border border-sky-50 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-paper-warm text-xs uppercase tracking-wider text-ink-muted">
              <th className="text-left px-5 py-3 font-semibold w-1/3">Key</th>
              <th className="text-left px-5 py-3 font-semibold">Value</th>
              <th className="text-right px-5 py-3 font-semibold w-20">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sky-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-12 text-center text-ink-subtle">
                  No settings yet — click "Add setting".
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="align-top">
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={r.key}
                      onChange={(e) => updateRow(r.id, { key: e.target.value })}
                      className="field-input font-mono text-xs"
                      placeholder="site_email"
                      maxLength={80}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <textarea
                      rows={r.value.length > 80 ? 3 : 1}
                      value={r.value}
                      onChange={(e) => updateRow(r.id, { value: e.target.value })}
                      className="field-input"
                    />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => removeRow(r)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-coral hover:underline"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Save all
        </button>
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-paper-warm text-ink-soft text-sm font-medium hover:bg-clinical-tint hover:text-clinical transition-colors"
        >
          <Plus className="w-4 h-4" /> Add setting
        </button>
      </div>
    </form>
  );
}
