import type { Metadata } from 'next';
import Image from 'next/image';
import { Image as ImageIcon } from 'lucide-react';
import { cms, assetUrl, CONTENT_TYPE } from '@/lib/cms';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Image Gallery',
  description: 'Photos from the clinic, facilities, and patient care.',
};

export default async function ImageGalleryPage() {
  const pictures = await cms.getContent(CONTENT_TYPE.PICTURE);

  return (
    <section className="container-wide py-16 md:py-24">
      <div className="text-center mb-12 max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-clinical font-semibold mb-3">Gallery</p>
        <h1 className="font-display text-display font-bold text-ink text-balance">Image Gallery</h1>
        <p className="mt-4 text-ink-muted leading-relaxed">
          A look at the clinic, facilities, and moments of care.
        </p>
      </div>

      {pictures.length === 0 ? (
        <div className="text-center py-20 text-ink-subtle">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-ink-subtle/50" />
          <p>No images have been added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {pictures.map((p) => {
            const src = assetUrl(p.file_path);
            if (!src) return null;
            return (
              <figure
                key={p.id}
                className="group relative aspect-square rounded-2xl overflow-hidden card-shadow border border-sky-50 bg-ink/5"
              >
                <Image
                  src={src}
                  alt={p.title}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {p.title && (
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-4 pt-10 text-sm font-medium text-paper opacity-0 group-hover:opacity-100 transition-opacity">
                    {p.title}
                  </figcaption>
                )}
              </figure>
            );
          })}
        </div>
      )}
    </section>
  );
}
