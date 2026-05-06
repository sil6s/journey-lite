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
  "author": author->{name, title, bio, credentials, image{..., asset->}}
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

export const categoriesQuery = groq`
  *[_type == "category"] | order(name asc) {
    name,
    "slug": slug.current,
    description
  }
`;
