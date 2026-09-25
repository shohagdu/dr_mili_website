import Link from 'next/link';
import { Phone, Mail } from 'lucide-react';
import { adminApi } from '@/lib/admin-api';
import { StatusSelect } from '@/components/admin/StatusSelect';

export const dynamic = 'force-dynamic';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No-show' },
];

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const appointments = await adminApi.listAppointments({ status, limit: 200 }).catch(() => []);

  return (
    <div className="p-8 md:p-10 max-w-7xl">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink mb-2">Appointments</h1>
        <p className="text-ink-muted">{appointments.length} appointment{appointments.length === 1 ? '' : 's'}{status ? ` · filter: ${status}` : ''}</p>
      </header>

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => {
          const active = (f.value || '') === (status || '');
          return (
            <Link
              key={f.value || 'all'}
              href={f.value ? `/admin/appointments?status=${f.value}` : '/admin/appointments'}
              className={`text-xs font-medium px-4 py-2 rounded-full border transition-colors ${
                active
                  ? 'bg-clinical text-paper border-clinical'
                  : 'bg-paper text-ink-soft border-sky-200 hover:border-clinical hover:text-clinical'
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <div className="bg-paper rounded-2xl card-shadow border border-sky-50 overflow-hidden">
        {appointments.length === 0 ? (
          <p className="text-center text-ink-subtle py-16">No appointments to show.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-paper-warm text-xs uppercase tracking-wider text-ink-muted">
                  <th className="text-left px-5 py-3 font-semibold">Patient</th>
                  <th className="text-left px-5 py-3 font-semibold">Contact</th>
                  <th className="text-left px-5 py-3 font-semibold">Date / Slot</th>
                  <th className="text-left px-5 py-3 font-semibold">Concern</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100">
                {appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-paper-warm/40 transition-colors">
                    <td className="px-5 py-4 align-top">
                      <p className="font-medium text-ink">{a.patient_name}</p>
                      <p className="text-xs text-ink-muted">
                        {a.gender ? `${a.gender}` : ''}
                        {a.age ? ` · ${a.age}y` : ''}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <a href={`tel:${a.phone}`} className="flex items-center gap-1.5 text-ink-soft hover:text-clinical">
                        <Phone className="w-3.5 h-3.5" /> {a.phone}
                      </a>
                      {a.email && (
                        <a href={`mailto:${a.email}`} className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-clinical mt-1">
                          <Mail className="w-3 h-3" /> {a.email}
                        </a>
                      )}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="font-medium text-ink">{a.preferred_date}</p>
                      <p className="text-xs text-ink-muted">{a.preferred_slot}</p>
                    </td>
                    <td className="px-5 py-4 align-top max-w-md">
                      <p className="text-ink-soft line-clamp-3">{a.problem_summary}</p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <StatusSelect id={a.id} current={a.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
