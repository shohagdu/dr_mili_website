import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ServiceForm } from '@/components/admin/ServiceForm';

export default function NewServicePage() {
  return (
    <div className="p-8 md:p-10 max-w-5xl">
      <Link
        href="/admin/services"
        className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-clinical mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to services
      </Link>

      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink mb-2">New Service</h1>
        <p className="text-ink-muted">Create a new service that appears on the public site.</p>
      </header>

      <ServiceForm mode="create" />
    </div>
  );
}
