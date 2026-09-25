import { assetUrl, type PublicDoctor } from '@/lib/cms';

export function PhysicianSchema({ doctor }: { doctor: PublicDoctor | null }) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://drtapan.com';
  if (!doctor) return null;

  const chamber = doctor.chambers?.[0];
  const credentials = (doctor.qualifications ?? '')
    .split(/[,·]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((name) => ({
      '@type': 'EducationalOccupationalCredential',
      name,
    }));

  const jobTitles = (doctor.positions ?? '')
    .split(/·|,/)
    .map((s) => s.trim())
    .filter(Boolean);

  const expertise = doctor.expertise ?? [];

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    '@id': `${SITE_URL}/#physician`,
    name: doctor.name,
    description: doctor.doctor_profile ?? undefined,
    url: SITE_URL,
    image: assetUrl(doctor.picture) ?? `${SITE_URL}/doctor-hero.svg`,
    telephone: doctor.mobile ?? undefined,
    email: doctor.email ?? undefined,
    medicalSpecialty: ['Gynecologic', 'Obstetric'],
    knowsAbout: expertise.length ? expertise : undefined,
    hasCredential: credentials.length ? credentials : undefined,
    jobTitle: jobTitles.length ? jobTitles : undefined,
    sameAs: [doctor.facebook, doctor.twitter, doctor.instagram, doctor.linkedin, doctor.youtube]
      .filter(Boolean),
  };

  if (chamber) {
    schema.worksFor = {
      '@type': 'MedicalBusiness',
      '@id': `${SITE_URL}/#chamber`,
      name: chamber.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: chamber.address,
        addressCountry: 'BD',
      },
      telephone: chamber.phones,
      ...(chamber.geo?.lat && chamber.geo?.lng
        ? {
            geo: {
              '@type': 'GeoCoordinates',
              latitude: chamber.geo.lat,
              longitude: chamber.geo.lng,
            },
          }
        : {}),
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
