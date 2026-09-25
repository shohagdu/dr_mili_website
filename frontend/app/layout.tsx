import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';
import { cms, tokensToCss } from '@/lib/cms';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://drtapan.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Prof. Dr. Maksuda Farida Akhtar (Mili) — Gynecologist, Obstetrician & Infertility Specialist in Dhaka',
    template: '%s | Dr. Mili — Gynecologist',
  },
  description:
    'FCPS-qualified gynecologist, obstetrician and infertility specialist with 20+ years of experience — infertility & IVF/IUI, pregnancy care, PCOS, endometriosis, and laparoscopic surgery. Professor at Dhaka Medical College & Hospital; chambers at Central Hospital, Dhanmondi and Medilife, Mitford.',
  keywords: [
    'gynecologist in Dhaka',
    'best gynecologist Dhanmondi',
    'infertility specialist Bangladesh',
    'IVF IUI doctor Dhaka',
    'obstetrician Dhaka',
    'PCOS treatment Dhaka',
    'laparoscopic gynae surgeon Dhaka',
    'female gynecologist Central Hospital',
    'Prof Dr Maksuda Farida Akhtar Mili',
  ],
  authors: [{ name: 'Prof. Dr. Maksuda Farida Akhtar (Mili)' }],
  creator: 'Prof. Dr. Maksuda Farida Akhtar (Mili)',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'bn_BD',
    url: SITE_URL,
    siteName: 'Prof. Dr. Maksuda Farida Akhtar (Mili)',
    title: 'Prof. Dr. Maksuda Farida Akhtar (Mili) — Gynecologist, Obstetrician & Infertility Specialist, Dhaka',
    description:
      'FCPS (Gynecology & Obstetrics) with 20+ years of experience. Infertility, pregnancy care, PCOS, and laparoscopic surgery at Central Hospital, Dhanmondi.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Prof. Dr. Maksuda Farida Akhtar (Mili)' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prof. Dr. Maksuda Farida Akhtar (Mili) — Gynecologist, Dhaka',
    description: 'FCPS Gynecologist & Infertility Specialist · 20+ years · Central Hospital, Dhanmondi',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: { canonical: '/' },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Fetch the active theme at SSR time and inject its tokens as :root CSS
  // variables before the body renders — no flash of unstyled content.
  const theme = await cms.getTheme();
  const themeCss = tokensToCss(theme?.tokens);

  return (
    <html
      lang="en"
      className={`${dmSans.variable}${theme?.is_dark ? ' dark' : ''}`}
    >
      <head>
        {themeCss && (
          <style id="theme-vars" dangerouslySetInnerHTML={{ __html: themeCss }} />
        )}
        {theme?.custom_css && (
          <style
            id="theme-custom-css"
            dangerouslySetInnerHTML={{ __html: theme.custom_css }}
          />
        )}
      </head>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
