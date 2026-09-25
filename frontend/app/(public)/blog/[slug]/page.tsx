import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import { api } from '@/lib/api';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const posts = await api.getBlogPosts(100);
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const post = await api.getBlogPost(slug);
    return {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      alternates: { canonical: `/blog/${post.slug}` },
      openGraph: {
        type: 'article',
        title: post.meta_title || post.title,
        description: post.meta_description || post.excerpt,
        publishedTime: post.published_at,
        authors: [post.author],
      },
    };
  } catch {
    return { title: 'Article not found' };
  }
}

function formatDate(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  let post;
  try {
    post = await api.getBlogPost(slug);
  } catch {
    notFound();
  }

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://drtapan.com';

  // Article JSON-LD
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalScholarlyArticle',
    headline: post.title,
    description: post.excerpt,
    author: {
      '@type': 'Physician',
      name: post.author,
      url: `${SITE_URL}/about`,
    },
    datePublished: post.published_at,
    publisher: {
      '@type': 'Person',
      name: 'Prof. Dr. Maksuda Farida Akhtar (Mili)',
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: '/' },
          { name: 'Articles', url: '/blog' },
          { name: post.title, url: `/blog/${post.slug}` },
        ]}
      />

      <article className="container-prose pt-20 pb-24 md:pt-28">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink mb-12"
        >
          <ArrowLeft className="w-4 h-4" /> All articles
        </Link>

        <header className="mb-16">
          <div className="flex flex-wrap items-center gap-5 text-xs uppercase tracking-[0.15em] text-ink-muted mb-8">
            {post.published_at && (
              <span className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                {formatDate(post.published_at)}
              </span>
            )}
            {post.reading_time_minutes && (
              <span className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                {post.reading_time_minutes} min read
              </span>
            )}
            <span>By {post.author}</span>
          </div>
          <h1 className="font-display text-display text-balance leading-tight mb-8">
            {post.title}
          </h1>
          <p className="text-xl text-ink-muted text-pretty leading-relaxed">
            {post.excerpt}
          </p>
        </header>

        <div
          className="prose prose-lg max-w-none
                     prose-headings:font-display prose-headings:text-ink
                     prose-h2:text-3xl prose-h2:mt-14 prose-h2:mb-5
                     prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4
                     prose-p:text-ink-soft prose-p:leading-relaxed
                     prose-li:text-ink-soft
                     prose-strong:text-ink
                     prose-a:text-clinical"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-20 pt-10 border-t border-ink/10">
          <p className="text-sm text-ink-muted mb-4">Have a related concern?</p>
          <Link href="/appointment" className="btn-primary">
            Book an Appointment with Dr. Mili
          </Link>
        </div>
      </article>
    </>
  );
}
