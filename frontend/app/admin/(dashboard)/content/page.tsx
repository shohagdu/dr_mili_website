import Link from 'next/link';
import { Plus, Pencil, Image as ImageIcon, Video, Sparkles, Info, LayoutTemplate } from 'lucide-react';
import { adminApi } from '@/lib/admin-api';
import { assetUrl } from '@/lib/cms';

export const dynamic = 'force-dynamic';

const TYPE_FILTERS = [
  { value: 9, label: 'Homepage Hero', icon: LayoutTemplate },
  { value: 1, label: 'Why Choose', icon: Sparkles },
  { value: 2, label: 'About', icon: Info },
  { value: 7, label: 'Pictures', icon: ImageIcon },
  { value: 8, label: 'Videos', icon: Video },
] as const;

const TYPE_LABEL: Record<number, string> = {
  1: 'Why Choose',
  2: 'About',
  3: 'Service',
  4: 'Emergency Service',
  5: 'FAQ',
  6: 'Testimonial',
  7: 'Picture',
  8: 'Video',
  9: 'Homepage Hero Section',
};

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const typeParam = type ? Number(type) : undefined;
  const items = await adminApi.listContent({ type: typeParam, limit: 200 }).catch(() => []);

  return (
    <div className="p-8 md:p-10 max-w-7xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink mb-2">Site Content</h1>
          <p className="text-ink-muted">{items.length} item{items.length === 1 ? '' : 's'}</p>
        </div>
        <Link
          href={`/admin/content/new${typeParam ? `?type=${typeParam}` : ''}`}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" /> New content
        </Link>
      </header>

      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/admin/content"
          className={`text-xs font-medium px-4 py-2 rounded-full border transition-colors ${
            !typeParam
              ? 'bg-clinical text-paper border-clinical'
              : 'bg-paper text-ink-soft border-sky-200 hover:border-clinical hover:text-clinical'
          }`}
        >
          All
        </Link>
        {TYPE_FILTERS.map((f) => {
          const active = typeParam === f.value;
          return (
            <Link
              key={f.value}
              href={`/admin/content?type=${f.value}`}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full border transition-colors ${
                active
                  ? 'bg-clinical text-paper border-clinical'
                  : 'bg-paper text-ink-soft border-sky-200 hover:border-clinical hover:text-clinical'
              }`}
            >
              <f.icon className="w-3.5 h-3.5" /> {f.label}
            </Link>
          );
        })}
      </div>

      <div className="bg-paper rounded-2xl card-shadow border border-sky-50 overflow-hidden">
        {items.length === 0 ? (
          <p className="text-center text-ink-subtle py-16">No content yet — click "New content".</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-paper-warm text-xs uppercase tracking-wider text-ink-muted">
                  <th className="text-left px-5 py-3 font-semibold">Preview</th>
                  <th className="text-left px-5 py-3 font-semibold">Title</th>
                  <th className="text-left px-5 py-3 font-semibold">Type</th>
                  <th className="text-left px-5 py-3 font-semibold">Position</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                  <th className="text-right px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100">
                {items.map((c) => {
                  const img = c.type === 7 || c.type === 9 ? assetUrl(c.file_path) : undefined;
                  return (
                    <tr key={c.id} className="hover:bg-paper-warm/40 transition-colors">
                      <td className="px-5 py-3 align-top">
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={img} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        ) : c.type === 8 ? (
                          <div className="w-12 h-12 rounded-lg bg-tint-lavender text-violet-500 grid place-items-center">
                            <Video className="w-5 h-5" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-clinical-tint text-clinical grid place-items-center">
                            <Sparkles className="w-5 h-5" />
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3 align-top">
                        <p className="font-medium text-ink">{c.title}</p>
                        {c.short_description && (
                          <p className="text-xs text-ink-muted line-clamp-1 max-w-md">{c.short_description}</p>
                        )}
                      </td>
                      <td className="px-5 py-3 align-top text-ink-soft">{TYPE_LABEL[c.type] || `Type ${c.type}`}</td>
                      <td className="px-5 py-3 align-top text-ink-soft">{c.display_position}</td>
                      <td className="px-5 py-3 align-top">
                        <span className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full ${
                          c.is_active === 1
                            ? 'bg-tint-mint text-emerald-600'
                            : 'bg-paper-warm text-ink-muted'
                        }`}>
                          {c.is_active === 1 ? 'active' : c.is_active === 2 ? 'inactive' : 'deleted'}
                        </span>
                        {c.is_highlight_item === 1 && (
                          <span className="ml-2 text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-tint-butter text-amber-700">
                            highlight
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 align-top text-right">
                        <Link
                          href={`/admin/content/${c.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-clinical hover:gap-2 transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
