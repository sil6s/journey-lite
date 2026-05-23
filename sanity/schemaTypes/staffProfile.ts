import { defineField, defineType } from "sanity";

export const staffProfile = defineType({
  name: "staffProfile",
  title: "Staff / Provider Profile",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "displayName", title: "Display Name", type: "string" }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "name", maxLength: 96 }, validation: (rule) => rule.required() }),
    defineField({ name: "primaryTitle", title: "Role / Title", type: "string" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "bio", title: "Bio", type: "text", rows: 5 }),
    defineField({ name: "credentials", title: "Credentials", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "education", title: "Education", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "clinicalFocus", title: "Clinical Focus", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "imageAlt", title: "Image Alt Text", type: "string" }),
    defineField({ name: "status", title: "Status", type: "string", options: { list: ["published", "draft", "archived"] }, initialValue: "published" }),
    defineField({ name: "seoTitle", title: "SEO Title", type: "string" }),
    defineField({ name: "seoDescription", title: "SEO Description", type: "text", rows: 3 }),
    defineField({ name: "updatedAt", title: "Updated At", type: "datetime", readOnly: true }),
  ],
});
