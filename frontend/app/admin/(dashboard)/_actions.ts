'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  adminApi,
  type UpdateDoctorInput,
  type CreateContentInput,
  type UpdateContentInput,
  type CreateServiceInput,
  type UpdateServiceInput,
  type CreateTestimonialInput,
  type UpdateTestimonialInput,
  type CreateBlogPostInput,
  type UpdateBlogPostInput,
} from '@/lib/admin-api';

export async function updateAppointmentStatusAction(id: number, status: string) {
  await adminApi.updateAppointment(id, { status });
  revalidatePath('/admin/appointments');
  revalidatePath('/admin');
}

export async function updateAppointmentNotesAction(id: number, admin_notes: string) {
  await adminApi.updateAppointment(id, { admin_notes });
  revalidatePath('/admin/appointments');
}

export async function markMessageReadAction(id: number) {
  await adminApi.markMessageRead(id);
  revalidatePath('/admin/messages');
  revalidatePath('/admin');
}

// -------- Doctor --------
export async function updateDoctorAction(id: number, input: UpdateDoctorInput) {
  await adminApi.updateDoctor(id, input);
  revalidatePath('/admin/doctor');
  revalidatePath('/');
  revalidatePath('/about');
}

// -------- Content --------
export async function createContentAction(input: CreateContentInput) {
  const { id } = await adminApi.createContent(input);
  revalidatePath('/admin/content');
  revalidatePath('/');
  revalidatePath('/about');
  redirect(`/admin/content/${id}`);
}

export async function updateContentAction(id: number, input: UpdateContentInput) {
  await adminApi.updateContent(id, input);
  revalidatePath('/admin/content');
  revalidatePath(`/admin/content/${id}`);
  revalidatePath('/');
  revalidatePath('/about');
}

export async function deleteContentAction(id: number) {
  await adminApi.deleteContent(id);
  revalidatePath('/admin/content');
  revalidatePath('/');
  revalidatePath('/about');
}

// -------- Services --------
export async function createServiceAction(input: CreateServiceInput) {
  const { id } = await adminApi.createService(input);
  revalidatePath('/admin/services');
  revalidatePath('/services');
  redirect(`/admin/services/${id}`);
}

export async function updateServiceAction(id: number, input: UpdateServiceInput) {
  await adminApi.updateService(id, input);
  revalidatePath('/admin/services');
  revalidatePath(`/admin/services/${id}`);
  revalidatePath('/services');
}

export async function deleteServiceAction(id: number) {
  await adminApi.deleteService(id);
  revalidatePath('/admin/services');
  revalidatePath('/services');
}

// -------- Testimonials --------
export async function createTestimonialAction(input: CreateTestimonialInput) {
  const { id } = await adminApi.createTestimonial(input);
  revalidatePath('/admin/testimonials');
  revalidatePath('/');
  redirect(`/admin/testimonials/${id}`);
}

export async function updateTestimonialAction(id: number, input: UpdateTestimonialInput) {
  await adminApi.updateTestimonial(id, input);
  revalidatePath('/admin/testimonials');
  revalidatePath(`/admin/testimonials/${id}`);
  revalidatePath('/');
}

export async function deleteTestimonialAction(id: number) {
  await adminApi.deleteTestimonial(id);
  revalidatePath('/admin/testimonials');
  revalidatePath('/');
}

// -------- Blog Posts --------
export async function createBlogPostAction(input: CreateBlogPostInput) {
  const { id } = await adminApi.createBlogPost(input);
  revalidatePath('/admin/blog');
  revalidatePath('/blog');
  redirect(`/admin/blog/${id}`);
}

export async function updateBlogPostAction(id: number, input: UpdateBlogPostInput) {
  await adminApi.updateBlogPost(id, input);
  revalidatePath('/admin/blog');
  revalidatePath(`/admin/blog/${id}`);
  revalidatePath('/blog');
}

export async function deleteBlogPostAction(id: number) {
  await adminApi.deleteBlogPost(id);
  revalidatePath('/admin/blog');
  revalidatePath('/blog');
}

// -------- Theme --------
export async function switchThemeAction(slug: string) {
  const theme = await adminApi.switchTheme(slug);
  revalidatePath('/admin/theme');
  revalidatePath('/', 'layout');
  return theme;
}

export async function customizeThemeAction(overrides: Record<string, string>) {
  const theme = await adminApi.customizeTheme(overrides);
  revalidatePath('/admin/theme');
  revalidatePath('/', 'layout');
  return theme;
}

export async function resetThemeAction() {
  const theme = await adminApi.resetTheme();
  revalidatePath('/admin/theme');
  revalidatePath('/', 'layout');
  return theme;
}

// -------- Site settings --------
export async function saveSettingsAction(settings: Record<string, string>) {
  await adminApi.saveSettings(settings);
  revalidatePath('/admin/settings');
  revalidatePath('/', 'layout');
}

export async function deleteSettingAction(key: string) {
  await adminApi.deleteSetting(key);
  revalidatePath('/admin/settings');
  revalidatePath('/', 'layout');
}
