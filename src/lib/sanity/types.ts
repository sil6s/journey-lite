import type { PortableTextBlock } from "next-sanity";

export type SanityImageAsset = {
  _type: "image";
  asset?: {
    _ref?: string;
    url?: string;
  };
};

export type BlogCategory = {
  _id: string;
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

export type BlogSource = {
  title?: string;
  publisher?: string;
  url?: string;
  note?: string;
};

export type BlogPost = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt?: string;
  updatedAt?: string;
  keyTakeaways?: string[];
  showSources?: boolean;
  sources?: BlogSource[];
  seoTitle?: string;
  seoDescription?: string;
  featuredImage?: SanityImageAsset;
  featuredImageAlt?: string;
  ogImage?: SanityImageAsset;
  tags?: string[];
  relatedServices?: string[];
  category?: BlogCategory;
  author?: BlogAuthor;
  isMigrated?: boolean;
  body?: PortableTextBlock[];
  htmlBody?: string;
  relatedPosts?: BlogPost[];
};

export type TestimonialPhoto = {
  asset?: {
    _ref?: string;
    url?: string;
  };
  alt?: string;
};

export type TestimonialCard = {
  _id: string;
  name: string;
  procedure: string;
  weightLost: number;
  shortQuote: string;
  slug: string;
  beforePhoto: TestimonialPhoto;
  afterPhoto: TestimonialPhoto;
};

export type TestimonialFull = {
  _id: string;
  name: string;
  procedure: string;
  weightLost: number;
  fullStory?: PortableTextBlock[];
  beforePhoto: TestimonialPhoto;
  afterPhoto: TestimonialPhoto;
};

export type CtaLink = {
  label?: string;
  url?: string;
  href?: string;
};

export type SiteNavItem = {
  _key?: string;
  label: string;
  href: string;
  description?: string;
  hidden?: boolean;
};

export type SiteNavGroup = {
  _key?: string;
  label: string;
  items: SiteNavItem[];
};

export type SiteSettings = {
  _id?: string;
  title?: string;
  navGroups?: SiteNavGroup[];
};

export type ReactPageContentBlock = {
  _key?: string;
  heading?: string;
  body?: string;
  link?: CtaLink;
};

export type ReactPageOverride = {
  _id: string;
  title: string;
  path: string;
  status?: "active" | "draft" | "archived";
  adminWarning?: string;
  eyebrow?: string;
  headline?: string;
  summary?: string;
  contentBlocks?: ReactPageContentBlock[];
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  robots?: "index,follow" | "noindex,follow" | "noindex,nofollow";
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: SanityImageAsset;
  structuredDataType?: "WebPage" | "MedicalWebPage" | "AboutPage" | "ContactPage" | "CollectionPage";
  _updatedAt?: string;
};

export type FormFieldOption = {
  label?: string;
  value?: string;
};

export type FormFieldDefinition = {
  _key?: string;
  label?: string;
  key?: string;
  type:
    | "text"
    | "email"
    | "phone"
    | "textarea"
    | "number"
    | "date"
    | "select"
    | "radio"
    | "checkboxGroup"
    | "checkbox"
    | "file"
    | "hidden"
    | "consent";
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  options?: FormFieldOption[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  acceptedFileTypes?: string[];
  maxFileSizeMb?: number;
  defaultValue?: string;
  width?: "full" | "half";
  adminNote?: string;
};

export type FormDefinition = {
  _id: string;
  name: string;
  key: string;
  status?: "active" | "inactive" | "archived";
  title?: string;
  introText?: string;
  successMessage?: string;
  errorMessage?: string;
  submitButtonLabel?: string;
  notificationEmails?: string[];
  brevoListId?: number;
  brevoTags?: string[];
  redirectUrl?: string;
  spamProtection?: {
    honeypot?: boolean;
    honeypotFieldName?: string;
  };
  fields?: FormFieldDefinition[];
};

export type SitePageSection = {
  _key?: string;
  _type: string;
  [key: string]: unknown;
};

export type SitePage = {
  _id: string;
  title: string;
  slug: string;
  status?: "draft" | "published" | "archived";
  pageType?: "service" | "campaign" | "education" | "financing" | "procedure" | "faq" | "general";
  internalDescription?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  heroImage?: SanityImageAsset;
  heroImageAlt?: string;
  primaryCta?: CtaLink;
  secondaryCta?: CtaLink;
  sections?: SitePageSection[];
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  ogImage?: SanityImageAsset;
  publishDate?: string;
  lastReviewedDate?: string;
  featured?: boolean;
  visibility?: "public" | "unlisted";
  reviewer?: BlogAuthor;
};
