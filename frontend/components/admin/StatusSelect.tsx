'use client';

import { useTransition } from 'react';
import { updateAppointmentStatusAction } from '@/app/admin/(dashboard)/_actions';

const OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No-show' },
];

export function StatusSelect({ id, current }: { id: number; current: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={current}
      disabled={pending}
      onChange={(e) =>
        startTransition(() => updateAppointmentStatusAction(id, e.target.value))
      }
      className="text-xs font-medium px-3 py-1.5 rounded-full border border-sky-200 bg-paper focus:outline-none focus:ring-2 focus:ring-clinical/30 focus:border-clinical disabled:opacity-50 cursor-pointer"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
