import { defineArrayMember, defineField, defineType } from "sanity";

const pageTypes = [
  { title: "Service", value: "service" },
  { title: "Campaign", value: "campaign" },
  { title: "Education", value: "education" },
  { title: "Financing", value: "financing" },
  { title: "Procedure", value: "procedure" },
  { title: "FAQ", value: "faq" },
  { title: "General", value: "general" },
];

const ctaFields = [
  defineField({ name: "label", title: "Label", type: "string", validation: (rule) => rule.max(70) }),
  defineField({
    name: "url",
    title: "URL",
    type: "url",
    validation: (rule) => rule.uri({ scheme: ["http", "https", "mailto", "tel"], allowRelative: true }),
  }),
];

const richTextMember = defineArrayMember({
  name: "richTextSection",
  title: "Rich text content block",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string", validation: (rule) => rule.max(60) }),
    defineField({ name: "heading", title: "Heading", type: "string", validation: (rule) => rule.max(140) }),
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          marks: {
            annotations: [
              defineArrayMember({
                name: "link",
                type: "object",
                fields: [
                  defineField({
                    name: "href",
                    title: "URL",
                    type: "url",
                    validation: (rule) => rule.uri({ scheme: ["http", "https", "mailto", "tel"], allowRelative: true }),
                  }),
                ],
              }),
            ],
          },
        }),
        defineArrayMember({ type: "image", options: { hotspot: true } }),
      ],
    }),
  ],
  preview: { select: { title: "heading", subtitle: "eyebrow" } },
});

const imageTextMember = defineArrayMember({
  name: "imageTextSection",
  title: "Image + text section",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string", validation: (rule) => rule.max(60) }),
    defineField({ name: "heading", title: "Heading", type: "string", validation: (rule) => rule.max(140) }),
    defineField({ name: "text", title: "Text", type: "text", rows: 5, validation: (rule) => rule.max(800) }),
    defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true } }),
    defineField({ name: "imageAlt", title: "Image alt text", type: "string", validation: (rule) => rule.max(160) }),
    defineField({
      name: "imagePosition",
      title: "Image position",
      type: "string",
      options: { list: [{ title: "Left", value: "left" }, { title: "Right", value: "right" }], layout: "radio" },
      initialValue: "right",
    }),
    defineField({ name: "cta", title: "Optional button", type: "object", fields: ctaFields }),
  ],
  preview: { select: { title: "heading", subtitle: "eyebrow" } },
});

const twoColumnMember = defineArrayMember({
  name: "twoColumnSection",
  title: "Two-column content section",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string", validation: (rule) => rule.max(140) }),
    defineField({ name: "leftTitle", title: "Left column title", type: "string", validation: (rule) => rule.max(100) }),
    defineField({ name: "leftText", title: "Left column text", type: "text", rows: 5, validation: (rule) => rule.max(800) }),
    defineField({ name: "rightTitle", title: "Right column title", type: "string", validation: (rule) => rule.max(100) }),
    defineField({ name: "rightText", title: "Right column text", type: "text", rows: 5, validation: (rule) => rule.max(800) }),
  ],
  preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title: title || "Two-column section" }) },
});

const faqMember = defineArrayMember({
  name: "faqBlock",
  title: "FAQ block",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string", initialValue: "Frequently asked questions", validation: (rule) => rule.max(140) }),
    defineField({
      name: "items",
      title: "Questions",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "question", title: "Question", type: "string", validation: (rule) => rule.required().max(180) }),
            defineField({ name: "answer", title: "Answer", type: "text", rows: 4, validation: (rule) => rule.required().max(900) }),
          ],
          preview: { select: { title: "question" } },
        }),
      ],
    }),
  ],
  preview: { select: { title: "heading" } },
});

const simpleItems = [
  defineField({ name: "label", title: "Label", type: "string", validation: (rule) => rule.max(100) }),
  defineField({ name: "value", title: "Value", type: "string", validation: (rule) => rule.max(100) }),
  defineField({ name: "text", title: "Text", type: "text", rows: 3, validation: (rule) => rule.max(400) }),
];

const cardGridMember = defineArrayMember({
  name: "cardGrid",
  title: "Card grid",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string", validation: (rule) => rule.max(140) }),
    defineField({
      name: "cards",
      title: "Cards",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required().max(110) }),
            defineField({ name: "text", title: "Text", type: "text", rows: 3, validation: (rule) => rule.max(400) }),
            defineField({ name: "link", title: "Link", type: "object", fields: ctaFields }),
          ],
          preview: { select: { title: "title" } },
        }),
      ],
    }),
  ],
  preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title: title || "Card grid" }) },
});

const processMember = defineArrayMember({
  name: "processSteps",
  title: "Process/steps section",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string", validation: (rule) => rule.max(140) }),
    defineField({
      name: "steps",
      title: "Steps",
      type: "array",
      of: [defineArrayMember({ type: "object", fields: simpleItems, preview: { select: { title: "label", subtitle: "value" } } })],
    }),
  ],
  preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title: title || "Process steps" }) },
});

const buttonGroupMember = defineArrayMember({
  name: "buttonGroup",
  title: "Button group",
  type: "object",
  fields: [
    defineField({ name: "alignment", title: "Alignment", type: "string", options: { list: ["left", "center"], layout: "radio" }, initialValue: "left" }),
    defineField({
      name: "buttons",
      title: "Buttons",
      type: "array",
      of: [defineArrayMember({ type: "object", fields: ctaFields, preview: { select: { title: "label", subtitle: "url" } } })],
      validation: (rule) => rule.max(4),
    }),
  ],
  preview: { prepare: () => ({ title: "Button group" }) },
});

const embeddedFormMember = defineArrayMember({
  name: "embeddedForm",
  title: "Embedded form block",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Optional section heading", type: "string", validation: (rule) => rule.max(140) }),
    defineField({ name: "introText", title: "Optional intro text", type: "text", rows: 3, validation: (rule) => rule.max(360) }),
    defineField({ name: "form", title: "Form definition", type: "reference", to: [{ type: "formDefinition" }], validation: (rule) => rule.required() }),
  ],
  preview: { select: { title: "heading", subtitle: "form.name" }, prepare: ({ title, subtitle }) => ({ title: title || "Embedded form", subtitle }) },
});

export const sitePage = defineType({
  name: "sitePage",
  title: "Site Page",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
    { name: "settings", title: "Settings" },
  ],
  fields: [
    defineField({ name: "title", title: "Page title", type: "string", group: "content", validation: (rule) => rule.required().max(120) }),
    defineField({ name: "slug", title: "Slug", type: "slug", group: "content", options: { source: "title", maxLength: 96 }, validation: (rule) => rule.required() }),
    defineField({
      name: "status",
      title: "Page status",
      type: "string",
      group: "settings",
      options: { list: [{ title: "Draft", value: "draft" }, { title: "Published", value: "published" }, { title: "Archived", value: "archived" }], layout: "radio" },
      initialValue: "draft",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "pageType", title: "Page type/category", type: "string", group: "settings", options: { list: pageTypes, layout: "dropdown" }, initialValue: "general" }),
    defineField({ name: "internalDescription", title: "Internal description", type: "text", rows: 3, group: "settings", validation: (rule) => rule.max(400) }),
    defineField({ name: "heroHeadline", title: "Hero headline", type: "string", group: "content", validation: (rule) => rule.max(140) }),
    defineField({ name: "heroSubheadline", title: "Hero subheadline", type: "text", rows: 3, group: "content", validation: (rule) => rule.max(420) }),
    defineField({ name: "heroImage", title: "Hero image", type: "image", group: "content", options: { hotspot: true } }),
    defineField({ name: "heroImageAlt", title: "Hero image alt text", type: "string", group: "content", validation: (rule) => rule.max(160) }),
    defineField({ name: "primaryCta", title: "Primary CTA", type: "object", group: "content", fields: ctaFields }),
    defineField({ name: "secondaryCta", title: "Secondary CTA", type: "object", group: "content", fields: ctaFields }),
    defineField({
      name: "sections",
      title: "Flexible page sections",
      type: "array",
      group: "content",
      of: [
        richTextMember,
        imageTextMember,
        twoColumnMember,
        defineArrayMember({ name: "ctaBanner", title: "CTA banner", type: "object", fields: [
          defineField({ name: "eyebrow", title: "Eyebrow", type: "string", validation: (rule) => rule.max(60) }),
          defineField({ name: "heading", title: "Heading", type: "string", validation: (rule) => rule.required().max(140) }),
          defineField({ name: "text", title: "Text", type: "text", rows: 3, validation: (rule) => rule.max(420) }),
          defineField({ name: "primaryCta", title: "Primary CTA", type: "object", fields: ctaFields }),
          defineField({ name: "secondaryCta", title: "Secondary CTA", type: "object", fields: ctaFields }),
        ], preview: { select: { title: "heading", subtitle: "eyebrow" } } }),
        faqMember,
        defineArrayMember({ name: "testimonialBlock", title: "Testimonial block", type: "object", fields: [
          defineField({ name: "quote", title: "Quote", type: "text", rows: 4, validation: (rule) => rule.required().max(700) }),
          defineField({ name: "name", title: "Name", type: "string", validation: (rule) => rule.max(100) }),
          defineField({ name: "context", title: "Context", type: "string", validation: (rule) => rule.max(140) }),
        ], preview: { select: { title: "name", subtitle: "context" }, prepare: ({ title, subtitle }) => ({ title: title || "Testimonial", subtitle }) } }),
        defineArrayMember({ name: "statsHighlights", title: "Stats/highlights block", type: "object", fields: [
          defineField({ name: "heading", title: "Heading", type: "string", validation: (rule) => rule.max(140) }),
          defineField({ name: "items", title: "Highlights", type: "array", of: [defineArrayMember({ type: "object", fields: simpleItems, preview: { select: { title: "value", subtitle: "label" } } })] }),
        ], preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title: title || "Stats/highlights" }) } }),
        cardGridMember,
        processMember,
        defineArrayMember({ name: "calloutBox", title: "Callout box", type: "object", fields: [
          defineField({ name: "heading", title: "Heading", type: "string", validation: (rule) => rule.max(140) }),
          defineField({ name: "text", title: "Text", type: "text", rows: 4, validation: (rule) => rule.max(700) }),
        ], preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title: title || "Callout box" }) } }),
        buttonGroupMember,
        defineArrayMember({ name: "dividerSpacer", title: "Divider/spacer", type: "object", fields: [
          defineField({ name: "showLine", title: "Show divider line", type: "boolean", initialValue: true }),
          defineField({ name: "size", title: "Spacing size", type: "string", options: { list: ["small", "medium", "large"], layout: "radio" }, initialValue: "medium" }),
        ], preview: { prepare: () => ({ title: "Divider/spacer" }) } }),
        defineArrayMember({ name: "relatedResources", title: "Related resources block", type: "object", fields: [
          defineField({ name: "heading", title: "Heading", type: "string", initialValue: "Related resources", validation: (rule) => rule.max(140) }),
          defineField({ name: "resources", title: "Resources", type: "array", of: [defineArrayMember({ type: "reference", to: [{ type: "blogPost" }, { type: "post" }] })] }),
        ], preview: { select: { title: "heading" } } }),
        embeddedFormMember,
      ],
    }),
    defineField({ name: "seoTitle", title: "SEO title", type: "string", group: "seo", validation: (rule) => rule.max(70) }),
    defineField({ name: "seoDescription", title: "SEO description", type: "text", rows: 3, group: "seo", validation: (rule) => rule.max(170) }),
    defineField({ name: "focusKeyword", title: "Focus keyword", type: "string", group: "seo", validation: (rule) => rule.max(80) }),
    defineField({ name: "ogImage", title: "Open Graph image", type: "image", group: "seo", options: { hotspot: true } }),
    defineField({ name: "publishDate", title: "Publish date", type: "datetime", group: "settings" }),
    defineField({ name: "lastReviewedDate", title: "Last reviewed date", type: "date", group: "settings" }),
    defineField({ name: "reviewer", title: "Reviewer/author", type: "reference", group: "settings", to: [{ type: "author" }, { type: "staffProfile" }] }),
    defineField({ name: "featured", title: "Featured/pinned", type: "boolean", group: "settings", initialValue: false }),
    defineField({
      name: "visibility",
      title: "Visibility",
      type: "string",
      group: "settings",
      options: { list: [{ title: "Public", value: "public" }, { title: "Unlisted", value: "unlisted" }], layout: "radio" },
      initialValue: "public",
    }),
    defineField({
      name: "htmlBody",
      title: "Page body (HTML — admin editor)",
      type: "text",
      group: "content",
      description: "HTML content written via the admin portal editor. When present, this is used instead of the sections array.",
      hidden: ({ document }) => !document?.htmlBody,
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "slug.current", status: "status" },
    prepare: ({ title, subtitle, status }) => ({ title: title || "Untitled page", subtitle: [subtitle, status].filter(Boolean).join(" - ") }),
  },
});
