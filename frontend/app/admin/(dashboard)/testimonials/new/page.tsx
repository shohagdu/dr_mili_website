import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { TestimonialForm } from '@/components/admin/TestimonialForm';

export default function NewTestimonialPage() {
  return (
    <div className="p-8 md:p-10 max-w-5xl">
      <Link
        href="/admin/testimonials"
        className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-clinical mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to testimonials
      </Link>

      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink mb-2">New Testimonial</h1>
      </header>

      <TestimonialForm mode="create" />
    </div>
  );
}
