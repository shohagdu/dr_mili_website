'use client';

import { useState, useRef } from 'react';
import { Upload, Loader2, X } from 'lucide-react';
import { assetUrl } from '@/lib/cms';
import { withBasePath } from '@/lib/base-path';

interface Props {
  value?: string | null;
  onChange: (path: string | null) => void;
  label?: string;
  accept?: string;
}

export function ImageUpload({ value, onChange, label = 'Image', accept = 'image/*' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(withBasePath('/api/admin/upload'), { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message || data?.error || 'Upload failed');
        return;
      }
      onChange(data?.data?.path ?? null);
    } catch {
      setError('Network error during upload');
    } finally {
      setUploading(false);
    }
  }

  const preview = assetUrl(value);

  return (
    <div>
      <label className="field-label">{label}</label>
      <div className="flex items-start gap-4">
        {preview ? (
          <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-sky-200 bg-paper-warm flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-paper text-coral hover:bg-coral hover:text-paper grid place-items-center transition-colors"
              title="Remove"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="w-32 h-32 rounded-xl border-2 border-dashed border-sky-200 bg-paper-warm grid place-items-center flex-shrink-0">
            <Upload className="w-7 h-7 text-ink-subtle" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-clinical text-paper hover:bg-clinical-dark disabled:opacity-60 transition-colors"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Uploading…
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" /> {preview ? 'Replace' : 'Choose file'}
              </>
            )}
          </button>
          <p className="text-xs text-ink-muted mt-2">PNG, JPG, WEBP, GIF, SVG, PDF · max 5 MB</p>
          {value && (
            <p className="text-xs text-ink-subtle mt-1 truncate">Path: <code>{value}</code></p>
          )}
          {error && <p className="text-xs text-coral mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
}
