import { defineField, defineType } from "sanity";

export const courseModule = defineType({
  name: "courseModule",
  title: "Module",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Module Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      description: "Brief overview of what this module covers.",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "order",
      title: "Order",
      description: "Used as a fallback sort; prefer dragging modules in the Course editor.",
      type: "number",
    }),
    defineField({
      name: "lessons",
      title: "Lessons",
      description: "Add lessons in order. Drag to reorder.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "lesson" }] }],
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "description",
      lessonCount: "lessons",
    },
    prepare({ title, subtitle, lessonCount }) {
      const count = Array.isArray(lessonCount) ? lessonCount.length : 0;
      return {
        title,
        subtitle: `${count} lesson${count === 1 ? "" : "s"}${subtitle ? ` — ${subtitle}` : ""}`,
      };
    },
  },
});
