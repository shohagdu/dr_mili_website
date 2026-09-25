import { Mail, Phone, MessageSquare } from 'lucide-react';
import { adminApi } from '@/lib/admin-api';
import { MarkReadButton } from '@/components/admin/MarkReadButton';

export const dynamic = 'force-dynamic';

export default async function AdminMessagesPage() {
  const messages = await adminApi.listMessages({ limit: 200 }).catch(() => []);
  const unread = messages.filter((m) => !m.is_read).length;

  return (
    <div className="p-8 md:p-10 max-w-5xl">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink mb-2">Messages</h1>
        <p className="text-ink-muted">{messages.length} total · {unread} unread</p>
      </header>

      {messages.length === 0 ? (
        <div className="bg-paper rounded-2xl card-shadow border border-sky-50 p-16 text-center">
          <MessageSquare className="w-10 h-10 text-ink-subtle mx-auto mb-3" />
          <p className="text-ink-subtle">No contact messages yet.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => (
            <li
              key={m.id}
              className={`bg-paper rounded-2xl border p-6 transition-all ${
                m.is_read ? 'border-sky-50 card-shadow' : 'border-clinical/30 card-shadow-lg'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display text-base font-semibold text-ink">{m.name}</h3>
                    {!m.is_read && (
                      <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-clinical-tint text-clinical">
                        new
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
                    {m.email && (
                      <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1 hover:text-clinical">
                        <Mail className="w-3 h-3" /> {m.email}
                      </a>
                    )}
                    {m.phone && (
                      <a href={`tel:${m.phone}`} className="inline-flex items-center gap-1 hover:text-clinical">
                        <Phone className="w-3 h-3" /> {m.phone}
                      </a>
                    )}
                    <span>{new Date(m.created_at).toLocaleString()}</span>
                  </div>
                </div>
                {!m.is_read && <MarkReadButton id={m.id} />}
              </div>

              {m.subject && (
                <p className="text-sm font-medium text-ink mb-1.5">{m.subject}</p>
              )}
              <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-wrap">{m.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
