import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { adminApi } from '@/lib/admin-api';
import { TestimonialForm } from '@/components/admin/TestimonialForm';

export const dynamic = 'force-dynamic';

export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isFinite(id)) notFound();

  const testimonial = await adminApi.getTestimonial(id).catch(() => null);
  if (!testimonial) notFound();

  return (
    <div className="p-8 md:p-10 max-w-5xl">
      <Link
        href="/admin/testimonials"
        className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-clinical mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to testimonials
      </Link>

      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink mb-2">Edit Testimonial</h1>
        <p className="text-ink-muted">{testimonial.patient_name}</p>
      </header>

      <TestimonialForm mode="edit" initial={testimonial} />
    </div>
  );
}
