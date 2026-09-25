'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, CalendarClock, MessageSquare, LogOut, Stethoscope, UserRound, FileText, Sparkles, Quote, BookOpen, Settings, Palette } from 'lucide-react';
import { withBasePath } from '@/lib/base-path';

const NAV = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Appointments', href: '/admin/appointments', icon: CalendarClock },
  { label: 'Messages', href: '/admin/messages', icon: MessageSquare },
  { label: 'Doctor Profile', href: '/admin/doctor', icon: UserRound },
  { label: 'Site Content', href: '/admin/content', icon: FileText },
  { label: 'Services', href: '/admin/services', icon: Sparkles },
  { label: 'Testimonials', href: '/admin/testimonials', icon: Quote },
  { label: 'Blog Posts', href: '/admin/blog', icon: BookOpen },
  { label: 'Theme', href: '/admin/theme', icon: Palette },
  { label: 'Site Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch(withBasePath('/api/auth/logout'), { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <aside className="w-64 bg-paper border-r border-sky-100 flex flex-col">
      <div className="h-20 flex items-center px-6 border-b border-sky-100">
        <Link href="/admin" className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-clinical text-paper grid place-items-center">
            <Stethoscope className="w-5 h-5" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display text-base font-semibold text-ink">Admin Panel</span>
            <span className="text-[10px] uppercase tracking-[0.15em] text-ink-muted">Dr. Mili</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {NAV.map((n) => {
          const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-clinical-tint text-clinical'
                  : 'text-ink-soft hover:bg-paper-warm hover:text-clinical'
              }`}
            >
              <n.icon className="w-4 h-4" />
              {n.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sky-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-ink-soft hover:bg-coral/10 hover:text-coral transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
