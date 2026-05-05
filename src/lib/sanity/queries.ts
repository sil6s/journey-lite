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
    name,
    "slug": slug.current,
    description
  }
`;
