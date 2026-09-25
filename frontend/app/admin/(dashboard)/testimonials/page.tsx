import Link from 'next/link';
import { Plus, Pencil, Star } from 'lucide-react';
import { adminApi } from '@/lib/admin-api';

export const dynamic = 'force-dynamic';

export default async function AdminTestimonialsPage() {
  const items = await adminApi.listTestimonials({ limit: 200 }).catch(() => []);

  return (
    <div className="p-8 md:p-10 max-w-7xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink mb-2">Testimonials</h1>
          <p className="text-ink-muted">{items.length} testimonial{items.length === 1 ? '' : 's'}</p>
        </div>
        <Link href="/admin/testimonials/new" className="btn-primary">
          <Plus className="w-4 h-4" /> New testimonial
        </Link>
      </header>

      <div className="bg-paper rounded-2xl card-shadow border border-sky-50 overflow-hidden">
        {items.length === 0 ? (
          <p className="text-center text-ink-subtle py-16">No testimonials yet — click "New testimonial".</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-paper-warm text-xs uppercase tracking-wider text-ink-muted">
                  <th className="text-left px-5 py-3 font-semibold">Patient</th>
                  <th className="text-left px-5 py-3 font-semibold">Rating</th>
                  <th className="text-left px-5 py-3 font-semibold">Message</th>
                  <th className="text-left px-5 py-3 font-semibold">Order</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                  <th className="text-right px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100">
                {items.map((t) => {
                  const visible = t.is_published && t.consent_given;
                  return (
                    <tr key={t.id} className="hover:bg-paper-warm/40 transition-colors">
                      <td className="px-5 py-3 align-top">
                        <p className="font-medium text-ink">{t.patient_name}</p>
                        <p className="text-xs text-ink-muted">
                          {[t.patient_age && `${t.patient_age} yrs`, t.location].filter(Boolean).join(' · ')}
                        </p>
                      </td>
                      <td className="px-5 py-3 align-top">
                        <span className="inline-flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: t.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </span>
                      </td>
                      <td className="px-5 py-3 align-top">
                        <p className="text-ink-soft line-clamp-2 max-w-md">{t.message}</p>
                      </td>
                      <td className="px-5 py-3 align-top text-ink-soft">{t.display_order}</td>
                      <td className="px-5 py-3 align-top">
                        <span className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full ${
                          visible
                            ? 'bg-tint-mint text-emerald-600'
                            : 'bg-paper-warm text-ink-muted'
                        }`}>
                          {visible ? 'live' : !t.consent_given ? 'no consent' : 'draft'}
                        </span>
                      </td>
                      <td className="px-5 py-3 align-top text-right">
                        <Link
                          href={`/admin/testimonials/${t.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-clinical hover:gap-2 transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
