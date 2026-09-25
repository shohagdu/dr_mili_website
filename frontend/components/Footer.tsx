import Link from 'next/link';
import { Phone, MapPin, Clock, Stethoscope, Mail, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import type { PublicDoctor } from '@/lib/cms';

const SOCIALS: { key: keyof PublicDoctor; icon: typeof Facebook; label: string }[] = [
  { key: 'facebook', icon: Facebook, label: 'Facebook' },
  { key: 'twitter', icon: Twitter, label: 'Twitter' },
  { key: 'instagram', icon: Instagram, label: 'Instagram' },
  { key: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
  { key: 'youtube', icon: Youtube, label: 'YouTube' },
];

function shortName(full: string): string {
  const parts = full.trim().split(/\s+/);
  const last = parts[parts.length - 1].replace(/^\(|\)$/g, '');
  return /^(Prof\.?|Dr\.?)/i.test(parts[0]) ? `Dr. ${last}` : full;
}

export function Footer({ doctor }: { doctor: PublicDoctor | null }) {
  const name = doctor?.slug_name || (doctor?.name ? shortName(doctor.name) : 'Dr. Mili');
  const qualifications = doctor?.qualifications ?? 'MBBS · FCPS (Gynecology & Obstetrics)';
  const bio = doctor?.doctor_profile ??
    'Compassionate gynecological care with 20+ years of clinical experience.';
  const chambers = doctor?.chambers ?? [];
  const email = doctor?.email;

  return (
    <footer className="relative z-10 mt-12 bg-gradient-to-br from-clinical-deep via-clinical-dark to-clinical text-paper">
      <div className="container-wide py-20">
        <div className="grid md:grid-cols-12 gap-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <Link href="/" className="inline-flex items-center gap-3 mb-5">
              <span className="w-11 h-11 rounded-xl bg-paper text-clinical grid place-items-center">
                <Stethoscope className="w-5 h-5" />
              </span>
              <span className="font-display text-2xl font-bold tracking-tight">{name}</span>
            </Link>
            <p className="text-xs uppercase tracking-[0.18em] text-paper/60 mb-5">{qualifications}</p>
            <p className="text-paper/80 text-pretty max-w-md leading-relaxed line-clamp-4">{bio}</p>

            {/* Socials */}
            <div className="mt-6 flex flex-wrap gap-3">
              {SOCIALS.map(({ key, icon: Icon, label }) => {
                const href = doctor?.[key] as string | undefined | null;
                if (!href) return null;
                return (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 rounded-full bg-paper/10 hover:bg-paper hover:text-clinical grid place-items-center transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick links */}
          <div className="md:col-span-3">
            <h4 className="text-sm uppercase tracking-[0.2em] text-paper/60 mb-5 font-semibold">Sitemap</h4>
            <ul className="space-y-3 text-paper/85">
              <li><Link href="/about" className="hover:text-paper transition-colors">About</Link></li>
              <li><Link href="/services" className="hover:text-paper transition-colors">Services</Link></li>
              <li><Link href="/blog" className="hover:text-paper transition-colors">Articles</Link></li>
              <li><Link href="/gallery/videos" className="hover:text-paper transition-colors">Video Gallery</Link></li>
              <li><Link href="/gallery/images" className="hover:text-paper transition-colors">Image Gallery</Link></li>
              <li><Link href="/appointment" className="hover:text-paper transition-colors">Book Appointment</Link></li>
              <li><Link href="/contact" className="hover:text-paper transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Chambers */}
          <div className="md:col-span-4">
            <h4 className="text-sm uppercase tracking-[0.2em] text-paper/60 mb-5 font-semibold">
              {chambers.length > 1 ? 'Chambers' : 'Chamber'}
            </h4>
            <div className="space-y-6 text-paper/85">
              {chambers.length === 0 && email ? (
                <div className="flex gap-3">
                  <Mail className="w-5 h-5 flex-shrink-0 mt-0.5 text-accent-light" />
                  <a href={`mailto:${email}`} className="text-sm hover:text-paper transition-colors">{email}</a>
                </div>
              ) : null}

              {chambers.map((c, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex gap-3">
                    <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5 text-accent-light" />
                    <div>
                      <p className="font-semibold text-paper">{c.name}</p>
                      <p className="text-sm text-paper/75 whitespace-pre-line">{c.address}</p>
                    </div>
                  </div>
                  {c.phones?.length > 0 && (
                    <div className="flex gap-3">
                      <Phone className="w-5 h-5 flex-shrink-0 mt-0.5 text-accent-light" />
                      <div className="text-sm space-y-1">
                        {c.phones.map((p) => (
                          <a key={p} href={`tel:${p.replace(/\s+/g, '')}`} className="block hover:text-paper transition-colors">{p}</a>
                        ))}
                      </div>
                    </div>
                  )}
                  {c.hours && (
                    <div className="flex gap-3">
                      <Clock className="w-5 h-5 flex-shrink-0 mt-0.5 text-accent-light" />
                      <p className="text-sm">{c.hours}</p>
                    </div>
                  )}
                </div>
              ))}

              {email && chambers.length > 0 && (
                <div className="flex gap-3 pt-2">
                  <Mail className="w-5 h-5 flex-shrink-0 mt-0.5 text-accent-light" />
                  <a href={`mailto:${email}`} className="text-sm hover:text-paper transition-colors">{email}</a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-paper/15 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs text-paper/60">
          <p>© {new Date().getFullYear()} {doctor?.name ?? 'Prof. Dr. Maksuda Farida Akhtar (Mili)'}. All rights reserved.</p>
          <p>
            Design &amp; developed by{' '}
            <a
              href="https://shohozit.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-paper/80 underline hover:text-paper transition-colors"
            >
              shohozit.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
