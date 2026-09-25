import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="container-wide py-32 md:py-40 text-center">
      <p className="font-display text-[12rem] md:text-[16rem] leading-none text-clinical/15">
        404
      </p>
      <h1 className="font-display text-display text-balance max-w-2xl mx-auto -mt-12 md:-mt-20 mb-8">
        The page you're looking for isn't here.
      </h1>
      <p className="text-lg text-ink-muted max-w-md mx-auto mb-12 text-pretty">
        It may have moved, or the link might be incorrect. Try heading back to the homepage.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/" className="btn-primary">
          <Home className="w-4 h-4" /> Back to homepage
        </Link>
        <Link href="/services" className="btn-secondary">
          <ArrowLeft className="w-4 h-4" /> Browse services
        </Link>
      </div>
    </section>
  );
}
