import Link from 'next/link';
import { Plus, Pencil, BookOpen } from 'lucide-react';
import { adminApi } from '@/lib/admin-api';
import { assetUrl } from '@/lib/cms';

export const dynamic = 'force-dynamic';

export default async function AdminBlogPage() {
  const items = await adminApi.listBlogPosts({ limit: 200 }).catch(() => []);

  return (
    <div className="p-8 md:p-10 max-w-7xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink mb-2">Blog Posts</h1>
          <p className="text-ink-muted">{items.length} post{items.length === 1 ? '' : 's'}</p>
        </div>
        <Link href="/admin/blog/new" className="btn-primary">
          <Plus className="w-4 h-4" /> New post
        </Link>
      </header>

      <div className="bg-paper rounded-2xl card-shadow border border-sky-50 overflow-hidden">
        {items.length === 0 ? (
          <p className="text-center text-ink-subtle py-16">No blog posts yet — click "New post".</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-paper-warm text-xs uppercase tracking-wider text-ink-muted">
                  <th className="text-left px-5 py-3 font-semibold">Cover</th>
                  <th className="text-left px-5 py-3 font-semibold">Title</th>
                  <th className="text-left px-5 py-3 font-semibold">Author</th>
                  <th className="text-left px-5 py-3 font-semibold">Views</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                  <th className="text-right px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100">
                {items.map((p) => {
                  const img = p.cover_image ? assetUrl(p.cover_image) : undefined;
                  return (
                    <tr key={p.id} className="hover:bg-paper-warm/40 transition-colors">
                      <td className="px-5 py-3 align-top">
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={img} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-tint-butter text-amber-600 grid place-items-center">
                            <BookOpen className="w-5 h-5" />
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3 align-top">
                        <p className="font-medium text-ink">{p.title}</p>
                        <p className="text-xs text-ink-muted">/{p.slug}</p>
                      </td>
                      <td className="px-5 py-3 align-top text-ink-soft">{p.author}</td>
                      <td className="px-5 py-3 align-top text-ink-soft">{p.view_count.toLocaleString()}</td>
                      <td className="px-5 py-3 align-top">
                        <span className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full ${
                          p.is_published
                            ? 'bg-tint-mint text-emerald-600'
                            : 'bg-paper-warm text-ink-muted'
                        }`}>
                          {p.is_published ? 'published' : 'draft'}
                        </span>
                      </td>
                      <td className="px-5 py-3 align-top text-right">
                        <Link
                          href={`/admin/blog/${p.id}`}
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
