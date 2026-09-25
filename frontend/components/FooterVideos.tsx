import Link from 'next/link';
import { ArrowUpRight, PlayCircle } from 'lucide-react';
import { videoEmbedUrl, type PublicContent } from '@/lib/cms';

/**
 * Video band shown directly above the site footer. Renders the most recent
 * video as a feature, with a link to the full video gallery. Hidden entirely
 * when no videos are configured.
 */
export function FooterVideos({ videos }: { videos: PublicContent[] }) {
  const featured = videos[0];
  if (!featured) return null;

  const src = videoEmbedUrl(featured.file_path);

  return (
    <section className="bg-paper-warm border-t border-sky-100 py-16 md:py-20">
      <div className="container-wide grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-clinical font-semibold mb-3">
            <PlayCircle className="w-4 h-4" /> Watch &amp; learn
          </p>
          <h2 className="font-display text-display font-bold text-ink text-balance mb-4">
            {featured.title}
          </h2>
          {featured.short_description && (
            <p className="text-ink-muted leading-relaxed text-pretty mb-8 line-clamp-4">
              {featured.short_description}
            </p>
          )}
          <Link href="/gallery/videos" className="btn-primary">
            View all videos
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="aspect-video rounded-3xl overflow-hidden card-shadow-lg bg-ink/5">
          {src ? (
            <iframe
              src={src}
              title={featured.title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-ink-subtle">
              <PlayCircle className="w-12 h-12" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
