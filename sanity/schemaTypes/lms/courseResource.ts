import { defineField, defineType } from "sanity";

const bariatricStageOptions = [
  { value: "pre-op", title: "Pre-Op Preparation" },
  { value: "immediate-post-op", title: "Immediate Post-Op" },
  { value: "soft-food", title: "Soft Food Phase" },
  { value: "long-term-maintenance", title: "Long-Term Maintenance" },
  { value: "vitamins", title: "Vitamins & Supplements" },
  { value: "general-education", title: "General Education" },
];

export const courseResource = defineType({
  name: "courseResource",
  title: "Download / Resource",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
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
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "file",
      title: "File",
      type: "file",
      options: { accept: ".pdf,.doc,.docx,.xlsx,.csv" },
    }),
    defineField({
      name: "resourceType",
      title: "Resource Type",
      type: "string",
      options: {
        list: [
          { value: "PDF", title: "PDF" },
          { value: "checklist", title: "Checklist" },
          { value: "meal-plan", title: "Meal Plan" },
          { value: "recipe", title: "Recipe" },
          { value: "guide", title: "Guide" },
          { value: "worksheet", title: "Worksheet" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "bariatricStage",
      title: "Bariatric Stage",
      type: "string",
      options: { list: bariatricStageOptions },
    }),
    defineField({
      name: "isPublic",
      title: "Publicly Downloadable",
      description: "If enabled, this file can be downloaded without login.",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "title",
      resourceType: "resourceType",
      isPublic: "isPublic",
    },
    prepare({ title, resourceType, isPublic }) {
      return {
        title,
        subtitle: [resourceType, isPublic ? "Public" : "Enrolled only"].filter(Boolean).join(" · "),
      };
    },
  },
});
