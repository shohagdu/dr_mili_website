import Link from 'next/link';
import { CalendarClock, MessageSquare, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';
import { adminApi } from '@/lib/admin-api';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [appointments, messages] = await Promise.all([
    adminApi.listAppointments({ limit: 200 }).catch(() => []),
    adminApi.listMessages({ limit: 200 }).catch(() => []),
  ]);

  const pendingApts = appointments.filter((a) => a.status === 'pending').length;
  const confirmedApts = appointments.filter((a) => a.status === 'confirmed').length;
  const unreadMsgs = messages.filter((m) => !m.is_read).length;

  return (
    <div className="p-8 md:p-10 max-w-6xl">
      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold text-ink mb-2">Dashboard</h1>
        <p className="text-ink-muted">Overview of recent activity across the practice.</p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard
          tint="bg-tint-peach"
          iconColor="text-orange-500"
          icon={<AlertCircle className="w-6 h-6" />}
          value={pendingApts}
          label="Pending appointments"
          href="/admin/appointments?status=pending"
        />
        <StatCard
          tint="bg-tint-mint"
          iconColor="text-emerald-500"
          icon={<CheckCircle2 className="w-6 h-6" />}
          value={confirmedApts}
          label="Confirmed appointments"
          href="/admin/appointments?status=confirmed"
        />
        <StatCard
          tint="bg-tint-rose"
          iconColor="text-rose-500"
          icon={<MessageSquare className="w-6 h-6" />}
          value={unreadMsgs}
          label="Unread messages"
          href="/admin/messages"
        />
        <StatCard
          tint="bg-tint-sky"
          iconColor="text-clinical"
          icon={<CalendarClock className="w-6 h-6" />}
          value={appointments.length}
          label="Total appointments"
          href="/admin/appointments"
        />
      </div>

      <section className="grid lg:grid-cols-2 gap-6">
        <Panel
          title="Latest appointments"
          empty="No appointments yet"
          href="/admin/appointments"
          items={appointments.slice(0, 5).map((a) => ({
            primary: a.patient_name,
            secondary: `${a.preferred_date} · ${a.preferred_slot}`,
            badge: a.status,
            badgeTone: statusTone(a.status),
          }))}
        />
        <Panel
          title="Recent messages"
          empty="No messages yet"
          href="/admin/messages"
          items={messages.slice(0, 5).map((m) => ({
            primary: m.name,
            secondary: m.subject || m.message.slice(0, 60),
            badge: m.is_read ? 'read' : 'unread',
            badgeTone: m.is_read ? 'bg-paper-warm text-ink-muted' : 'bg-clinical-tint text-clinical',
          }))}
        />
      </section>
    </div>
  );
}

function statusTone(status: string) {
  switch (status) {
    case 'pending': return 'bg-tint-peach text-orange-600';
    case 'confirmed': return 'bg-tint-mint text-emerald-600';
    case 'completed': return 'bg-tint-sky text-clinical';
    case 'cancelled': return 'bg-coral/10 text-coral';
    case 'no_show': return 'bg-tint-lavender text-violet-600';
    default: return 'bg-paper-warm text-ink-muted';
  }
}

function StatCard({
  tint, iconColor, icon, value, label, href,
}: {
  tint: string; iconColor: string; icon: React.ReactNode; value: number; label: string; href: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-paper rounded-2xl p-6 card-shadow hover:card-shadow-lg hover:-translate-y-0.5 transition-all border border-sky-50"
    >
      <div className={`w-12 h-12 rounded-xl ${tint} ${iconColor} grid place-items-center mb-4`}>
        {icon}
      </div>
      <p className="text-3xl font-bold text-ink leading-none mb-1.5">{value}</p>
      <p className="text-xs text-ink-muted">{label}</p>
    </Link>
  );
}

function Panel({
  title, items, empty, href,
}: {
  title: string;
  items: { primary: string; secondary: string; badge: string; badgeTone: string }[];
  empty: string;
  href: string;
}) {
  return (
    <div className="bg-paper rounded-2xl p-6 card-shadow border border-sky-50">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
        <Link href={href} className="text-xs text-clinical font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
          View all <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-ink-subtle py-8 text-center">{empty}</p>
      ) : (
        <ul className="divide-y divide-sky-100">
          {items.map((it, i) => (
            <li key={i} className="py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink truncate">{it.primary}</p>
                <p className="text-xs text-ink-muted truncate">{it.secondary}</p>
              </div>
              <span className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full ${it.badgeTone}`}>
                {it.badge}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
