import { defineArrayMember, defineField, defineType } from "sanity";
import { ctaBlockMember, factCardsMember, sectionBreakMember } from "./blogPost";

export const post = defineType({
  name: "post",
  title: "Post (tutorial-compatible)",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required().min(4).max(110),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "keyTakeaways",
      title: "Key takeaways",
      type: "array",
      description: "Optional bullets shown near the top of the article.",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.max(6),
    }),
    defineField({
      name: "publishedAt",
      title: "Published date",
      type: "datetime",
      description: "Published posts with this date in the past appear on the website blog.",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          validation: (rule) => rule.max(160),
        }),
      ],
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
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
              validation: (rule) => rule.max(160),
            }),
          ],
        }),
        factCardsMember,
        ctaBlockMember,
        sectionBreakMember,
      ],
    }),
    defineField({
      name: "showSources",
      title: "Show sources section",
      type: "boolean",
      description: "Turn on to show the Sources section at the bottom of the article.",
      initialValue: false,
    }),
    defineField({
      name: "sources",
      title: "Sources",
      type: "array",
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
              validation: (rule) => rule.uri({ scheme: ["http", "https"] }),
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
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "publishedAt",
      media: "image",
    },
  },
});
