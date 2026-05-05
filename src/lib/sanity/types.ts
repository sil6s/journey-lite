import type { PortableTextBlock } from "next-sanity";

export type SanityImageAsset = {
  _type: "image";
  asset?: {
    _ref?: string;
    url?: string;
  };
};

export type BlogCategory = {
  name?: string;
  slug?: string;
  description?: string;
};

export type BlogAuthor = {
  name?: string;
  title?: string;
  bio?: string;
  credentials?: string;
  image?: SanityImageAsset;
};

export type BlogPost = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt?: string;
  updatedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  featuredImage?: SanityImageAsset;
  featuredImageAlt?: string;
  ogImage?: SanityImageAsset;
  tags?: string[];
  relatedServices?: string[];
  category?: BlogCategory;
  author?: BlogAuthor;
  body?: PortableTextBlock[];
  relatedPosts?: BlogPost[];
};
