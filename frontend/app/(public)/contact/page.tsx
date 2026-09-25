import type { Metadata } from 'next';
import { Phone, MapPin, Clock, Mail } from 'lucide-react';
import { ContactForm } from '@/components/ContactForm';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { cms, FALLBACK_CHAMBERS, chamberMapQuery, telHref } from '@/lib/cms';

export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Contact Prof. Dr. Maksuda Farida Akhtar (Mili)',
  description:
    'Get in touch with Dr. Mili at Central Hospital, Dhanmondi and Medilife Specialized Hospital, Mitford, Dhaka. Chamber phone numbers, hours, and location details.',
  alternates: { canonical: '/contact' },
};

export default async function ContactPage() {
  const doctor = await cms.getDoctor();
  const chambers = doctor?.chambers?.length ? doctor.chambers : FALLBACK_CHAMBERS;
  const mapQuery = encodeURIComponent(chamberMapQuery(chambers[0]));

  return (
    <>
      <BreadcrumbSchema
        items={[{ name: 'Home', url: '/' }, { name: 'Contact', url: '/contact' }]}
      />

      <section className="container-wide pt-20 pb-12 md:pt-28">
        <p className="pill mb-8">Get in touch</p>
        <h1 className="font-display text-hero text-balance max-w-4xl mb-10">
          We're <em className="text-clinical not-italic">here to help.</em>
        </h1>
        <p className="text-xl text-ink-muted max-w-2xl text-pretty leading-relaxed">
          Questions about treatments, follow-ups, or general inquiries — send us a
          message and we'll respond within 1–2 business days.
        </p>
      </section>

      <section className="container-wide pb-32">
        <div className="grid md:grid-cols-12 gap-12">
          {/* Contact info — left */}
          <div className="md:col-span-5 space-y-10">
            {chambers.map((chamber) => (
              <div key={chamber.name}>
                <p className="text-xs uppercase tracking-[0.2em] text-ink-muted mb-5">Chamber</p>
                <div className="space-y-5">
                  <div className="flex gap-4">
                    <MapPin className="w-6 h-6 text-clinical flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-display text-2xl text-ink mb-2">{chamber.name}</p>
                      <p className="text-ink-muted leading-relaxed">{chamber.address}</p>
                    </div>
                  </div>
                  {chamber.hours && (
                    <div className="flex gap-4">
                      <Clock className="w-6 h-6 text-clinical flex-shrink-0 mt-1" />
                      <p className="text-ink-muted leading-relaxed">{chamber.hours}</p>
                    </div>
                  )}
                  {chamber.phones?.length > 0 && (
                    <div className="flex gap-4">
                      <Phone className="w-6 h-6 text-clinical flex-shrink-0 mt-1" />
                      <div className="space-y-1">
                        {chamber.phones.map((phone) => (
                          <a key={phone} href={telHref(phone)} className="block text-lg text-ink hover:text-clinical">
                            {phone}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Map */}
            <div>
              <div className="border border-ink/15 overflow-hidden aspect-[4/3]">
                <iframe
                  title={`${chambers[0].name} location map`}
                  src={`https://www.google.com/maps?q=${mapQuery}&z=16&output=embed`}
                  className="w-full h-full"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-link text-clinical text-sm mt-3 inline-flex items-center gap-1.5"
              >
                <MapPin className="w-4 h-4" /> Open in Google Maps
              </a>
            </div>
          </div>

          {/* Form — right */}
          <div className="md:col-span-7">
            <div className="border border-ink/10 bg-paper p-8 md:p-12">
              <h2 className="font-display text-3xl mb-3">Send a message</h2>
              <p className="text-ink-muted mb-8 text-sm">
                For appointment bookings, please use the{' '}
                <a href="/appointment" className="text-clinical underline-link">appointment form</a> instead.
              </p>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
