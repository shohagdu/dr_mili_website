import { adminApi } from '@/lib/admin-api';
import { ThemeEditor } from '@/components/admin/ThemeEditor';

export const dynamic = 'force-dynamic';

export default async function AdminThemePage() {
  const [presetsResp, active] = await Promise.all([
    adminApi.getThemePresets().catch(() => ({ active_slug: '', presets: [] })),
    adminApi.getActiveTheme().catch(() => null),
  ]);

  return (
    <div className="p-8 md:p-10 max-w-5xl">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink mb-2">Theme</h1>
        <p className="text-ink-muted">
          Pick a preset look or fine-tune individual colours. Changes apply to the
          whole public site within a minute (or instantly after a refresh).
        </p>
      </header>

      <ThemeEditor
        presets={presetsResp.presets}
        activeSlug={presetsResp.active_slug}
        active={active}
      />
    </div>
  );
}
