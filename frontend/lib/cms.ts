const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export interface PublicChamber {
  name: string;
  address: string;
  phones: string[];
  hours?: string;
  geo?: { lat?: number; lng?: number };
}

/** Used only when the doctor record (and its chambers) can't be loaded. */
export const FALLBACK_CHAMBERS: PublicChamber[] = [
  {
    name: 'Central Hospital Limited',
    address: 'House # 02, Road # 05, Green Road, Dhanmondi, Dhaka-1205',
    phones: ['02-9660015', '02-9660016', '02-41060800'],
    hours: '7:30 PM - 10:00 PM (Sat-Thu, Closed Friday)',
    geo: { lat: 23.7433842, lng: 90.3819472 },
  },
  {
    name: 'Medilife Specialized Hospital Ltd',
    address: '4/5, Mitford Road, Mitford Tower, Dhaka-1100',
    phones: ['01715-303344', '09614-502299'],
    hours: '3:00 PM - 6:00 PM (Sat-Thu, Closed Friday & Govt. Holidays)',
  },
];

/** Google Maps query for a chamber: exact coordinates when known, else name + address. */
export function chamberMapQuery(c: PublicChamber): string {
  return c.geo?.lat && c.geo?.lng ? `${c.geo.lat},${c.geo.lng}` : `${c.name}, ${c.address}`;
}

/** "02-9660015" → "tel:029660015" */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export interface PublicDoctor {
  id: number;
  name: string;
  slug_name?: string | null;
  picture?: string | null;
  qualifications?: string | null;
  special_training?: string | null;
  positions?: string | null;
  hero_tag?: string | null;
  stat_experience?: string | null;
  stat_publications?: string | null;
  stat_patients?: string | null;
  stat_success_rate?: string | null;
  expertise?: string[] | null;
  chambers?: PublicChamber[] | null;
  doctor_profile?: string | null;
  mobile?: string | null;
  email?: string | null;
  facebook?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  tiktok?: string | null;
  youtube?: string | null;
}

export interface PublicContent {
  id: number;
  type: number;
  icon?: string | null;
  title: string;
  short_description?: string | null;
  description?: string | null;
  storage_type?: string | null;
  file_path?: string | null;
  display_position: number;
  is_highlight_item: number;
  is_active: number;
}

interface Envelope<T> {
  data?: T;
  error?: { code: number; message: string };
}

async function publicFetch<T>(path: string, revalidate = 300): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate } });
    const body = (await res.json().catch(() => ({}))) as Envelope<T>;
    if (!res.ok) return null;
    return body.data ?? null;
  } catch {
    return null;
  }
}

/** webpage_contents.type codes shared by the public site */
export const CONTENT_TYPE = {
  WHY_CHOOSE: 1,
  ABOUT: 2,
  PICTURE: 7,
  VIDEO: 8,
  HOMEPAGE_HERO: 9,
} as const;

export interface PublicTheme {
  slug: string;
  name: string;
  is_dark: boolean;
  tokens: Record<string, string>;
  custom_css: string;
}

export const cms = {
  getDoctor: () => publicFetch<PublicDoctor>('/doctor'),
  getTheme: () => publicFetch<PublicTheme>('/theme', 60),
  getContent: (type: number, highlight?: boolean) => {
    const q = new URLSearchParams({ type: String(type) });
    if (highlight !== undefined) q.set('highlight', highlight ? '1' : '0');
    return publicFetch<PublicContent[]>(`/content?${q.toString()}`).then((d) => d ?? []);
  },
  /** First active Homepage Hero Section row, or null when none configured. */
  getHero: () =>
    publicFetch<PublicContent[]>(
      `/content?type=${CONTENT_TYPE.HOMEPAGE_HERO}&limit=1`,
    ).then((d) => d?.[0] ?? null),
};

/**
 * Normalise a stored video URL into an embeddable iframe src.
 * Handles youtube watch/share links and vimeo; otherwise returns it unchanged.
 */
export function videoEmbedUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/,
  );
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
}

/**
 * Convert a hex colour ("#2d5bff" or "#abc") into an "r g b" channel triplet.
 * Returns null when the value isn't a hex colour, so non-colour tokens pass
 * through unchanged.
 */
function hexToRgbTriplet(value: string): string | null {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());
  if (!m) return null;
  let hex = m[1];
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  const n = parseInt(hex, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

/**
 * Convert a theme's flat token map into a `:root { --var: value; }` CSS
 * string. Dotted token keys ("color.clinical") become CSS variable names
 * ("--color-clinical"). Colour values are emitted as RGB channel triplets so
 * Tailwind opacity modifiers keep working; values are sanitised to keep the
 * inline <style> injection safe.
 */
export function tokensToCss(tokens?: Record<string, string> | null): string {
  if (!tokens) return '';
  const decls = Object.entries(tokens)
    .map(([key, value]) => {
      const name = key.replace(/[^a-z0-9.-]/gi, '').replace(/\./g, '-');
      const raw = String(value).replace(/[<>{};]/g, '').trim();
      if (!name || !raw) return '';
      const out = hexToRgbTriplet(raw) ?? raw;
      return `--${name}: ${out};`;
    })
    .filter(Boolean)
    .join(' ');
  return decls ? `:root { ${decls} }` : '';
}

/** Convert a DB-stored path ("uploads/abc.jpg") into a fully-qualified URL */
export function assetUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path) || path.startsWith('/')) return path;
  const origin = API_URL.replace(/\/api\/v1\/?$/, '');
  return `${origin}/${path}`;
}
