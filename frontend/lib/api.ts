const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

interface ApiResponse<T> {
  data?: T;
  error?: { code: number; message: string };
  success?: boolean;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  revalidate: number | false = 60,
): Promise<T> {
  const url = `${API_URL}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    // Next.js fetch caching
    next: revalidate === false ? undefined : { revalidate },
  });

  const body = (await res.json().catch(() => ({}))) as ApiResponse<T>;

  if (!res.ok) {
    throw new Error(body.error?.message || `API error ${res.status}`);
  }

  return body.data as T;
}

// ---------------- Types ----------------
export interface Service {
  id: number;
  slug: string;
  title: string;
  category: string;
  short_description: string;
  full_content: string;
  icon?: string;
  cover_image?: string;
  meta_title?: string;
  meta_description?: string;
}

export interface BlogPostSummary {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  cover_image?: string;
  author: string;
  tags?: string;
  reading_time_minutes?: number;
  published_at?: string;
}

export interface BlogPost extends BlogPostSummary {
  content: string;
  meta_title?: string;
  meta_description?: string;
}

export interface Testimonial {
  id: number;
  patient_name: string;
  location?: string;
  rating: number;
  message: string;
  treatment_for?: string;
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
  category?: string;
}

export interface AppointmentInput {
  patient_name: string;
  phone: string;
  email?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  problem_summary: string;
  preferred_date: string;   // YYYY-MM-DD
  preferred_slot: string;
}

export interface ContactInput {
  name: string;
  email?: string;
  phone?: string;
  subject?: string;
  message: string;
}

// ---------------- API methods ----------------
export const api = {
  // Public reads — cached
  getServices: () => request<Service[]>('/services'),
  getService: (slug: string) => request<Service>(`/services/${slug}`),
  getBlogPosts: (limit = 12) => request<BlogPostSummary[]>(`/blog?limit=${limit}`),
  getBlogPost: (slug: string) => request<BlogPost>(`/blog/${slug}`),
  getTestimonials: () => request<Testimonial[]>('/testimonials'),
  getFaqs: (category?: string) =>
    request<Faq[]>(`/faqs${category ? `?category=${category}` : ''}`),
  getSettings: () => request<Record<string, string>>('/settings'),

  // Writes — never cache
  createAppointment: (input: AppointmentInput) =>
    request<{ id: number; message: string }>(
      '/appointments',
      { method: 'POST', body: JSON.stringify(input) },
      false,
    ),
  createContact: (input: ContactInput) =>
    request<{ message: string }>(
      '/contact',
      { method: 'POST', body: JSON.stringify(input) },
      false,
    ),
};
