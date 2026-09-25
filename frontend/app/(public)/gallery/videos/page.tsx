import type { Metadata } from 'next';
import { Video as VideoIcon } from 'lucide-react';
import { cms, videoEmbedUrl, CONTENT_TYPE } from '@/lib/cms';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Video Gallery',
  description: 'Watch educational videos and patient guidance from the clinic.',
};

export default async function VideoGalleryPage() {
  const videos = await cms.getContent(CONTENT_TYPE.VIDEO);

  return (
    <section className="container-wide py-16 md:py-24">
      <div className="text-center mb-12 max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-clinical font-semibold mb-3">Gallery</p>
        <h1 className="font-display text-display font-bold text-ink text-balance">Video Gallery</h1>
        <p className="mt-4 text-ink-muted leading-relaxed">
          Educational videos, procedure explainers, and patient guidance.
        </p>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-20 text-ink-subtle">
          <VideoIcon className="w-12 h-12 mx-auto mb-4 text-ink-subtle/50" />
          <p>No videos have been added yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((v) => {
            const src = videoEmbedUrl(v.file_path);
            return (
              <figure
                key={v.id}
                className="bg-paper rounded-2xl overflow-hidden card-shadow border border-sky-50"
              >
                <div className="aspect-video bg-ink/5">
                  {src ? (
                    <iframe
                      src={src}
                      title={v.title}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-ink-subtle">
                      <VideoIcon className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <figcaption className="p-5">
                  <h2 className="font-display text-lg font-semibold text-ink">{v.title}</h2>
                  {v.short_description && (
                    <p className="mt-2 text-sm text-ink-muted leading-relaxed line-clamp-3">
                      {v.short_description}
                    </p>
                  )}
                </figcaption>
              </figure>
            );
          })}
        </div>
      )}
    </section>
  );
}
