import { groq } from "next-sanity";

const blogDocumentFilter = groq`
  _type in ["blogPost", "post"] &&
  defined(slug.current) &&
  (!defined(publishedAt) || publishedAt <= now())
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
  isMigrated
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

export const migratedPostsQuery = groq`
  *[
    _type == "blogPost" &&
    isMigrated == true &&
    defined(slug.current) &&
    (!defined(publishedAt) || publishedAt <= now())
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
