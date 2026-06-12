import { groq } from "next-sanity";

const blogDocumentFilter = groq`
  _type in ["blogPost", "post"] &&
  defined(slug.current) &&
  (!defined(publishedAt) || publishedAt <= now()) &&
  !(
    slug.current in ["esg", "endoscopic-sleeve-gastroplasty-a-new-tool"] ||
    title match "Endoscopic Sleeve Gastroplasty" ||
    title match "AspireAssist" ||
    title match "Aspire Assist" ||
    pt::text(body) match "endoscopic sleeve gastroplasty" ||
    pt::text(body) match "ESG" ||
    pt::text(body) match "AspireAssist" ||
    pt::text(body) match "Aspire Assist"
  )
`;

const postFields = groq`
  _id,
  _type,
  title,
  "slug": slug.current,
  "excerpt": coalesce(excerpt, pt::text(body[0...1])),
  publishedAt,
  updatedAt,
  keyTakeaways,
  showSources,
  sources[] {
    title,
    publisher,
    url,
    note
  },
  seoTitle,
  seoDescription,
  "featuredImage": coalesce(featuredImage, image),
  "featuredImageAlt": coalesce(featuredImageAlt, image.alt),
  ogImage,
  tags,
  relatedServices,
  "category": category->{name, "slug": slug.current, description},
  "author": author->{name, title, bio, credentials, image{..., asset->}},
  isMigrated,
  htmlBody
`;

export const postsQuery = groq`
  *[${blogDocumentFilter}]
  | order(coalesce(publishedAt, _createdAt) desc) {
    ${postFields}
  }
`;

export const postSlugsQuery = groq`
  *[${blogDocumentFilter}]
  | order(coalesce(publishedAt, _createdAt) desc) {
    "slug": slug.current,
    updatedAt,
    publishedAt
  }
`;

export const postBySlugQuery = groq`
  *[${blogDocumentFilter} && slug.current == $slug][0] {
    ${postFields},
    body[] {
      ...,
      _type == "image" => {
        ...,
        asset->,
        alt
      }
    },
    "relatedPosts": *[
      ${blogDocumentFilter} &&
      slug.current != $slug
    ] | order(coalesce(publishedAt, _createdAt) desc)[0...3] {
      ${postFields}
    }
  }
`;

export const newPostsQuery = groq`
  *[
    ${blogDocumentFilter} &&
    isMigrated != true
    && ($category == null || category->slug.current == $category)
  ] | order(coalesce(publishedAt, _createdAt) desc) {
    ${postFields}
  }
`;

export const migratedPostsQuery = groq`
  *[
    _type == "blogPost" &&
    isMigrated == true &&
    defined(slug.current) &&
    (!defined(publishedAt) || publishedAt <= now())
    && ($category == null || category->slug.current == $category)
  ] | order(coalesce(publishedAt, _createdAt) desc) {
    ${postFields}
  }
`;

export const categoriesQuery = groq`
  *[_type == "category"] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    description
  }
`;

export const adminPostsQuery = groq`
  *[_type == "blogPost"] | order(coalesce(updatedAt, publishedAt) desc) {
    ${postFields},
    "status": select(
      _id in path("drafts.**") => "draft",
      !defined(publishedAt) => "draft",
      publishedAt > now() => "scheduled",
      "published"
    ),
    "readingTime": round(length(pt::text(body)) / 1100) + 1,
    "bodyText": pt::text(body)
  }
`;

export const adminAuthorsQuery = groq`
  *[_type == "author"] | order(name asc) {
    _id,
    name,
    title,
    credentials,
    bio
  }
`;

export const adminStatsQuery = groq`
  {
    "publishedPosts": count(*[_type == "blogPost" && defined(publishedAt) && publishedAt <= now()]),
    "draftPosts": count(*[_type == "blogPost" && (_id in path("drafts.**") || !defined(publishedAt))]),
    "categories": count(*[_type == "category"]),
    "authors": count(*[_type == "author"]),
    "recentPosts": *[_type == "blogPost"] | order(coalesce(updatedAt, publishedAt) desc)[0...6] {
      _id,
      title,
      "slug": slug.current,
      publishedAt,
      updatedAt,
      "status": select(
        _id in path("drafts.**") => "draft",
        !defined(publishedAt) => "draft",
        publishedAt > now() => "scheduled",
        "published"
      ),
      "category": category->{name, "slug": slug.current}
    }
  }
`;

const formDefinitionFields = groq`
  _id,
  name,
  "key": key.current,
  status,
  title,
  introText,
  successMessage,
  errorMessage,
  submitButtonLabel,
  notificationEmails,
  brevoListId,
  brevoTags,
  redirectUrl,
  spamProtection,
  fields[] {
    _key,
    label,
    "key": key.current,
    type,
    placeholder,
    helpText,
    required,
    options[] { label, value },
    validation,
    defaultValue,
    width,
    adminNote
  }
`;

const sitePageSectionFields = groq`
  ...,
  _type == "embeddedForm" => {
    ...,
    "form": form->{
      ${formDefinitionFields}
    }
  },
  _type == "relatedResources" => {
    ...,
    "resources": resources[]->{
      ${postFields}
    }
  },
  _type == "richTextSection" => {
    ...,
    content[] {
      ...,
      _type == "image" => {
        ...,
        asset->
      }
    }
  }
`;

const sitePageFields = groq`
  _id,
  title,
  "slug": slug.current,
  status,
  pageType,
  internalDescription,
  heroHeadline,
  heroSubheadline,
  heroImage,
  heroImageAlt,
  primaryCta,
  secondaryCta,
  sections[] {
    ${sitePageSectionFields}
  },
  seoTitle,
  seoDescription,
  focusKeyword,
  ogImage,
  publishDate,
  lastReviewedDate,
  featured,
  visibility,
  "reviewer": reviewer->{name, title, bio, credentials, image{..., asset->}}
`;

export const sitePageSlugsQuery = groq`
  *[
    _type == "sitePage" &&
    status == "published" &&
    defined(slug.current) &&
    (!defined(publishDate) || publishDate <= now())
  ] {
    "slug": slug.current
  }
`;

export const sitePageBySlugQuery = groq`
  *[
    _type == "sitePage" &&
    status == "published" &&
    defined(slug.current) &&
    slug.current == $slug &&
    (!defined(publishDate) || publishDate <= now())
  ][0] {
    ${sitePageFields}
  }
`;

export const formDefinitionByKeyQuery = groq`
  *[
    _type == "formDefinition" &&
    status == "active" &&
    key.current == $key
  ][0] {
    ${formDefinitionFields}
  }
`;

export const adminSitePagesQuery = groq`
  *[_type == "sitePage"] | order(coalesce(publishDate, _updatedAt) desc) {
    _id,
    title,
    "slug": slug.current,
    status,
    pageType,
    visibility,
    featured,
    publishDate,
    _updatedAt
  }
`;

export const adminFormDefinitionsQuery = groq`
  *[_type == "formDefinition"] | order(name asc) {
    _id,
    name,
    "key": key.current,
    status,
    title
  }
`;

// Testimonial fields reused across queries
const testimonialCardFields = groq`
  _id,
  name,
  procedure,
  weightLost,
  shortQuote,
  "slug": slug.current,
  beforePhoto { asset->, alt },
  afterPhoto { asset->, alt }
`;

export const featuredTestimonialsQuery = groq`
  *[_type == "testimonial" && featured == true] | order(weightLost desc) {
    ${testimonialCardFields}
  }
`;

export const allTestimonialsQuery = groq`
  *[_type == "testimonial"] | order(weightLost desc) {
    ${testimonialCardFields}
  }
`;

export const testimonialSlugsQuery = groq`
  *[_type == "testimonial" && defined(slug.current)] {
    "slug": slug.current
  }
`;

export const testimonialBySlugQuery = groq`
  *[_type == "testimonial" && slug.current == $slug][0] {
    _id,
    name,
    procedure,
    weightLost,
    fullStory,
    beforePhoto { asset->, alt },
    afterPhoto { asset->, alt }
  }
`;
