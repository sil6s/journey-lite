import { defineField, defineType } from "sanity";

export const testimonial = defineType({
  name: "testimonial",
  title: "Patient Testimonial",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Patient Name",
      type: "string",
      description: 'e.g. "Sarah M."',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "procedure",
      title: "Procedure",
      type: "string",
      description: 'e.g. "Gastric Sleeve"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "weightLost",
      title: "Weight Lost (lbs)",
      type: "number",
      validation: (rule) => rule.required().positive().integer(),
    }),
    defineField({
      name: "shortQuote",
      title: "Short Quote",
      type: "text",
      rows: 3,
      description: "One sentence shown on homepage — 120 characters max.",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "fullStory",
      title: "Full Story",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading", value: "h3" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
            ],
          },
        },
      ],
      description: "Full story shown on the individual story page. Required when featured.",
      validation: (rule) =>
        rule.custom((value, context) => {
          const doc = context.document as { featured?: boolean } | undefined;
          if (doc?.featured && (!value || (value as unknown[]).length === 0)) {
            return "Full story is required when the testimonial is featured.";
          }
          return true;
        }),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "beforePhoto",
      title: "Before Photo",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "afterPhoto",
      title: "After Photo",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "featured",
      title: "Featured on Homepage",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "procedure",
      media: "afterPhoto",
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title ?? "Unnamed",
        subtitle: subtitle ?? "",
        media,
      };
    },
  },
});
