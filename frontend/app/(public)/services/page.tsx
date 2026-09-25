import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { api } from '@/lib/api';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';

export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Gynecology Services — Infertility, Pregnancy Care, PCOS, Laparoscopic Surgery',
  description:
    'Complete gynecology and obstetrics services in Dhaka: infertility and IVF/IUI, pregnancy care and delivery, PCOS, endometriosis, menopause care, and laparoscopic surgery by Prof. Dr. Maksuda Farida Akhtar (Mili).',
  alternates: { canonical: '/services' },
};

export default async function ServicesPage() {
  const services = await api.getServices().catch(() => []);

  return (
    <>
      <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }]} />

      <section className="container-wide pt-20 pb-16 md:pt-28">
        <p className="pill mb-8">Our services</p>
        <h1 className="font-display text-hero text-balance max-w-4xl mb-10">
          Comprehensive <em className="text-clinical not-italic">gynecological care</em>{' '}
          for every stage.
        </h1>
        <p className="text-xl text-ink-muted max-w-2xl text-pretty leading-relaxed">
          From routine check-ups and pregnancy care to infertility treatment and
          laparoscopic surgery, Dr. Mili offers a full spectrum of gynecology and
          obstetrics services using modern, minimally invasive techniques.
        </p>
      </section>

      <section className="container-wide pb-32">
        <div className="grid md:grid-cols-2 gap-px bg-ink/10 border border-ink/10">
          {services.map((s, idx) => (
            <Link
              key={s.id}
              href={`/services/${s.slug}`}
              className="group bg-paper hover:bg-paper-warm p-10 md:p-12 transition-colors flex flex-col justify-between min-h-[280px]"
            >
              <div>
                <div className="flex items-start justify-between mb-8">
                  <span className="text-xs uppercase tracking-[0.2em] text-clinical">
                    {String(idx + 1).padStart(2, '0')} · {s.category}
                  </span>
                  <ArrowUpRight className="w-5 h-5 text-ink-subtle group-hover:text-clinical group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </div>
                <h2 className="font-display text-3xl mb-5 group-hover:text-clinical transition-colors text-balance">
                  {s.title}
                </h2>
                <p className="text-ink-muted leading-relaxed text-pretty">
                  {s.short_description}
                </p>
              </div>
              <span className="mt-8 text-sm text-clinical underline-link self-start">
                Read more
              </span>
            </Link>
          ))}
        </div>

        {services.length === 0 && (
          <p className="text-center text-ink-muted py-20">
            Services will appear here once the backend is running.
          </p>
        )}
      </section>
    </>
  );
}
