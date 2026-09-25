'use client';

import { useTransition } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { markMessageReadAction } from '@/app/admin/(dashboard)/_actions';

export function MarkReadButton({ id }: { id: number }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => markMessageReadAction(id))}
      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-clinical text-paper hover:bg-clinical-dark disabled:opacity-60 transition-colors"
    >
      {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
      Mark read
    </button>
  );
}
