import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, GraduationCap, BadgeCheck, Stethoscope, MapPin, Phone, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { cms } from '@/lib/cms';
import { FAQSchema } from '@/components/seo/FAQSchema';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';

export const revalidate = 600;

export const metadata: Metadata = {
  title: 'About Prof. Dr. Maksuda Farida Akhtar (Mili)',
  description:
    'FCPS-qualified gynecologist, obstetrician and infertility specialist with 20+ years of experience. Professor of Gynecology & Obstetrics at Dhaka Medical College & Hospital.',
  alternates: { canonical: '/about' },
};

export default async function AboutPage() {
  const [faqs, doctor, aboutContent] = await Promise.all([
    api.getFaqs().catch(() => []),
    cms.getDoctor(),
    cms.getContent(2),
  ]);

  const intro = aboutContent.find((c) => c.is_highlight_item === 1);
  const sections = aboutContent.filter((c) => c.is_highlight_item !== 1);
  const expertise = doctor?.expertise ?? defaultExpertise;
  const chamber = doctor?.chambers?.[0];
  const bio = doctor?.doctor_profile ?? defaultBio;

  return (
    <>
      <FAQSchema faqs={faqs} />
      <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'About', url: '/about' }]} />

      {/* Hero */}
      <section className="container-wide pt-20 pb-20 md:pt-28">
        <p className="pill mb-8">About the doctor</p>
        <h1 className="font-display text-hero text-balance max-w-4xl mb-10">
          {intro?.title ?? (
            <>
              A clinician committed to <span className="text-clinical">clear answers</span>{' '}and modern technique.
            </>
          )}
        </h1>
        <p className="text-xl text-ink-muted max-w-2xl text-pretty leading-relaxed">
          {intro?.short_description ?? bio}
        </p>
      </section>

      {/* Profile grid */}
      <section className="container-wide pb-24">
        <div className="grid md:grid-cols-12 gap-12 border-t border-sky-100 pt-16">
          <div className="md:col-span-8 space-y-10 text-lg text-ink-soft leading-relaxed">
            <div>
              <h2 className="font-display text-3xl font-bold mb-5">Background</h2>
              <p className="whitespace-pre-line">{bio}</p>
            </div>

            {sections.length > 0 ? (
              sections.map((s) => (
                <div key={s.id}>
                  <h2 className="font-display text-3xl font-bold mb-5">{s.title}</h2>
                  {s.short_description && (
                    <p className="whitespace-pre-line">{s.short_description}</p>
                  )}
                  {s.description && s.description !== s.short_description && (
                    <p className="whitespace-pre-line mt-3">{s.description}</p>
                  )}
                </div>
              ))
            ) : (
              <div>
                <h2 className="font-display text-3xl font-bold mb-5">Clinical Philosophy</h2>
                <p>
                  Dr. Mili believes gynecological care should be practical, evidence-based,
                  and patient-friendly. She prefers minimally invasive techniques whenever
                  appropriate, explains every diagnosis in plain language, and avoids
                  unnecessary investigations or procedures.
                </p>
              </div>
            )}

            <div>
              <h2 className="font-display text-3xl font-bold mb-5">Areas of Expertise</h2>
              <ul className="space-y-3 list-none pl-0">
                {expertise.map((s) => (
                  <li key={s} className="flex gap-3">
                    <span className="text-clinical mt-1">—</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Side card */}
          <aside className="md:col-span-4">
            <div className="md:sticky md:top-28 space-y-6 bg-paper rounded-2xl card-shadow border border-sky-100 p-8">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-ink-muted mb-3 font-semibold">Credentials</p>
                <ul className="space-y-4">
                  {(doctor?.qualifications ?? 'MBBS · FCPS (Gynecology & Obstetrics)')
                    .split(/[·,]/)
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((label, i) => (
                      <CredItem
                        key={label}
                        icon={i === 0 ? <GraduationCap className="w-5 h-5" /> : <BadgeCheck className="w-5 h-5" />}
                        label={label}
                        sub={i === 0 ? 'Medical degree' : 'Specialist credential'}
                      />
                    ))}
                  {doctor?.stat_experience && (
                    <CredItem
                      icon={<Stethoscope className="w-5 h-5" />}
                      label={`${doctor.stat_experience} years`}
                      sub="Clinical experience"
                    />
                  )}
                </ul>
              </div>

              {chamber && (
                <div className="border-t border-sky-100 pt-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-ink-muted mb-3 font-semibold">Practicing at</p>
                  <p className="font-display text-lg font-semibold text-ink mb-2">{chamber.name}</p>
                  <div className="space-y-2 text-sm text-ink-muted leading-relaxed">
                    <div className="flex gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-clinical" />
                      <span className="whitespace-pre-line">{chamber.address}</span>
                    </div>
                    {chamber.phones?.length > 0 && (
                      <div className="flex gap-2">
                        <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-clinical" />
                        <div>
                          {chamber.phones.map((p) => (
                            <a key={p} href={`tel:${p.replace(/\s+/g, '')}`} className="block hover:text-clinical">{p}</a>
                          ))}
                        </div>
                      </div>
                    )}
                    {chamber.hours && (
                      <div className="flex gap-2">
                        <Clock className="w-4 h-4 mt-0.5 flex-shrink-0 text-clinical" />
                        <span className="text-clinical">{chamber.hours}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Link href="/appointment" className="btn-primary w-full">
                Book Appointment
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* FAQ */}
      {faqs.length > 0 && (
        <section id="faq" className="bg-paper-warm border-y border-sky-100">
          <div className="container-wide py-24">
            <p className="text-xs uppercase tracking-[0.2em] text-clinical font-semibold mb-3">FAQ</p>
            <h2 className="font-display text-display font-bold text-balance mb-16 max-w-3xl text-ink">
              Common questions, <span className="text-clinical">clear answers</span>.
            </h2>
            <div className="divide-y divide-sky-100 max-w-4xl bg-paper rounded-2xl card-shadow p-4 md:p-8 border border-sky-100">
              {faqs.map((f) => (
                <details key={f.id} className="group py-6">
                  <summary className="cursor-pointer flex items-start justify-between gap-6 list-none">
                    <h3 className="font-display text-lg md:text-xl font-semibold text-balance pr-8 group-open:text-clinical transition-colors">
                      {f.question}
                    </h3>
                    <span className="w-7 h-7 rounded-full bg-clinical-tint text-clinical text-lg grid place-items-center flex-shrink-0 group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-4 text-ink-muted max-w-3xl leading-relaxed">{f.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

const defaultBio =
  'Prof. Dr. Maksuda Farida Akhtar (Mili) is an FCPS-qualified gynecologist, obstetrician and infertility specialist with over 20 years of experience in women\'s health.';

const defaultExpertise = [
  'Infertility evaluation and treatment (IUI, IVF-ET)',
  'Laparoscopic and hysteroscopic gynae surgery',
  'Normal delivery and high-risk pregnancy care',
  'PCOS, endometriosis, and uterine fibroids',
  'Menstrual disorders and menopause care',
  'Hysterectomy and myomectomy',
];

function CredItem({ icon, label, sub }: { icon: React.ReactNode; label: string; sub: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="text-clinical mt-0.5">{icon}</span>
      <div>
        <p className="font-medium text-ink">{label}</p>
        <p className="text-xs text-ink-muted">{sub}</p>
      </div>
    </li>
  );
}
