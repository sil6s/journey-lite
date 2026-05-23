import { client } from "@/src/lib/sanity/client";
import { adminAuthorsQuery, adminPostsQuery, adminStatsQuery, categoriesQuery } from "@/src/lib/sanity/queries";
import type { BlogCategory, BlogPost } from "@/src/lib/sanity/types";
import {
  cincinnatiLocation,
  injectableMedicationOptions,
  locationGroups,
  medicationSupportOptions,
  nonSurgicalOptions,
  oralMedicationOptions,
  physicianCards,
  reviewCards,
  surgicalOptions,
} from "@/app/components/data";

export type AdminBlogPost = BlogPost & {
  status?: "published" | "draft" | "scheduled" | "archived";
  readingTime?: number;
  bodyText?: string;
};

export type AdminAuthor = {
  _id: string;
  name?: string;
  title?: string;
  credentials?: string;
  bio?: string;
};

export type ManagedStaffProfile = {
  _id?: string;
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
  source?: "sanity" | "website";
};

export type ManagedLocation = {
  _id?: string;
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
  source?: "sanity" | "website";
};

export type AdminStats = {
  publishedPosts: number;
  draftPosts: number;
  categories: number;
  authors: number;
  recentPosts: AdminBlogPost[];
};

export async function getAdminContentData() {
  try {
    const [posts, categories, authors, stats] = await Promise.all([
      client.fetch<AdminBlogPost[]>(adminPostsQuery, {}, { next: { revalidate: 60 } }),
      client.fetch<BlogCategory[]>(categoriesQuery, {}, { next: { revalidate: 300 } }),
      client.fetch<AdminAuthor[]>(adminAuthorsQuery, {}, { next: { revalidate: 300 } }),
      client.fetch<AdminStats>(adminStatsQuery, {}, { next: { revalidate: 60 } }),
    ]);

    return {
      posts,
      categories,
      authors,
      stats,
      services: getServiceRows(),
      staff: physicianCards,
      locations: getLocationRows(),
      testimonials: reviewCards,
    };
  } catch {
    return {
      posts: [] as AdminBlogPost[],
      categories: [] as BlogCategory[],
      authors: [] as AdminAuthor[],
      stats: {
        publishedPosts: 0,
        draftPosts: 0,
        categories: 0,
        authors: 0,
        recentPosts: [] as AdminBlogPost[],
      },
      services: getServiceRows(),
      staff: physicianCards,
      locations: getLocationRows(),
      testimonials: reviewCards,
    };
  }
}

export function getServiceRows() {
  return [
    ...surgicalOptions.map((item) => ({ ...item, group: "Surgical" })),
    ...nonSurgicalOptions.map((item) => ({ ...item, group: "Non-surgical" })),
    ...injectableMedicationOptions.map((item) => ({ ...item, group: "Injectable medication" })),
    ...oralMedicationOptions.map((item) => ({ ...item, group: "Oral medication" })),
    ...medicationSupportOptions.map((item) => ({ ...item, group: "Medication support" })),
  ];
}

export function getLocationRows() {
  return [
    ...cincinnatiLocation.panels.map((panel) => ({
      city: panel.title,
      state: "OH",
      phone: panel.voice,
      address1: cincinnatiLocation.address1,
      address2: cincinnatiLocation.address2,
      href: cincinnatiLocation.directions,
      group: "Cincinnati",
    })),
    ...locationGroups.flatMap((group) =>
      group.locations.map((location) => ({
        ...location,
        group: group.state,
      })),
    ),
  ];
}

export async function getManagedStaffProfiles(): Promise<ManagedStaffProfile[]> {
  const fallback = physicianCards.map((person) => ({
    name: person.name,
    displayName: person.displayName,
    slug: person.slug,
    primaryTitle: person.primaryTitle,
    email: person.email,
    bio: person.bio,
    credentials: person.certificationLicensure,
    education: person.education,
    clinicalFocus: person.clinicalFocus,
    imageAlt: person.avatarAlt,
    status: "published",
    source: "website" as const,
  }));

  try {
    const docs = await client.fetch<ManagedStaffProfile[]>(
      `*[_type == "staffProfile"] | order(name asc) {
        _id, name, displayName, "slug": slug.current, primaryTitle, email, bio, credentials,
        education, clinicalFocus, imageAlt, status, seoTitle, seoDescription
      }`,
      {},
      { next: { revalidate: 30 } },
    );
    return [...docs.map((doc) => ({ ...doc, source: "sanity" as const })), ...fallback.filter((item) => !docs.some((doc) => doc.slug === item.slug))];
  } catch {
    return fallback;
  }
}

export async function getManagedLocations(): Promise<ManagedLocation[]> {
  const fallback = getLocationRows().map((location) => ({
    name: `${location.city}, ${location.state}`,
    slug: slugify(`${location.city}-${location.state}`),
    city: location.city,
    state: location.state,
    address1: location.address1,
    address2: location.address2,
    phone: location.phone,
    hours: "hours" in location ? String(location.hours ?? "") : "",
    mapLink: "directions" in location ? String(location.directions ?? "") : location.href,
    appointmentLink: "/contact",
    serviceArea: location.group,
    status: "published",
    source: "website" as const,
  }));

  try {
    const docs = await client.fetch<ManagedLocation[]>(
      `*[_type == "location"] | order(name asc) {
        _id, name, "slug": slug.current, city, state, address1, address2, phone, hours,
        mapLink, appointmentLink, serviceArea, status, seoTitle, seoDescription
      }`,
      {},
      { next: { revalidate: 30 } },
    );
    return [...docs.map((doc) => ({ ...doc, source: "sanity" as const })), ...fallback.filter((item) => !docs.some((doc) => doc.slug === item.slug))];
  } catch {
    return fallback;
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
