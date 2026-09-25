import 'server-only';
import { cookies } from 'next/headers';

import type {
  AdminAppointment,
  AdminMessage,
  AdminDoctor,
  AdminContent,
  CreateContentInput,
  UpdateContentInput,
  UpdateDoctorInput,
  AdminServiceItem,
  CreateServiceInput,
  UpdateServiceInput,
  AdminTestimonialItem,
  CreateTestimonialInput,
  UpdateTestimonialInput,
  AdminBlogPostItem,
  CreateBlogPostInput,
  UpdateBlogPostInput,
  AdminSettings,
} from './admin-types';

// Re-export so existing imports from '@/lib/admin-api' keep working in server code.
export type {
  AdminAppointment,
  AdminMessage,
  AdminDoctor,
  AdminContent,
  DoctorChamber,
  ContentType,
  CreateContentInput,
  UpdateContentInput,
  UpdateDoctorInput,
  AdminServiceItem,
  CreateServiceInput,
  UpdateServiceInput,
  AdminTestimonialItem,
  CreateTestimonialInput,
  UpdateTestimonialInput,
  AdminBlogPostItem,
  CreateBlogPostInput,
  UpdateBlogPostInput,
  AdminSettings,
} from './admin-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
const COOKIE_NAME = 'admin_token';

// ----- Theme types -----
export interface ThemePreset {
  slug: string;
  name: string;
  description?: string | null;
  is_dark: boolean;
  preview_image?: string | null;
}

export interface ResolvedTheme {
  slug: string;
  name: string;
  is_dark: boolean;
  tokens: Record<string, string>;
  custom_css: string;
}

interface ApiEnvelope<T> {
  data?: T;
  error?: { code: number; message: string };
  success?: boolean;
}

export async function getAdminToken(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE_NAME)?.value;
}

async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAdminToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });

  const body = (await res.json().catch(() => ({}))) as ApiEnvelope<T>;
  if (!res.ok) {
    throw new Error(body.error?.message || `API error ${res.status}`);
  }
  // List/get endpoints wrap payloads in `data`; create/update/delete return the
  // envelope itself ({ success, id }). Fall back to the whole body when unwrapped.
  return (body.data ?? (body as unknown as T)) as T;
}

export const adminApi = {
  listAppointments: (params: { status?: string; limit?: number; offset?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.status) q.set('status', params.status);
    if (params.limit) q.set('limit', String(params.limit));
    if (params.offset) q.set('offset', String(params.offset));
    const qs = q.toString();
    return adminFetch<AdminAppointment[]>(`/admin/appointments${qs ? `?${qs}` : ''}`);
  },
  updateAppointment: (id: number, input: { status?: string; admin_notes?: string }) =>
    adminFetch<{ success: boolean }>(`/admin/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  listMessages: (params: { limit?: number; offset?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.limit) q.set('limit', String(params.limit));
    if (params.offset) q.set('offset', String(params.offset));
    const qs = q.toString();
    return adminFetch<AdminMessage[]>(`/admin/messages${qs ? `?${qs}` : ''}`);
  },
  markMessageRead: (id: number) =>
    adminFetch<{ success: boolean }>(`/admin/messages/${id}/read`, { method: 'PATCH' }),

  // ----- Doctor -----
  getDoctor: () => adminFetch<AdminDoctor>('/admin/doctor'),
  updateDoctor: (id: number, input: UpdateDoctorInput) =>
    adminFetch<{ success: boolean }>(`/admin/doctor/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  // ----- Webpage content -----
  listContent: (params: { type?: number; limit?: number; offset?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.type !== undefined) q.set('type', String(params.type));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.offset) q.set('offset', String(params.offset));
    const qs = q.toString();
    return adminFetch<AdminContent[]>(`/admin/content${qs ? `?${qs}` : ''}`);
  },
  getContent: (id: number) => adminFetch<AdminContent>(`/admin/content/${id}`),
  createContent: (input: CreateContentInput) =>
    adminFetch<{ success: boolean; id: number }>(`/admin/content`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  updateContent: (id: number, input: UpdateContentInput) =>
    adminFetch<{ success: boolean }>(`/admin/content/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  deleteContent: (id: number) =>
    adminFetch<{ success: boolean }>(`/admin/content/${id}`, { method: 'DELETE' }),

  // ----- Services -----
  listServices: (params: { limit?: number; offset?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.limit) q.set('limit', String(params.limit));
    if (params.offset) q.set('offset', String(params.offset));
    const qs = q.toString();
    return adminFetch<AdminServiceItem[]>(`/admin/services${qs ? `?${qs}` : ''}`);
  },
  getService: (id: number) => adminFetch<AdminServiceItem>(`/admin/services/${id}`),
  createService: (input: CreateServiceInput) =>
    adminFetch<{ success: boolean; id: number }>(`/admin/services`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  updateService: (id: number, input: UpdateServiceInput) =>
    adminFetch<{ success: boolean }>(`/admin/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  deleteService: (id: number) =>
    adminFetch<{ success: boolean }>(`/admin/services/${id}`, { method: 'DELETE' }),

  // ----- Testimonials -----
  listTestimonials: (params: { limit?: number; offset?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.limit) q.set('limit', String(params.limit));
    if (params.offset) q.set('offset', String(params.offset));
    const qs = q.toString();
    return adminFetch<AdminTestimonialItem[]>(`/admin/testimonials${qs ? `?${qs}` : ''}`);
  },
  getTestimonial: (id: number) => adminFetch<AdminTestimonialItem>(`/admin/testimonials/${id}`),
  createTestimonial: (input: CreateTestimonialInput) =>
    adminFetch<{ success: boolean; id: number }>(`/admin/testimonials`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  updateTestimonial: (id: number, input: UpdateTestimonialInput) =>
    adminFetch<{ success: boolean }>(`/admin/testimonials/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  deleteTestimonial: (id: number) =>
    adminFetch<{ success: boolean }>(`/admin/testimonials/${id}`, { method: 'DELETE' }),

  // ----- Blog Posts -----
  listBlogPosts: (params: { limit?: number; offset?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.limit) q.set('limit', String(params.limit));
    if (params.offset) q.set('offset', String(params.offset));
    const qs = q.toString();
    return adminFetch<AdminBlogPostItem[]>(`/admin/blog${qs ? `?${qs}` : ''}`);
  },
  getBlogPost: (id: number) => adminFetch<AdminBlogPostItem>(`/admin/blog/${id}`),
  createBlogPost: (input: CreateBlogPostInput) =>
    adminFetch<{ success: boolean; id: number }>(`/admin/blog`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  updateBlogPost: (id: number, input: UpdateBlogPostInput) =>
    adminFetch<{ success: boolean }>(`/admin/blog/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  deleteBlogPost: (id: number) =>
    adminFetch<{ success: boolean }>(`/admin/blog/${id}`, { method: 'DELETE' }),

  // ----- Theme -----
  getThemePresets: () =>
    adminFetch<{ active_slug: string; presets: ThemePreset[] }>('/theme/presets'),
  getActiveTheme: () => adminFetch<ResolvedTheme>('/theme'),
  switchTheme: (slug: string) =>
    adminFetch<ResolvedTheme>('/admin/theme', {
      method: 'PATCH',
      body: JSON.stringify({ slug }),
    }),
  customizeTheme: (overrides: Record<string, string>) =>
    adminFetch<ResolvedTheme>('/admin/theme/customize', {
      method: 'PATCH',
      body: JSON.stringify({ overrides }),
    }),
  resetTheme: () =>
    adminFetch<ResolvedTheme>('/admin/theme/reset', { method: 'POST' }),

  // ----- Site settings -----
  getSettings: () => adminFetch<AdminSettings>('/admin/settings'),
  saveSettings: (settings: Record<string, string>) =>
    adminFetch<{ success: boolean; updated: number }>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings }),
    }),
  deleteSetting: (key: string) =>
    adminFetch<{ success: boolean }>(`/admin/settings/${encodeURIComponent(key)}`, {
      method: 'DELETE',
    }),
};
