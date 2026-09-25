import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BlogPostForm } from '@/components/admin/BlogPostForm';

export default function NewBlogPostPage() {
  return (
    <div className="p-8 md:p-10 max-w-5xl">
      <Link
        href="/admin/blog"
        className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-clinical mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to blog
      </Link>

      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink mb-2">New Blog Post</h1>
      </header>

      <BlogPostForm mode="create" />
    </div>
  );
}
