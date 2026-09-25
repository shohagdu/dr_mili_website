// Pure types — safe to import from both client and server components.
// (lib/admin-api.ts uses next/headers and is server-only.)

export interface AdminAppointment {
  id: number;
  patient_name: string;
  phone: string;
  email?: string | null;
  age?: number | null;
  gender?: string | null;
  problem_summary: string;
  preferred_date: string;
  preferred_slot: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  admin_notes?: string | null;
  source?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminMessage {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  subject?: string | null;
  message: string;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
}

export interface DoctorChamber {
  name: string;
  address: string;
  phones: string[];
  hours?: string;
  geo?: { lat?: number; lng?: number };
}

export interface AdminDoctor {
  id: number;
  user_id?: number | null;
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
  chambers?: DoctorChamber[] | null;
  doctor_profile?: string | null;
  mobile?: string | null;
  email?: string | null;
  facebook?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  tiktok?: string | null;
  youtube?: string | null;
  display_position?: number | null;
  is_active: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export type ContentType = 1 | 2 | 7 | 8;

export interface AdminContent {
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
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreateContentInput {
  type: number;
  icon?: string;
  title: string;
  short_description?: string;
  description?: string;
  storage_type?: string;
  file_path?: string;
  display_position?: number;
  is_highlight_item?: number;
  is_active?: number;
}

export type UpdateContentInput = Partial<CreateContentInput>;
export type UpdateDoctorInput = Partial<Omit<AdminDoctor, 'id' | 'created_at' | 'updated_at'>>;

// ============================================================
// SERVICES
// ============================================================
export interface AdminServiceItem {
  id: number;
  slug: string;
  title: string;
  category: string;
  short_description: string;
  full_content: string;
  icon?: string | null;
  cover_image?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  display_order: number;
  is_published: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreateServiceInput {
  slug: string;
  title: string;
  category: string;
  short_description: string;
  full_content: string;
  icon?: string;
  cover_image?: string;
  meta_title?: string;
  meta_description?: string;
  display_order?: number;
  is_published?: boolean;
}

export type UpdateServiceInput = Partial<CreateServiceInput>;

// ============================================================
// TESTIMONIALS
// ============================================================
export interface AdminTestimonialItem {
  id: number;
  patient_name: string;
  patient_age?: number | null;
  location?: string | null;
  rating: number;
  message: string;
  treatment_for?: string | null;
  is_published: boolean;
  consent_given: boolean;
  display_order: number;
  created_at?: string | null;
}

export interface CreateTestimonialInput {
  patient_name: string;
  patient_age?: number;
  location?: string;
  rating: number;
  message: string;
  treatment_for?: string;
  is_published?: boolean;
  consent_given?: boolean;
  display_order?: number;
}

export type UpdateTestimonialInput = Partial<CreateTestimonialInput>;

// ============================================================
// BLOG POSTS
// ============================================================
export interface AdminBlogPostItem {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image?: string | null;
  author: string;
  tags?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  reading_time_minutes?: number | null;
  view_count: number;
  is_published: boolean;
  published_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreateBlogPostInput {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  author: string;
  tags?: string;
  meta_title?: string;
  meta_description?: string;
  reading_time_minutes?: number;
  is_published?: boolean;
}

export type UpdateBlogPostInput = Partial<CreateBlogPostInput>;

// ============================================================
// SITE SETTINGS
// ============================================================
export type AdminSettings = Record<string, string>;
