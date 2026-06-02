import { defineArrayMember, defineField, defineType } from "sanity";

const fieldTypes = [
  { title: "Text", value: "text" },
  { title: "Email", value: "email" },
  { title: "Phone", value: "phone" },
  { title: "Textarea", value: "textarea" },
  { title: "Number", value: "number" },
  { title: "Date", value: "date" },
  { title: "Select dropdown", value: "select" },
  { title: "Radio group", value: "radio" },
  { title: "Checkbox group", value: "checkboxGroup" },
  { title: "Single checkbox", value: "checkbox" },
  { title: "Hidden field", value: "hidden" },
  { title: "Consent checkbox", value: "consent" },
];

export const formFieldMember = defineArrayMember({
  name: "formField",
  title: "Form field",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Field label",
      type: "string",
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: "key",
      title: "Field key/name",
      type: "slug",
      description: "Unique machine name used when storing submissions.",
      options: { source: "label", maxLength: 64 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "type",
      title: "Field type",
      type: "string",
      options: { list: fieldTypes, layout: "dropdown" },
      initialValue: "text",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "placeholder",
      title: "Placeholder",
      type: "string",
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: "helpText",
      title: "Help text",
      type: "text",
      rows: 2,
      validation: (rule) => rule.max(220),
    }),
    defineField({
      name: "required",
      title: "Required",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "options",
      title: "Options",
      type: "array",
      hidden: ({ parent }) => !["select", "radio", "checkboxGroup"].includes(parent?.type),
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string", validation: (rule) => rule.required().max(100) }),
            defineField({ name: "value", title: "Value", type: "string", validation: (rule) => rule.required().max(100) }),
          ],
          preview: { select: { title: "label", subtitle: "value" } },
        }),
      ],
    }),
    defineField({
      name: "validation",
      title: "Validation rules",
      type: "object",
      fields: [
        defineField({ name: "minLength", title: "Minimum length", type: "number" }),
        defineField({ name: "maxLength", title: "Maximum length", type: "number" }),
        defineField({ name: "pattern", title: "Regex pattern", type: "string" }),
      ],
    }),
    defineField({
      name: "defaultValue",
      title: "Default value",
      type: "string",
      validation: (rule) => rule.max(500),
    }),
    defineField({
      name: "width",
      title: "Width/layout",
      type: "string",
      options: {
        list: [
          { title: "Full", value: "full" },
          { title: "Half", value: "half" },
        ],
        layout: "radio",
      },
      initialValue: "full",
    }),
    defineField({
      name: "adminNote",
      title: "Admin-only/internal note",
      type: "text",
      rows: 2,
      validation: (rule) => rule.max(220),
    }),
  ],
  preview: {
    select: { title: "label", type: "type", required: "required" },
    prepare: ({ title, type, required }) => ({
      title: title || "Untitled field",
      subtitle: `${type || "field"}${required ? " - required" : ""}`,
    }),
  },
});

export const formDefinition = defineType({
  name: "formDefinition",
  title: "Form Definition",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "delivery", title: "Delivery" },
    { name: "settings", title: "Settings" },
  ],
  fields: [
    defineField({ name: "name", title: "Form name", type: "string", group: "content", validation: (rule) => rule.required().max(120) }),
    defineField({ name: "internalDescription", title: "Internal description", type: "text", rows: 3, group: "content", validation: (rule) => rule.max(400) }),
    defineField({
      name: "key",
      title: "Form key / unique identifier",
      type: "slug",
      group: "settings",
      options: { source: "name", maxLength: 80 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      group: "settings",
      options: {
        list: [
          { title: "Active", value: "active" },
          { title: "Inactive", value: "inactive" },
          { title: "Archived", value: "archived" },
        ],
        layout: "radio",
      },
      initialValue: "active",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "title", title: "Form title shown to users", type: "string", group: "content", validation: (rule) => rule.max(120) }),
    defineField({ name: "introText", title: "Form intro text", type: "text", rows: 3, group: "content", validation: (rule) => rule.max(360) }),
    defineField({ name: "successMessage", title: "Success message", type: "text", rows: 2, group: "content", initialValue: "Thank you. We received your submission.", validation: (rule) => rule.max(300) }),
    defineField({ name: "errorMessage", title: "Error message", type: "text", rows: 2, group: "content", initialValue: "Something went wrong. Please try again.", validation: (rule) => rule.max(300) }),
    defineField({ name: "submitButtonLabel", title: "Submit button label", type: "string", group: "content", initialValue: "Submit", validation: (rule) => rule.max(60) }),
    defineField({
      name: "notificationEmails",
      title: "Notification email recipients",
      type: "array",
      group: "delivery",
      of: [defineArrayMember({ type: "string", validation: (rule) => rule.email() })],
    }),
    defineField({ name: "brevoListId", title: "Optional Brevo list ID", type: "number", group: "delivery" }),
    defineField({ name: "brevoTags", title: "Optional Brevo tags", type: "array", group: "delivery", of: [defineArrayMember({ type: "string" })], options: { layout: "tags" } }),
    defineField({
      name: "redirectUrl",
      title: "Optional redirect URL after successful submit",
      type: "url",
      group: "delivery",
      validation: (rule) => rule.uri({ scheme: ["http", "https"], allowRelative: true }),
    }),
    defineField({
      name: "spamProtection",
      title: "Spam protection settings",
      type: "object",
      group: "settings",
      fields: [
        defineField({ name: "honeypot", title: "Enable honeypot", type: "boolean", initialValue: true }),
        defineField({ name: "honeypotFieldName", title: "Honeypot field name", type: "string", initialValue: "website" }),
      ],
    }),
    defineField({
      name: "fields",
      title: "Fields",
      type: "array",
      group: "content",
      of: [formFieldMember],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "key.current", status: "status" },
    prepare: ({ title, subtitle, status }) => ({
      title: title || "Untitled form",
      subtitle: [subtitle, status].filter(Boolean).join(" - "),
    }),
  },
});
