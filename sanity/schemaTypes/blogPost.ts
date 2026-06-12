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


const ctaFields = [
  defineField({
    name: "label",
    title: "Button label",
    type: "string",
    validation: (rule) => rule.max(60),
  }),
  defineField({
    name: "href",
    title: "Button URL",
    type: "url",
    validation: (rule) =>
      rule.uri({
        scheme: ["http", "https", "mailto", "tel"],
        allowRelative: true,
      }),
  }),
];

export const factCardsMember = defineArrayMember({
  name: "factCards",
  title: "Fact cards",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Section title",
      type: "string",
      initialValue: "Quick facts",
    }),
    defineField({
      name: "cards",
      title: "Cards",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (rule) => rule.required().max(60),
            }),
            defineField({
              name: "value",
              title: "Value",
              type: "string",
              validation: (rule) => rule.max(80),
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "text",
              rows: 2,
              validation: (rule) => rule.max(180),
            }),
          ],
          preview: {
            select: {
              title: "label",
              subtitle: "value",
            },
          },
        }),
      ],
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare: ({ title }) => ({
      title: title || "Fact cards",
      subtitle: "Inline fact card section",
    }),
  },
});

export const ctaBlockMember = defineArrayMember({
  name: "ctaBlock",
  title: "CTA block",
  type: "object",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow text",
      type: "string",
      validation: (rule) => rule.max(50),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "text",
      title: "Supporting text",
      type: "text",
      rows: 3,
      validation: (rule) => rule.max(260),
    }),
    defineField({
      name: "primaryCta",
      title: "Primary button",
      type: "object",
      fields: ctaFields,
    }),
    defineField({
      name: "secondaryCta",
      title: "Secondary button",
      type: "object",
      fields: ctaFields,
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "eyebrow",
    },
  },
});

export const sectionBreakMember = defineArrayMember({
  name: "sectionBreak",
  title: "Section break",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Optional label",
      type: "string",
      validation: (rule) => rule.max(80),
    }),
  ],
  preview: {
    select: { title: "label" },
    prepare: ({ title }) => ({ title: title || "Section break" }),
  },
});

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
      name: "keyTakeaways",
      title: "Key takeaways",
      type: "array",
      group: "content",
      description: "Optional bullets shown near the top of the article.",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.max(6),
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
      name: "isMigrated",
      title: "Migrated from WordPress",
      type: "boolean",
      group: "settings",
      description: "Set automatically during migration. Marks posts imported from the legacy WordPress blog.",
      initialValue: false,
      hidden: true,
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
        factCardsMember,
        ctaBlockMember,
        sectionBreakMember,
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "showSources",
      title: "Show sources section",
      type: "boolean",
      group: "settings",
      description: "Turn on to show the Sources section at the bottom of the article.",
      initialValue: false,
    }),
    defineField({
      name: "sources",
      title: "Sources",
      type: "array",
      group: "settings",
      description: "Optional citations or references shown only when the sources section is enabled.",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Source title",
              type: "string",
              validation: (rule) => rule.required().max(180),
            }),
            defineField({
              name: "publisher",
              title: "Publisher",
              type: "string",
              validation: (rule) => rule.max(120),
            }),
            defineField({
              name: "url",
              title: "URL",
              type: "url",
              validation: (rule) =>
                rule.uri({
                  scheme: ["http", "https"],
                }),
            }),
            defineField({
              name: "note",
              title: "Optional note",
              type: "text",
              rows: 2,
              validation: (rule) => rule.max(220),
            }),
          ],
          preview: {
            select: {
              title: "title",
              subtitle: "publisher",
            },
          },
        }),
      ],
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
    defineField({
      name: "htmlBody",
      title: "Article body (HTML — admin editor)",
      type: "text",
      group: "content",
      description:
        "HTML content written via the admin portal rich-text editor. When present, this is used instead of the 'Article body' Portable Text field.",
      hidden: ({ document }) => !document?.htmlBody,
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
