"use server";

import { adminClient } from "@/src/lib/sanity/client";
import { client } from "@/src/lib/sanity/client";
import { revalidatePath } from "next/cache";

function slugify(v: string) {
  return v.toLowerCase().trim().replace(/['"]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function revalidatePeople() {
  revalidatePath("/admin/staff");
  revalidatePath("/admin/locations");
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}

/* ── Staff ─────────────────────────────────────────────────────────────────── */

export type StaffDoc = {
  _id: string;
  name: string;
  displayName?: string;
  slug?: string;
  primaryTitle?: string;
  email?: string;
  bio?: string;
  credentials?: string[];
  education?: string[];
  clinicalFocus?: string[];
  imageAlt?: string;
  status?: string;
  seoTitle?: string;
  seoDescription?: string;
  _updatedAt?: string;
};

export async function fetchStaff(): Promise<StaffDoc[]> {
  return client.fetch<StaffDoc[]>(
    `*[_type == "staffProfile"] | order(name asc) {
      _id, name, displayName, "slug": slug.current, primaryTitle, email, bio,
      credentials, education, clinicalFocus, imageAlt, status,
      seoTitle, seoDescription, _updatedAt
    }`,
    {},
    { next: { revalidate: 30 } }
  );
}

export async function createStaffAction(data: Omit<StaffDoc, "_id">): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc: any = {
    _type: "staffProfile",
    name: data.name,
    slug: { _type: "slug", current: data.slug || slugify(data.name) },
    displayName: data.displayName || "",
    primaryTitle: data.primaryTitle || "",
    email: data.email || "",
    bio: data.bio || "",
    credentials: data.credentials ?? [],
    education: data.education ?? [],
    clinicalFocus: data.clinicalFocus ?? [],
    imageAlt: data.imageAlt || "",
    status: data.status || "draft",
    seoTitle: data.seoTitle || "",
    seoDescription: data.seoDescription || "",
  };
  const created = await adminClient.create(doc);
  revalidatePeople();
  return created._id;
}

export async function updateStaffAction(id: string, data: Partial<StaffDoc>): Promise<void> {
  const patch: Record<string, unknown> = {};
  if (data.name !== undefined)         patch.name = data.name;
  if (data.slug !== undefined)         patch["slug.current"] = data.slug;
  if (data.displayName !== undefined)  patch.displayName = data.displayName;
  if (data.primaryTitle !== undefined) patch.primaryTitle = data.primaryTitle;
  if (data.email !== undefined)        patch.email = data.email;
  if (data.bio !== undefined)          patch.bio = data.bio;
  if (data.credentials !== undefined)  patch.credentials = data.credentials;
  if (data.education !== undefined)    patch.education = data.education;
  if (data.clinicalFocus !== undefined) patch.clinicalFocus = data.clinicalFocus;
  if (data.imageAlt !== undefined)     patch.imageAlt = data.imageAlt;
  if (data.status !== undefined)       patch.status = data.status;
  if (data.seoTitle !== undefined)     patch.seoTitle = data.seoTitle;
  if (data.seoDescription !== undefined) patch.seoDescription = data.seoDescription;
  await adminClient.patch(id).set(patch).commit();
  revalidatePeople();
}

export async function deleteStaffAction(id: string): Promise<void> {
  await adminClient.delete(id);
  revalidatePeople();
}

/* ── Locations ─────────────────────────────────────────────────────────────── */

export type LocationDoc = {
  _id: string;
  name: string;
  slug?: string;
  city?: string;
  state?: string;
  address1?: string;
  address2?: string;
  phone?: string;
  hours?: string;
  mapLink?: string;
  appointmentLink?: string;
  serviceArea?: string;
  status?: string;
  seoTitle?: string;
  seoDescription?: string;
  _updatedAt?: string;
};

export async function fetchLocations(): Promise<LocationDoc[]> {
  return client.fetch<LocationDoc[]>(
    `*[_type == "location"] | order(name asc) {
      _id, name, "slug": slug.current, city, state, address1, address2,
      phone, hours, mapLink, appointmentLink, serviceArea, status,
      seoTitle, seoDescription, _updatedAt
    }`,
    {},
    { next: { revalidate: 30 } }
  );
}

export async function createLocationAction(data: Omit<LocationDoc, "_id">): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc: any = {
    _type: "location",
    name: data.name,
    slug: { _type: "slug", current: data.slug || slugify(data.name) },
    city: data.city || "",
    state: data.state || "",
    address1: data.address1 || "",
    address2: data.address2 || "",
    phone: data.phone || "",
    hours: data.hours || "",
    mapLink: data.mapLink || "",
    appointmentLink: data.appointmentLink || "/contact",
    serviceArea: data.serviceArea || "",
    status: data.status || "draft",
    seoTitle: data.seoTitle || "",
    seoDescription: data.seoDescription || "",
  };
  const created = await adminClient.create(doc);
  revalidatePeople();
  return created._id;
}

export async function updateLocationAction(id: string, data: Partial<LocationDoc>): Promise<void> {
  const patch: Record<string, unknown> = {};
  if (data.name !== undefined)             patch.name = data.name;
  if (data.slug !== undefined)             patch["slug.current"] = data.slug;
  if (data.city !== undefined)             patch.city = data.city;
  if (data.state !== undefined)            patch.state = data.state;
  if (data.address1 !== undefined)         patch.address1 = data.address1;
  if (data.address2 !== undefined)         patch.address2 = data.address2;
  if (data.phone !== undefined)            patch.phone = data.phone;
  if (data.hours !== undefined)            patch.hours = data.hours;
  if (data.mapLink !== undefined)          patch.mapLink = data.mapLink;
  if (data.appointmentLink !== undefined)  patch.appointmentLink = data.appointmentLink;
  if (data.serviceArea !== undefined)      patch.serviceArea = data.serviceArea;
  if (data.status !== undefined)           patch.status = data.status;
  if (data.seoTitle !== undefined)         patch.seoTitle = data.seoTitle;
  if (data.seoDescription !== undefined)   patch.seoDescription = data.seoDescription;
  await adminClient.patch(id).set(patch).commit();
  revalidatePeople();
}

export async function deleteLocationAction(id: string): Promise<void> {
  await adminClient.delete(id);
  revalidatePeople();
}

/* ── Testimonials ──────────────────────────────────────────────────────────── */

export type TestimonialDoc = {
  _id: string;
  name: string;
  slug?: string;
  procedure?: string;
  weightLost?: number;
  shortQuote?: string;
  /** Full patient story (plain text / markdown paragraphs) shown on a detail page */
  fullStory?: string;
  featured?: boolean;
  publishedAt?: string;
  _updatedAt?: string;
};

export async function fetchTestimonials(): Promise<TestimonialDoc[]> {
  return client.fetch<TestimonialDoc[]>(
    `*[_type == "testimonial"] | order(coalesce(publishedAt, _createdAt) desc) {
      _id, name, "slug": slug.current, procedure, weightLost,
      shortQuote, fullStory, featured, publishedAt, _updatedAt
    }`,
    {},
    { next: { revalidate: 30 } }
  );
}

export async function createTestimonialAction(data: Omit<TestimonialDoc, "_id">): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc: any = {
    _type: "testimonial",
    name: data.name,
    slug: { _type: "slug", current: data.slug || slugify(data.name) },
    procedure: data.procedure || "",
    weightLost: data.weightLost ?? 0,
    shortQuote: data.shortQuote || "",
    fullStory: data.fullStory || "",
    featured: data.featured ?? false,
    publishedAt: data.publishedAt || new Date().toISOString(),
  };
  const created = await adminClient.create(doc);
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  return created._id;
}

export async function updateTestimonialAction(id: string, data: Partial<TestimonialDoc>): Promise<void> {
  const patch: Record<string, unknown> = {};
  if (data.name !== undefined)        patch.name = data.name;
  if (data.slug !== undefined)        patch["slug.current"] = data.slug;
  if (data.procedure !== undefined)   patch.procedure = data.procedure;
  if (data.weightLost !== undefined)  patch.weightLost = data.weightLost;
  if (data.shortQuote !== undefined)  patch.shortQuote = data.shortQuote;
  if (data.fullStory !== undefined)   patch.fullStory = data.fullStory;
  if (data.featured !== undefined)    patch.featured = data.featured;
  if (data.publishedAt !== undefined) patch.publishedAt = data.publishedAt;
  await adminClient.patch(id).set(patch).commit();
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}

export async function deleteTestimonialAction(id: string): Promise<void> {
  await adminClient.delete(id);
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}
