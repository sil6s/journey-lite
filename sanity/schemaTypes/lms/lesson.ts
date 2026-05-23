import { defineField, defineType } from "sanity";

export const lesson = defineType({
  name: "lesson",
  title: "Lesson",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "meta", title: "Meta & Downloads" },
    { name: "related", title: "Related" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Lesson Title",
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
      title: "Short Description",
      type: "text",
      rows: 2,
      group: "content",
    }),
    defineField({
      name: "lessonType",
      title: "Lesson Type",
      type: "string",
      group: "content",
      options: {
        list: [
          { value: "article", title: "Article" },
          { value: "video", title: "Video" },
          { value: "download", title: "Download / PDF" },
          { value: "checklist", title: "Checklist" },
          { value: "recipe", title: "Recipe" },
          { value: "mixed", title: "Mixed (video + article)" },
        ],
        layout: "radio",
      },
      initialValue: "article",
    }),
    defineField({
      name: "estimatedTime",
      title: "Estimated Time",
      description: 'e.g. "8 minutes" or "15 min read"',
      type: "string",
      group: "content",
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      group: "content",
    }),
    defineField({
      name: "isPreview",
      title: "Available as Free Preview",
      description: "If enabled, users can view this lesson without enrollment.",
      type: "boolean",
      group: "content",
      initialValue: false,
    }),
    defineField({
      name: "videoUrl",
      title: "Video URL",
      description: "YouTube, Vimeo, or direct MP4 URL.",
      type: "url",
      group: "content",
    }),
    defineField({
      name: "body",
      title: "Lesson Content",
      type: "array",
      group: "content",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading 2", value: "h2" },
            { title: "Heading 3", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
              { title: "Underline", value: "underline" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [{ name: "href", type: "url", title: "URL" }],
              },
            ],
          },
        },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            {
              name: "alt",
              type: "string",
              title: "Alt text",
            },
            {
              name: "caption",
              type: "string",
              title: "Caption",
            },
          ],
        },
      ],
    }),
    defineField({
      name: "keyTakeaways",
      title: "Key Takeaways",
      description: "Bullet points shown in the summary card at the top or bottom of the lesson.",
      type: "array",
      group: "content",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "calloutBoxes",
      title: "Callout Boxes",
      description: "Important notes, tips, warnings, or appointment reminders.",
      type: "array",
      group: "content",
      of: [
        {
          type: "object",
          name: "callout",
          title: "Callout",
          fields: [
            {
              name: "type",
              title: "Type",
              type: "string",
              options: {
                list: [
                  { value: "note", title: "Note" },
                  { value: "tip", title: "Tip" },
                  { value: "warning", title: "Important / Warning" },
                  { value: "appointment-reminder", title: "Ask Your Care Team" },
                ],
                layout: "radio",
              },
              initialValue: "note",
            },
            { name: "title", title: "Title", type: "string" },
            { name: "body", title: "Body", type: "text", rows: 3 },
          ],
          preview: {
            select: { title: "title", subtitle: "type" },
            prepare({ title, subtitle }) {
              const icons: Record<string, string> = { note: "📌", tip: "💡", warning: "⚠️", "appointment-reminder": "🗓" };
              return { title: `${icons[subtitle] ?? "•"} ${title}`, subtitle };
            },
          },
        },
      ],
    }),
    defineField({
      name: "nextStepCta",
      title: "Next Step CTA",
      description: "Optional button shown at the end of the lesson.",
      type: "object",
      group: "content",
      fields: [
        { name: "label", title: "Button Label", type: "string" },
        { name: "href", title: "URL", type: "url" },
      ],
    }),
    defineField({
      name: "downloads",
      title: "Downloadable Resources",
      type: "array",
      group: "meta",
      of: [{ type: "reference", to: [{ type: "courseResource" }] }],
    }),
    defineField({
      name: "relatedLessons",
      title: "Related Lessons",
      type: "array",
      group: "related",
      of: [{ type: "reference", to: [{ type: "lesson" }] }],
    }),
    defineField({
      name: "relatedResources",
      title: "Related Blog Articles",
      type: "array",
      group: "related",
      of: [{ type: "reference", to: [{ type: "blogPost" }, { type: "post" }] }],
    }),
  ],
  preview: {
    select: {
      title: "title",
      lessonType: "lessonType",
      estimatedTime: "estimatedTime",
      isPreview: "isPreview",
    },
    prepare({ title, lessonType, estimatedTime, isPreview }) {
      const typeIcons: Record<string, string> = {
        article: "📄", video: "🎬", download: "⬇️", checklist: "✅", recipe: "🍽", mixed: "📽",
      };
      const icon = typeIcons[lessonType] ?? "•";
      return {
        title: `${icon} ${title}`,
        subtitle: [estimatedTime, isPreview ? "Preview" : null].filter(Boolean).join(" · "),
      };
    },
  },
});
