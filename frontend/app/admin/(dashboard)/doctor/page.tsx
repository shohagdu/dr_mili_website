import { adminApi } from '@/lib/admin-api';
import { DoctorForm } from '@/components/admin/DoctorForm';

export const dynamic = 'force-dynamic';

export default async function AdminDoctorPage() {
  const doctor = await adminApi.getDoctor();

  return (
    <div className="p-8 md:p-10 max-w-5xl">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink mb-2">Doctor Profile</h1>
        <p className="text-ink-muted">
          Editing this profile updates the public site (Header, Footer, Hero, About page, JSON-LD schema).
        </p>
      </header>

      <DoctorForm doctor={doctor} />
    </div>
  );
}
