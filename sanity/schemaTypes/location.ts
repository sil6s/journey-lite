import { defineField, defineType } from "sanity";

export const location = defineType({
  name: "location",
  title: "Location",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Location Name", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "name", maxLength: 96 }, validation: (rule) => rule.required() }),
    defineField({ name: "city", title: "City", type: "string" }),
    defineField({ name: "state", title: "State", type: "string" }),
    defineField({ name: "address1", title: "Address Line 1", type: "string" }),
    defineField({ name: "address2", title: "Address Line 2", type: "string" }),
    defineField({ name: "phone", title: "Phone", type: "string" }),
    defineField({ name: "hours", title: "Hours", type: "text", rows: 3 }),
    defineField({ name: "mapLink", title: "Map Link", type: "url" }),
    defineField({ name: "appointmentLink", title: "Appointment Link", type: "string" }),
    defineField({ name: "serviceArea", title: "Service Area Text", type: "text", rows: 3 }),
    defineField({ name: "status", title: "Status", type: "string", options: { list: ["published", "draft", "archived"] }, initialValue: "published" }),
    defineField({ name: "seoTitle", title: "SEO Title", type: "string" }),
    defineField({ name: "seoDescription", title: "SEO Description", type: "text", rows: 3 }),
    defineField({ name: "updatedAt", title: "Updated At", type: "datetime", readOnly: true }),
  ],
});
