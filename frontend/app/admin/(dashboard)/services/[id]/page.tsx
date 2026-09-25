import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { adminApi } from '@/lib/admin-api';
import { ServiceForm } from '@/components/admin/ServiceForm';

export const dynamic = 'force-dynamic';

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isFinite(id)) notFound();

  const service = await adminApi.getService(id).catch(() => null);
  if (!service) notFound();

  return (
    <div className="p-8 md:p-10 max-w-5xl">
      <Link
        href="/admin/services"
        className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-clinical mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to services
      </Link>

      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink mb-2">Edit Service</h1>
        <p className="text-ink-muted">{service.title}</p>
      </header>

      <ServiceForm mode="edit" initial={service} />
    </div>
  );
}
