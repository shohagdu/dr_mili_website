import type { Metadata } from 'next';
import { Phone, MapPin, Clock } from 'lucide-react';
import { AppointmentForm } from '@/components/AppointmentForm';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { cms, FALLBACK_CHAMBERS, telHref } from '@/lib/cms';

export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Book an Appointment with Prof. Dr. Maksuda Farida Akhtar (Mili)',
  description:
    'Request an appointment online with Dr. Mili, gynecologist, obstetrician and infertility specialist at Central Hospital, Dhanmondi and Medilife Specialized Hospital, Mitford, Dhaka.',
  alternates: { canonical: '/appointment' },
};

export default async function AppointmentPage() {
  const doctor = await cms.getDoctor();
  const chambers = doctor?.chambers?.length ? doctor.chambers : FALLBACK_CHAMBERS;
  const mainPhone = chambers[0].phones?.[0];

  return (
    <>
      <BreadcrumbSchema
        items={[{ name: 'Home', url: '/' }, { name: 'Appointment', url: '/appointment' }]}
      />

      <section className="container-wide pt-20 pb-12 md:pt-28">
        <p className="pill mb-8">Book appointment</p>
        <h1 className="font-display text-hero text-balance max-w-4xl mb-10">
          Request a consultation,<br />
          <em className="text-clinical not-italic">in a few simple steps.</em>
        </h1>
        <p className="text-xl text-ink-muted max-w-2xl text-pretty leading-relaxed">
          Fill out the form below and our chamber team will call you back to confirm
          a time. For urgent concerns, please call directly.
        </p>
      </section>

      <section className="container-wide pb-32">
        <div className="grid md:grid-cols-12 gap-12">
          {/* Form */}
          <div className="md:col-span-8">
            <div className="border border-ink/10 bg-paper p-8 md:p-12">
              <AppointmentForm />
            </div>
          </div>

          {/* Chamber info sidebar */}
          <aside className="md:col-span-4">
            <div className="md:sticky md:top-28 space-y-8">
              {chambers.map((chamber) => (
                <div key={chamber.name} className="border border-ink/15 bg-paper-warm/40 p-8">
                  <p className="text-xs uppercase tracking-[0.2em] text-ink-muted mb-5">
                    Chamber Details
                  </p>
                  <div className="space-y-5">
                    <InfoItem
                      icon={<MapPin className="w-5 h-5" />}
                      title={chamber.name}
                      body={chamber.address}
                    />
                    {chamber.phones?.length > 0 && (
                      <InfoItem
                        icon={<Phone className="w-5 h-5" />}
                        title="Phone"
                        body={
                          <span className="space-y-1 block">
                            {chamber.phones.map((phone) => (
                              <a key={phone} href={telHref(phone)} className="block hover:text-clinical">{phone}</a>
                            ))}
                          </span>
                        }
                      />
                    )}
                    {chamber.hours && (
                      <InfoItem
                        icon={<Clock className="w-5 h-5" />}
                        title="Hours"
                        body={chamber.hours}
                      />
                    )}
                  </div>
                </div>
              ))}

              <div className="border-l-2 border-accent pl-6">
                <p className="font-display text-lg text-ink mb-2">
                  Urgent situation?
                </p>
                <p className="text-sm text-ink-muted leading-relaxed mb-4">
                  For heavy bleeding, severe abdominal pain, or any pregnancy emergency, please call the chamber or go to the nearest hospital rather than waiting for a form response.
                </p>
                {mainPhone && (
                  <a href={telHref(mainPhone)} className="btn-accent text-sm">
                    <Phone className="w-4 h-4" />
                    Call Now
                  </a>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function InfoItem({
  icon, title, body,
}: { icon: React.ReactNode; title: string; body: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="text-clinical mt-0.5">{icon}</span>
      <div className="text-sm">
        <p className="font-medium text-ink mb-1">{title}</p>
        <div className="text-ink-muted leading-relaxed">{body}</div>
      </div>
    </div>
  );
}
