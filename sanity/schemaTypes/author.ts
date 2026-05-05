import { defineField, defineType } from "sanity";

export const author = defineType({
  name: "author",
  title: "Author",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Example: Bariatric physician, Registered dietitian, JourneyLite team.",
    }),
    defineField({
      name: "credentials",
      title: "Credentials",
      type: "string",
      description: "Optional credentials such as MD, DO, FACOS, RD. Keep factual.",
    }),
    defineField({
      name: "bio",
      title: "Short bio",
      type: "text",
      rows: 4,
      description: "Short author bio shown on article pages when available.",
    }),
    defineField({
      name: "image",
      title: "Author image",
      type: "image",
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "title",
      media: "image",
    },
  },
});
