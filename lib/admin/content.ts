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
