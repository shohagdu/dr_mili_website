'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Phone, Stethoscope, ChevronDown } from 'lucide-react';
import type { PublicDoctor } from '@/lib/cms';

type NavItem = {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
};

const NAV: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Articles', href: '/blog' },
  {
    label: 'Gallery',
    children: [
      { label: 'Video', href: '/gallery/videos' },
      { label: 'Image', href: '/gallery/images' },
    ],
  },
  { label: 'Contact', href: '/contact' },
];

function shortName(full: string): string {
  // "Prof. Dr. Maksuda Farida Akhtar (Mili)" → "Dr. Mili" (last word, with Dr. prefix)
  const parts = full.trim().split(/\s+/);
  const last = parts[parts.length - 1].replace(/^\(|\)$/g, '');
  return /^(Prof\.?|Dr\.?)/i.test(parts[0]) ? `Dr. ${last}` : full;
}

export function Header({ doctor }: { doctor: PublicDoctor | null }) {
  const [open, setOpen] = useState(false);
  const name = doctor?.slug_name || (doctor?.name ? shortName(doctor.name) : 'Dr. Mili');
  const qualifications = doctor?.qualifications ?? 'MBBS · FCPS (Gynecology & Obstetrics)';
  const phone = doctor?.mobile;

  return (
    <header className="sticky top-0 z-50 bg-paper/90 backdrop-blur-md border-b border-sky-100">
      <div className="container-wide flex items-center justify-between h-20">
        <Link href="/" className="group flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-clinical text-paper grid place-items-center shadow-[0_8px_20px_-6px_rgba(45,91,255,0.5)]">
            <Stethoscope className="w-5 h-5" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display text-lg font-semibold text-ink tracking-tight">{name}</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-ink-muted">{qualifications}</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV.map((n) =>
            n.children ? (
              <div key={n.label} className="relative group">
                <button
                  type="button"
                  className="flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-clinical transition-colors"
                >
                  {n.label}
                  <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute left-0 top-full pt-3 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all">
                  <div className="min-w-[10rem] rounded-xl bg-paper border border-sky-100 card-shadow-lg py-2">
                    {n.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className="block px-4 py-2 text-sm font-medium text-ink-soft hover:text-clinical hover:bg-paper-warm transition-colors"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={n.href}
                href={n.href!}
                className="text-sm font-medium text-ink-soft hover:text-clinical transition-colors"
              >
                {n.label}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {phone && (
            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              className="flex items-center gap-2 text-sm text-ink-soft hover:text-clinical transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden lg:inline">{phone}</span>
            </a>
          )}
          <Link href="/appointment" className="btn-primary text-sm py-2.5 px-5">
            Book Appointment
          </Link>
        </div>

        <button
          className="md:hidden p-2 -mr-2 text-ink"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-sky-100 bg-paper">
          <div className="container-wide py-6 flex flex-col gap-4">
            {NAV.map((n) =>
              n.children ? (
                <div key={n.label} className="flex flex-col gap-2">
                  <span className="text-lg font-medium text-ink py-2">{n.label}</span>
                  <div className="flex flex-col gap-2 pl-4 border-l-2 border-sky-100">
                    {n.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        onClick={() => setOpen(false)}
                        className="text-base font-medium text-ink-soft py-1"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={n.href}
                  href={n.href!}
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium text-ink-soft py-2"
                >
                  {n.label}
                </Link>
              ),
            )}
            <Link
              href="/appointment"
              onClick={() => setOpen(false)}
              className="btn-primary mt-2"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
