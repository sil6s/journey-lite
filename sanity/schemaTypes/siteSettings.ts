import { defineArrayMember, defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", initialValue: "JourneyLite site settings", validation: (rule) => rule.required().max(120) }),
    defineField({
      name: "navGroups",
      title: "Navbar groups",
      type: "array",
      validation: (rule) => rule.max(8),
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "label", title: "Group label", type: "string", validation: (rule) => rule.required().max(60) }),
            defineField({
              name: "items",
              title: "Links",
              type: "array",
              validation: (rule) => rule.max(14),
              of: [
                defineArrayMember({
                  type: "object",
                  fields: [
                    defineField({ name: "label", title: "Label", type: "string", validation: (rule) => rule.required().max(80) }),
                    defineField({ name: "href", title: "URL", type: "url", validation: (rule) => rule.required().uri({ scheme: ["http", "https", "mailto", "tel"], allowRelative: true }) }),
                    defineField({ name: "description", title: "Description", type: "text", rows: 2, validation: (rule) => rule.max(180) }),
                    defineField({ name: "hidden", title: "Hide from navbar", type: "boolean", initialValue: false }),
                  ],
                  preview: { select: { title: "label", subtitle: "href" } },
                }),
              ],
            }),
          ],
          preview: { select: { title: "label" } },
        }),
      ],
    }),
  ],
  preview: { select: { title: "title" } },
});
