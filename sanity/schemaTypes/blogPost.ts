import { defineArrayMember, defineField, defineType } from "sanity";

const serviceOptions = [
  { title: "Gastric Sleeve", value: "/services/gastric-sleeve" },
  { title: "Gastric Bypass", value: "/services/gastric-bypass" },
  { title: "Gastric Balloon", value: "/services/gastric-balloon" },
  { title: "Prescription Weight Loss Medications", value: "/services/prescription-weight-loss-medications" },
  { title: "Pricing & Financing", value: "/services/pricing-financing" },
  { title: "Compare Weight Loss Options", value: "/services/compare-weight-loss-options" },
  { title: "Contact JourneyLite", value: "/contact" },
];

export const blogPost = defineType({
  name: "blogPost",
  title: "Blog Post",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
    { name: "settings", title: "Settings" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      description: "The public article headline. Keep it clear and patient-friendly.",
      validation: (rule) => rule.required().min(8).max(110),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      description: "The blog URL. Generate from the title, then edit if needed.",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      group: "content",
      description: "Short summary shown on the blog index and article hero.",
      validation: (rule) => rule.required().min(40).max(220),
    }),
    defineField({
      name: "featuredImage",
      title: "Featured image",
      type: "image",
      group: "content",
      description: "Main image shown on cards and at the top of the article.",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "featuredImageAlt",
      title: "Featured image alt text",
      type: "string",
      group: "content",
      description: "Describe the image for accessibility and SEO. Required when using a featured image.",
      validation: (rule) => rule.required().min(8).max(160),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      group: "content",
      description:
        "Choose the best topic. Suggested categories: Bariatric Surgery, Gastric Sleeve, Gastric Balloon, Weight Loss Medications, Pricing & Financing, Patient Preparation, Nutrition & Lifestyle, Post-Op Support.",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "string" })],
      description: "Optional short labels for internal organization.",
      options: { layout: "tags" },
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }],
      group: "content",
      description: "Optional author shown on the article page.",
    }),
    defineField({
      name: "publishedAt",
      title: "Published date",
      type: "datetime",
      group: "settings",
      description: "Only posts with a published date in the past appear on the site.",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "updatedAt",
      title: "Updated date",
      type: "datetime",
      group: "settings",
      description: "Optional. Use when the article has been meaningfully revised.",
    }),
    defineField({
      name: "body",
      title: "Article body",
      type: "array",
      group: "content",
      description:
        "Write the article here. Use H2/H3 headings, short paragraphs, lists, links, images, and callouts to keep it readable.",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                title: "Link",
                type: "object",
                fields: [
                  defineField({
                    name: "href",
                    title: "URL",
                    type: "url",
                    validation: (rule) =>
                      rule.uri({
                        scheme: ["http", "https", "mailto", "tel"],
                        allowRelative: true,
                      }),
                  }),
                ],
              },
            ],
          },
        }),
        defineArrayMember({
          type: "image",
          title: "Image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt text",
              type: "string",
              description: "Required for article images. Describe the image clearly.",
              validation: (rule) => rule.required().min(8).max(160),
            }),
          ],
        }),
        defineArrayMember({
          name: "callout",
          title: "Callout",
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Callout title",
              type: "string",
            }),
            defineField({
              name: "text",
              title: "Callout text",
              type: "text",
              rows: 3,
            }),
          ],
          preview: {
            select: {
              title: "title",
              subtitle: "text",
            },
          },
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "relatedServices",
      title: "Related service CTAs",
      type: "array",
      group: "settings",
      description: "Choose JourneyLite service links to show near the end of the article.",
      of: [defineArrayMember({ type: "string" })],
      options: { list: serviceOptions },
    }),
    defineField({
      name: "seoTitle",
      title: "SEO title",
      type: "string",
      group: "seo",
      description: "Optional. Aim for roughly 50 to 60 characters. Uses article title if blank.",
      validation: (rule) => rule.max(70).warning("SEO titles usually work best under about 60 characters."),
    }),
    defineField({
      name: "seoDescription",
      title: "SEO description",
      type: "text",
      rows: 3,
      group: "seo",
      description: "Optional. Aim for roughly 150 to 160 characters. Uses excerpt if blank.",
      validation: (rule) => rule.max(170).warning("Meta descriptions usually work best around 150 to 160 characters."),
    }),
    defineField({
      name: "ogImage",
      title: "Social share image",
      type: "image",
      group: "seo",
      description: "Optional. Uses featured image if blank.",
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "category.name",
      media: "featuredImage",
    },
  },
});
