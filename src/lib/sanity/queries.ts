import { groq } from "next-sanity";

const postFields = groq`
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  updatedAt,
  seoTitle,
  seoDescription,
  featuredImage,
  featuredImageAlt,
  ogImage,
  tags,
  relatedServices,
  "category": category->{name, "slug": slug.current, description},
  "author": author->{name, title, bio, credentials, image}
`;

export const postsQuery = groq`
  *[_type == "blogPost" && defined(slug.current) && defined(publishedAt) && publishedAt <= now()]
  | order(publishedAt desc) {
    ${postFields}
  }
`;

export const postSlugsQuery = groq`
  *[_type == "blogPost" && defined(slug.current) && defined(publishedAt) && publishedAt <= now()] {
    "slug": slug.current,
    updatedAt,
    publishedAt
  }
`;

export const postBySlugQuery = groq`
  *[_type == "blogPost" && slug.current == $slug && defined(publishedAt) && publishedAt <= now()][0] {
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
      _type == "blogPost" &&
      defined(slug.current) &&
      slug.current != $slug &&
      defined(publishedAt) &&
      publishedAt <= now()
    ] | order(publishedAt desc)[0...3] {
      ${postFields}
    }
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
