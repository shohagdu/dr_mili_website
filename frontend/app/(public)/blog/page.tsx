import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Patient Education Articles — Women\'s Health Insights',
  description:
    'Evidence-based articles on pregnancy, infertility, PCOS, menstrual health, menopause, and gynecological surgery — written by Prof. Dr. Maksuda Farida Akhtar (Mili).',
  alternates: { canonical: '/blog' },
};

function formatDate(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function BlogPage() {
  const posts = await api.getBlogPosts(50).catch(() => []);

  return (
    <>
      <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Articles', url: '/blog' }]} />

      <section className="container-wide pt-20 pb-16 md:pt-28">
        <p className="pill mb-8">Articles &amp; insights</p>
        <h1 className="font-display text-hero text-balance max-w-4xl mb-10">
          Patient education,<br /><em className="text-clinical not-italic">written by a gynecologist.</em>
        </h1>
        <p className="text-xl text-ink-muted max-w-2xl text-pretty leading-relaxed">
          Practical, evidence-based articles on pregnancy, fertility, PCOS,
          menstrual health, and menopause — to help you make informed decisions.
        </p>
      </section>

      <section className="container-wide pb-32">
        {posts.length === 0 ? (
          <p className="text-center text-ink-muted py-20">
            New articles coming soon. Check back shortly.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {posts.map((p) => (
              <Link
                key={p.id}
                href={`/blog/${p.slug}`}
                className="group flex flex-col border border-ink/10 bg-paper hover:bg-paper-warm/50 transition-colors p-8"
              >
                <div className="flex items-center gap-4 text-xs text-ink-muted mb-6 uppercase tracking-[0.15em]">
                  <span>{formatDate(p.published_at)}</span>
                  {p.reading_time_minutes && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {p.reading_time_minutes} min
                    </span>
                  )}
                </div>
                <h2 className="font-display text-2xl mb-4 group-hover:text-clinical transition-colors text-balance">
                  {p.title}
                </h2>
                <p className="text-ink-muted text-sm leading-relaxed flex-1 text-pretty">
                  {p.excerpt}
                </p>
                <span className="mt-6 inline-flex items-center gap-1 text-sm text-clinical">
                  Read article
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
