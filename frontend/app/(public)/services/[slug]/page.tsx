import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, Phone } from 'lucide-react';
import { api } from '@/lib/api';
import { cms, FALLBACK_CHAMBERS, telHref } from '@/lib/cms';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';

export const revalidate = 600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const services = await api.getServices();
    return services.map((s) => ({ slug: s.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const s = await api.getService(slug);
    return {
      title: s.meta_title || s.title,
      description: s.meta_description || s.short_description,
      alternates: { canonical: `/services/${s.slug}` },
      openGraph: {
        title: s.meta_title || s.title,
        description: s.meta_description || s.short_description,
      },
    };
  } catch {
    return { title: 'Service not found' };
  }
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let service;
  try {
    service = await api.getService(slug);
  } catch {
    notFound();
  }

  const doctor = await cms.getDoctor();
  const phone = (doctor?.chambers?.length ? doctor.chambers : FALLBACK_CHAMBERS)[0].phones?.[0];

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: '/' },
          { name: 'Services', url: '/services' },
          { name: service.title, url: `/services/${service.slug}` },
        ]}
      />

      <article className="container-wide pt-20 pb-24 md:pt-28">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-ink-muted mb-12">
          <Link href="/" className="hover:text-ink">Home</Link>
          <span>/</span>
          <Link href="/services" className="hover:text-ink">Services</Link>
          <span>/</span>
          <span className="text-ink">{service.title}</span>
        </nav>

        <div className="grid md:grid-cols-12 gap-12">
          {/* Main content */}
          <div className="md:col-span-8">
            <p className="text-xs uppercase tracking-[0.2em] text-clinical mb-6">
              {service.category}
            </p>
            <h1 className="font-display text-display text-balance mb-10">
              {service.title}
            </h1>
            <p className="text-xl text-ink-muted max-w-2xl text-pretty leading-relaxed mb-12">
              {service.short_description}
            </p>

            <div
              className="prose prose-lg max-w-none
                         prose-headings:font-display prose-headings:text-ink
                         prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-5
                         prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4
                         prose-p:text-ink-soft prose-p:leading-relaxed
                         prose-li:text-ink-soft
                         prose-strong:text-ink
                         prose-a:text-clinical prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: service.full_content }}
            />
          </div>

          {/* CTA sidebar */}
          <aside className="md:col-span-4">
            <div className="md:sticky md:top-28 space-y-6 border border-ink/15 bg-paper-warm/50 p-8">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-ink-muted mb-3">
                  Considering treatment?
                </p>
                <p className="font-display text-2xl text-ink mb-4 text-balance">
                  Book a consultation with Dr. Mili.
                </p>
                <p className="text-sm text-ink-muted leading-relaxed mb-6">
                  Bring any recent test reports (ultrasound, blood tests, previous
                  prescriptions) and a list of your symptoms.
                </p>
              </div>

              <Link href="/appointment" className="btn-primary w-full">
                Book Appointment
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              {phone && (
                <a href={telHref(phone)} className="btn-secondary w-full">
                  <Phone className="w-4 h-4" /> {phone}
                </a>
              )}
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}
