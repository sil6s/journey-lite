import { defineField, defineType } from "sanity";

const bariatricStageOptions = [
  { value: "pre-op", title: "Pre-Op Preparation" },
  { value: "immediate-post-op", title: "Immediate Post-Op (liquid)" },
  { value: "soft-food", title: "Soft Food Phase" },
  { value: "long-term-maintenance", title: "Long-Term Maintenance" },
  { value: "general-education", title: "General" },
];

export const recipe = defineType({
  name: "recipe",
  title: "Recipe",
  type: "document",
  groups: [
    { name: "content", title: "Recipe", default: true },
    { name: "nutrition", title: "Nutrition" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Recipe Name",
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
      name: "description",
      title: "Description",
      type: "text",
      rows: 2,
      group: "content",
    }),
    defineField({
      name: "bariatricStage",
      title: "Bariatric Stage",
      type: "string",
      group: "content",
      options: { list: bariatricStageOptions, layout: "radio" },
    }),
    defineField({
      name: "image",
      title: "Photo",
      type: "image",
      group: "content",
      options: { hotspot: true },
    }),
    defineField({
      name: "tags",
      title: "Tags",
      description: 'e.g. "high-protein", "liquid", "30 min or less"',
      type: "array",
      group: "content",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "ingredients",
      title: "Ingredients",
      type: "array",
      group: "content",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "instructions",
      title: "Instructions",
      type: "array",
      group: "content",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "notes",
      title: "Notes",
      description: "Tips, substitutions, or storage instructions.",
      type: "text",
      rows: 3,
      group: "content",
    }),
    defineField({
      name: "proteinGrams",
      title: "Protein (grams)",
      type: "number",
      group: "nutrition",
    }),
    defineField({
      name: "calories",
      title: "Calories",
      type: "number",
      group: "nutrition",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "bariatricStage",
      media: "image",
      protein: "proteinGrams",
    },
    prepare({ title, subtitle, media, protein }) {
      const stageLabel = bariatricStageOptions.find((o) => o.value === subtitle)?.title ?? subtitle;
      return {
        title,
        subtitle: [stageLabel, protein != null ? `${protein}g protein` : null].filter(Boolean).join(" · "),
        media,
      };
    },
  },
});
