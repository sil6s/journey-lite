import { defineField, defineType } from "sanity";

const bariatricStageOptions = [
  { value: "pre-op", title: "Pre-Op Preparation" },
  { value: "immediate-post-op", title: "Immediate Post-Op" },
  { value: "soft-food", title: "Soft Food Phase" },
  { value: "long-term-maintenance", title: "Long-Term Maintenance" },
  { value: "vitamins", title: "Vitamins & Supplements" },
  { value: "general-education", title: "General Education" },
];

export const course = defineType({
  name: "course",
  title: "Course",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "settings", title: "Settings & Access" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Course Title",
      type: "string",
      group: "content",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      options: { source: "title" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Short Description",
      description: "One or two sentences shown on the course card.",
      type: "text",
      rows: 2,
      group: "content",
      validation: (Rule) => Rule.max(220),
    }),
    defineField({
      name: "description",
      title: "Full Description",
      type: "text",
      rows: 4,
      group: "content",
    }),
    defineField({
      name: "featuredImage",
      title: "Featured Image",
      type: "image",
      group: "content",
      options: { hotspot: true },
    }),
    defineField({
      name: "bariatricStage",
      title: "Bariatric Stage",
      type: "string",
      group: "content",
      options: { list: bariatricStageOptions, layout: "radio" },
    }),
    defineField({
      name: "difficultyLevel",
      title: "Difficulty Level",
      type: "string",
      group: "content",
      options: {
        list: [
          { value: "beginner", title: "Beginner" },
          { value: "intermediate", title: "Intermediate" },
          { value: "advanced", title: "Advanced" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "estimatedDuration",
      title: "Estimated Duration",
      description: 'e.g. "45 minutes" or "2 hours"',
      type: "string",
      group: "content",
    }),
    defineField({
      name: "modules",
      title: "Modules",
      description: "Add modules in the order they should appear. Drag to reorder.",
      type: "array",
      group: "content",
      of: [{ type: "reference", to: [{ type: "courseModule" }] }],
    }),
    defineField({
      name: "relatedResources",
      title: "Related Blog Resources",
      type: "array",
      group: "content",
      of: [{ type: "reference", to: [{ type: "blogPost" }, { type: "post" }] }],
    }),
    defineField({
      name: "isPublished",
      title: "Published",
      type: "boolean",
      group: "settings",
      initialValue: false,
    }),
    defineField({
      name: "isFeatured",
      title: "Featured on Portal Home",
      type: "boolean",
      group: "settings",
      initialValue: false,
    }),
    defineField({
      name: "accessType",
      title: "Access Type",
      type: "string",
      group: "settings",
      options: {
        list: [
          { value: "free", title: "Free — anyone with an account can access" },
          { value: "enrolled", title: "Enrolled patients only" },
          { value: "paid", title: "Paid access" },
          { value: "provider-assigned", title: "Provider-assigned only" },
        ],
        layout: "radio",
      },
      initialValue: "enrolled",
    }),
    defineField({
      name: "seoTitle",
      title: "SEO Title",
      type: "string",
      group: "seo",
    }),
    defineField({
      name: "seoDescription",
      title: "SEO Description",
      type: "text",
      rows: 2,
      group: "seo",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "bariatricStage",
      media: "featuredImage",
      isPublished: "isPublished",
    },
    prepare({ title, subtitle, media, isPublished }) {
      const stageLabel = bariatricStageOptions.find((o) => o.value === subtitle)?.title ?? subtitle;
      return {
        title: `${isPublished ? "" : "DRAFT — "}${title}`,
        subtitle: stageLabel,
        media,
      };
    },
  },
});
