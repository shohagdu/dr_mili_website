import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ContentForm } from '@/components/admin/ContentForm';

export default async function NewContentPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const initialType = type ? Number(type) : 1;

  return (
    <div className="p-8 md:p-10 max-w-5xl">
      <Link
        href="/admin/content"
        className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-clinical mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to content
      </Link>

      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink mb-2">New Content</h1>
        <p className="text-ink-muted">Create a new item that appears on the public site.</p>
      </header>

      <ContentForm mode="create" initialType={initialType} />
    </div>
  );
}
