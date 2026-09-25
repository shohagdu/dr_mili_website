import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowUpRight,
  Phone,
  Award,
  Stethoscope,
  Heart,
  Circle,
  Zap,
  Shield,
  Scissors,
  Flower,
  Calendar,
  Sun,
  UserRound,
  Star,
  CheckCircle2,
  Activity,
  Sparkles,
  GraduationCap,
  Baby,
  HeartPulse,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { Fragment } from 'react';
import { api } from '@/lib/api';
import { cms, assetUrl, type PublicContent } from '@/lib/cms';
import { FAQSchema } from '@/components/seo/FAQSchema';

export const revalidate = 300;

const SERVICE_TINTS: { bg: string; text: string }[] = [
  { bg: 'bg-tint-rose', text: 'text-rose-500' },
  { bg: 'bg-tint-peach', text: 'text-orange-500' },
  { bg: 'bg-tint-mint', text: 'text-emerald-500' },
  { bg: 'bg-tint-lavender', text: 'text-violet-500' },
  { bg: 'bg-tint-sky', text: 'text-clinical' },
  { bg: 'bg-tint-butter', text: 'text-amber-500' },
];

export default async function HomePage() {
  const [services, faqs, testimonials, doctor, whyChoose, aboutContent, hero] = await Promise.all([
    api.getServices().catch(() => []),
    api.getFaqs().catch(() => []),
    api.getTestimonials().catch(() => []),
    cms.getDoctor(),
    cms.getContent(1),
    cms.getContent(2),
    cms.getHero(),
  ]);

  const featuredTestimonial = testimonials[0];

  // Section intros = highlight items; cards = the rest. Falls back gracefully when empty.
  const whyIntro = whyChoose.find((c) => c.is_highlight_item === 1);
  const whyCards = whyChoose.filter((c) => c.is_highlight_item !== 1);
  const aboutIntro = aboutContent.find((c) => c.is_highlight_item === 1);
  const aboutCards = aboutContent.filter((c) => c.is_highlight_item !== 1);

  const doctorName = doctor?.name ?? 'Prof. Dr. Maksuda Farida Akhtar (Mili)';
  const doctorShortName = doctor?.slug_name || shortName(doctorName);
  const doctorQuals = doctor?.qualifications ?? 'MBBS, FCPS (Gynecology & Obstetrics)';

  // Homepage hero is CMS-driven (Site Content → Homepage Hero Section, type 9),
  // falling back to the doctor profile and then hardcoded copy.
  const heroTag = hero?.icon || doctor?.hero_tag || 'Creating a better tomorrow';
  const heroHeadline = hero?.title || 'Modern *gynecological care*\nyou can trust.';
  const heroSubtitle =
    hero?.short_description ||
    doctor?.doctor_profile?.split('\n')[0] ||
    `${doctorName} — ${doctorQuals} — provides infertility treatment, pregnancy care, and minimally invasive gynecological surgery with over 20 years of experience.`;
  const heroPortrait =
    assetUrl(hero?.file_path) ?? assetUrl(doctor?.picture) ?? '/doctor-hero.svg';

  const statExperience = doctor?.stat_experience ?? '20+';
  const statPatients = doctor?.stat_patients;
  const statPublications = doctor?.stat_publications ?? '20+';

  const phone = doctor?.mobile;

  return (
    <>
      <FAQSchema faqs={faqs.slice(0, 6)} />

      {/* HERO */}
      <section className="relative overflow-hidden bg-hero-sky">
        <div className="absolute top-20 left-10 w-32 h-32 opacity-30"
             style={{ backgroundImage: 'radial-gradient(circle, #2d5bff 1px, transparent 1.5px)', backgroundSize: '16px 16px' }} />
        <div className="absolute bottom-10 right-1/3 w-40 h-40 opacity-20"
             style={{ backgroundImage: 'radial-gradient(circle, #2d5bff 1px, transparent 1.5px)', backgroundSize: '16px 16px' }} />

        <div className="container-wide pt-16 pb-24 md:pt-24 md:pb-32 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-paper rounded-full text-xs font-semibold uppercase tracking-[0.15em] text-clinical card-shadow">
                <Sparkles className="w-3.5 h-3.5" />
                {heroTag}
              </span>
              <h1 className="font-display text-hero font-bold text-balance mt-6 mb-4 text-ink">
                {renderHeadline(heroHeadline)}
              </h1>
              <p className="font-display text-2xl md:text-3xl font-semibold text-clinical leading-tight">
                {doctorName}
              </p>
              <p className="text-sm uppercase tracking-[0.15em] text-ink-muted mt-1 mb-6">
                {doctorQuals}
              </p>
              <p className="text-lg text-ink-muted max-w-xl text-pretty leading-relaxed">{heroSubtitle}</p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link href="/appointment" className="btn-primary">
                  Book an Appointment
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                {phone ? (
                  <a href={`tel:${phone.replace(/\s+/g, '')}`} className="btn-secondary">
                    <Phone className="w-4 h-4" /> {phone}
                  </a>
                ) : (
                  <Link href="/contact" className="btn-secondary">
                    Contact Us <ArrowUpRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>

            <div className="relative h-[580px] hidden lg:block animate-fade-up">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[500px] h-[500px] rounded-full bg-gradient-to-br from-clinical/15 via-sky-100 to-paper" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src={heroPortrait}
                  alt={doctorName}
                  width={470}
                  height={580}
                  priority
                  unoptimized={heroPortrait.endsWith('.svg')}
                  className="w-[470px] h-[580px] object-contain drop-shadow-[0_30px_50px_rgba(15,27,61,0.18)]"
                />
              </div>

              <div className="absolute top-16 right-0 bg-paper rounded-2xl p-4 card-shadow-lg w-56 z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-clinical-tint grid place-items-center">
                    <UserRound className="w-5 h-5 text-clinical" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-ink leading-tight">{doctorShortName}</p>
                    <p className="text-[11px] text-ink-muted">Gynecologist · FCPS</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 mb-2">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                </div>
                <Link href="/appointment" className="block text-center text-xs font-medium bg-clinical text-paper rounded-full py-1.5 hover:bg-clinical-dark transition-colors">
                  Book Now
                </Link>
              </div>

              {statPatients && (
                <div className="absolute bottom-12 left-0 bg-paper rounded-2xl p-4 card-shadow-lg w-48 z-10">
                  <p className="text-[11px] uppercase tracking-wider text-ink-muted mb-1">Patients treated</p>
                  <p className="text-2xl font-bold text-ink mb-2">{statPatients}</p>
                  <div className="flex items-end gap-1 h-8">
                    {[40, 60, 35, 75, 55, 85, 65].map((h, i) => (
                      <div key={i} className="flex-1 bg-clinical/30 rounded-sm" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              )}

              <div className="absolute top-4 left-8 w-12 h-12 rounded-full bg-paper card-shadow grid place-items-center">
                <Activity className="w-5 h-5 text-clinical" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE — DB-driven */}
      <section className="container-wide py-20 md:py-24">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-clinical font-semibold mb-3">
            {whyIntro?.icon || 'Why choose Dr. Mili'}
          </p>
          <h2 className="font-display text-display font-bold text-ink text-balance">
            {whyIntro?.title ?? 'Trusted care for every stage of a woman\'s life'}
          </h2>
          <p className="mt-4 text-ink-muted leading-relaxed">
            {whyIntro?.short_description ||
              'From adolescence and pregnancy to menopause — specialist gynecological and obstetric care delivered with privacy, respect, and experience.'}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {whyCards.length === 0
            ? defaultFeatures.map((f) => <Feature key={f.title} {...f} />)
            : whyCards.slice(0, 8).map((c, i) => {
                const tint = SERVICE_TINTS[i % SERVICE_TINTS.length];
                return <CmsFeatureCard key={c.id} content={c} tintBg={tint.bg} tintText={tint.text} />;
              })}
        </div>
      </section>

      {/* ABOUT — uses doctor + content(2) */}
      <section className="bg-paper-warm py-20 md:py-28">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-[4/5] max-w-md mx-auto rounded-[40px] bg-gradient-to-br from-clinical/15 via-sky-100 to-paper grid place-items-center overflow-hidden">
                {heroPortrait ? (
                  <Image
                    src={heroPortrait}
                    alt={doctorName}
                    width={420}
                    height={520}
                    unoptimized={heroPortrait.endsWith('.svg')}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <UserRound className="w-48 h-48 text-clinical/40" strokeWidth={1} />
                )}
              </div>

              <div className="absolute -bottom-4 left-0 bg-paper rounded-2xl p-4 card-shadow-lg flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-tint-rose grid place-items-center">
                  <Award className="w-6 h-6 text-rose-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-ink leading-none">{statExperience}</p>
                  <p className="text-xs text-ink-muted mt-1">Years Experienced</p>
                </div>
              </div>

              {statPatients && (
                <div className="absolute top-8 -right-2 bg-paper rounded-2xl p-4 card-shadow-lg flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-tint-mint grid place-items-center">
                    <UserRound className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-ink leading-none">{statPatients}</p>
                    <p className="text-xs text-ink-muted mt-1">Patients Treated</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-clinical font-semibold mb-3">About</p>
              <h2 className="font-display text-display font-bold text-ink text-balance mb-6">
                {aboutIntro?.title ?? `Consult a gynecologist you can trust`}
              </h2>
              <p className="text-ink-muted text-pretty leading-relaxed mb-8 whitespace-pre-line">
                {aboutIntro?.short_description ?? doctor?.doctor_profile ?? defaultBio}
              </p>

              <ul className="space-y-3 mb-10">
                {(aboutCards.length ? aboutCards.slice(0, 4).map((c) => c.title) : defaultBullets).map((line) => (
                  <li key={line} className="flex items-start gap-3 text-ink-soft">
                    <CheckCircle2 className="w-5 h-5 text-clinical flex-shrink-0 mt-0.5" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>

              <Link href="/about" className="btn-primary">
                Discover More
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES (existing services table) */}
      {services.length > 0 && (
        <section className="container-wide py-20 md:py-28">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.2em] text-clinical font-semibold mb-3">Specialised treatments</p>
            <h2 className="font-display text-display font-bold text-ink text-balance">
              Comprehensive <span className="text-clinical">gynecological care</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 6).map((s, i) => {
              const tint = SERVICE_TINTS[i % SERVICE_TINTS.length];
              const Icon = SERVICE_ICONS[s.icon ?? ''] ?? Stethoscope;
              return (
                <Link
                  key={s.id}
                  href={`/services/${s.slug}`}
                  className="group bg-paper rounded-2xl p-7 card-shadow hover:card-shadow-lg hover:-translate-y-1 transition-all duration-300 border border-sky-50"
                >
                  <div className={`w-14 h-14 rounded-2xl ${tint.bg} grid place-items-center mb-5`}>
                    <Icon className={`w-7 h-7 ${tint.text}`} />
                  </div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-ink-subtle font-semibold mb-2">{s.category}</p>
                  <h3 className="font-display text-xl font-semibold mb-3 text-ink group-hover:text-clinical transition-colors">{s.title}</h3>
                  <p className="text-sm text-ink-muted leading-relaxed mb-5">{s.short_description}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-clinical group-hover:gap-2 transition-all">
                    Read More <ArrowUpRight className="w-4 h-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* TESTIMONIAL — only shown once a real testimonial exists in the DB */}
      {featuredTestimonial && (
      <section className="bg-paper-warm py-20 md:py-24">
        <div className="container-wide text-center max-w-3xl">
          <p className="text-xs uppercase tracking-[0.2em] text-clinical font-semibold mb-3">Patient voices</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-ink mb-10 text-balance">Real care, real outcomes</h2>
          <div className="bg-paper rounded-3xl p-10 card-shadow-lg">
            <div className="w-16 h-16 rounded-full bg-clinical-tint grid place-items-center mx-auto mb-6">
              <UserRound className="w-8 h-8 text-clinical" />
            </div>
            <div className="flex items-center justify-center gap-1 mb-5">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
            </div>
            <p className="text-lg md:text-xl text-ink text-pretty leading-relaxed mb-6 italic">
              &ldquo;{featuredTestimonial.message}&rdquo;
            </p>
            <p className="font-semibold text-ink">{featuredTestimonial.patient_name}</p>
            {featuredTestimonial.location && (
              <p className="text-sm text-ink-muted">{featuredTestimonial.location}</p>
            )}
          </div>
        </div>
      </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="container-wide py-20 md:py-28">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <p className="text-xs uppercase tracking-[0.2em] text-clinical font-semibold mb-3">Common questions</p>
              <h2 className="font-display text-display font-bold text-ink text-balance mb-6">
                Questions <span className="text-clinical">patients</span> often ask
              </h2>
              <p className="text-ink-muted leading-relaxed">Have a different question? Reach out — the chamber is open 24 hours.</p>
            </div>
            <div className="lg:col-span-8 space-y-3">
              {faqs.slice(0, 6).map((f) => (
                <details key={f.id} className="group bg-paper rounded-2xl border border-sky-100 p-6 open:card-shadow transition-shadow">
                  <summary className="cursor-pointer flex items-start justify-between gap-6 list-none">
                    <h3 className="font-display text-base md:text-lg font-semibold text-ink text-balance pr-4 group-open:text-clinical transition-colors">{f.question}</h3>
                    <span className="w-7 h-7 rounded-full bg-clinical-tint text-clinical text-lg grid place-items-center flex-shrink-0 group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-4 text-ink-muted text-pretty leading-relaxed">{f.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container-wide pb-20 md:pb-28">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-clinical to-clinical-dark px-8 py-14 md:px-16 md:py-20">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-clinical-light/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-paper text-balance mb-4">
                Ready to take the next step toward better health?
              </h2>
              <p className="text-paper/80 text-pretty leading-relaxed">
                Book an appointment online or call the chamber directly{phone ? '' : ' — open 24 hours'}.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 lg:justify-end">
              <Link href="/appointment" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-paper text-clinical font-semibold rounded-full hover:bg-paper-warm transition-colors">
                Book an Appointment <ArrowUpRight className="w-4 h-4" />
              </Link>
              {phone && (
                <a href={`tel:${phone.replace(/\s+/g, '')}`} className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-transparent text-paper border border-paper/40 font-medium rounded-full hover:bg-paper/10 transition-colors">
                  <Phone className="w-4 h-4" /> Call Chamber
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/** Maps the `services.icon` name stored in the DB to a Lucide icon. */
const SERVICE_ICONS: Record<string, LucideIcon> = {
  heart: Heart,
  activity: Activity,
  circle: Circle,
  zap: Zap,
  baby: Baby,
  shield: Shield,
  scissors: Scissors,
  flower: Flower,
  calendar: Calendar,
  sun: Sun,
};

const defaultBio =
  'FCPS-qualified gynecologist and obstetrician with over 20 years of experience in women\'s health, pregnancy care, and infertility. Focused on clear communication and safe, minimally invasive treatment.';

const defaultBullets = [
  'MBBS, FCPS (Gynecology & Obstetrics) — long-standing specialist practice',
  'Professor, Dept. of Gynecology & Obstetrics, Dhaka Medical College & Hospital',
  'Expertise in high-risk pregnancy, infertility, and laparoscopic surgery',
  'Patient-first consultations with transparent treatment plans',
];

const defaultFeatures: { tint: string; iconColor: string; icon: LucideIcon; title: string; body: string }[] = [
  { tint: 'bg-tint-rose', iconColor: 'text-rose-500', icon: GraduationCap, title: '20+ Years of Expertise', body: 'FCPS in Gynecology & Obstetrics and Professor at Dhaka Medical College & Hospital.' },
  { tint: 'bg-tint-mint', iconColor: 'text-emerald-500', icon: Baby, title: 'Safe Pregnancy Care', body: 'Regular antenatal check-ups, high-risk pregnancy management, and safe delivery planning.' },
  { tint: 'bg-tint-peach', iconColor: 'text-orange-500', icon: HeartPulse, title: 'Fertility & Hormonal Health', body: 'Evaluation and treatment for infertility, PCOS, irregular periods, and menopause.' },
  { tint: 'bg-tint-lavender', iconColor: 'text-violet-500', icon: ShieldCheck, title: 'Private & Compassionate', body: 'Confidential consultations with a woman specialist — clear answers, no judgement.' },
];

/** "Prof. Dr. Maksuda Farida Akhtar (Mili)" → "Dr. Mili" (matches Header/Footer). */
function shortName(full: string): string {
  const parts = full.trim().split(/\s+/);
  const last = parts[parts.length - 1].replace(/^\(|\)$/g, '');
  return /^(Prof\.?|Dr\.?)/i.test(parts[0]) ? `Dr. ${last}` : full;
}

/**
 * Render a CMS hero headline: `\n` becomes a line break and any phrase
 * wrapped in *asterisks* is highlighted in the clinical accent colour.
 */
function renderHeadline(text: string) {
  const lines = text.split(/\\n|\n/);
  return lines.map((line, li) => (
    <Fragment key={li}>
      {li > 0 && <br />}
      {line.split(/(\*[^*]+\*)/g).map((part, pi) =>
        part.startsWith('*') && part.endsWith('*') && part.length > 1 ? (
          <span key={pi} className="text-clinical">{part.slice(1, -1)}</span>
        ) : (
          <Fragment key={pi}>{part}</Fragment>
        ),
      )}
    </Fragment>
  ));
}

function Feature({ tint, iconColor, icon: Icon, title, body }: { tint: string; iconColor: string; icon: LucideIcon; title: string; body: string }) {
  return (
    <div className="bg-paper rounded-2xl p-7 card-shadow hover:card-shadow-lg hover:-translate-y-1 transition-all duration-300 border border-sky-50">
      <div className={`w-14 h-14 rounded-2xl ${tint} grid place-items-center mb-5 ${iconColor}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-display text-lg font-semibold text-ink mb-2">{title}</h3>
      <p className="text-sm text-ink-muted leading-relaxed">{body}</p>
    </div>
  );
}

function CmsFeatureCard({ content, tintBg, tintText }: { content: PublicContent; tintBg: string; tintText: string }) {
  return (
    <div className="bg-paper rounded-2xl p-7 card-shadow hover:card-shadow-lg hover:-translate-y-1 transition-all duration-300 border border-sky-50">
      <div className={`w-14 h-14 rounded-2xl ${tintBg} grid place-items-center mb-5 ${tintText}`}>
        {content.icon ? <i className={`${content.icon} text-2xl`} /> : <Sparkles className="w-6 h-6" />}
      </div>
      <h3 className="font-display text-lg font-semibold text-ink mb-2">{content.title}</h3>
      {content.short_description && (
        <p className="text-sm text-ink-muted leading-relaxed line-clamp-4">{content.short_description}</p>
      )}
    </div>
  );
}
