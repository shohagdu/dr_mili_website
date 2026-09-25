import { adminApi } from '@/lib/admin-api';
import { SettingsForm } from '@/components/admin/SettingsForm';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const settings = await adminApi.getSettings().catch(() => ({}));

  return (
    <div className="p-8 md:p-10 max-w-5xl">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink mb-2">Site Settings</h1>
        <p className="text-ink-muted">
          Key/value pairs used throughout the public site (e.g. contact email, phone, social URLs).
        </p>
      </header>

      <SettingsForm initial={settings} />
    </div>
  );
}
