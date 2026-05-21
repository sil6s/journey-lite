# JourneyLite Admin

The admin dashboard lives at `/admin`.

Use guided admin pages for day-to-day review of blog posts, services, staff, locations, testimonials, analytics placeholders, and SEO readiness checks. Use `/admin/studio` or `/studio` for advanced Sanity editing.

## AI Blog Import Workflow

1. Open `/admin/ai-blog-builder`.
2. Complete the guided wizard fields.
3. Copy or download the generated prompt and use it with GPT.
4. Paste the returned Markdown packet into the import step.
5. Review parsed fields and validation messages.
6. Click `Create Draft in Sanity`.

Sanity writes are handled by `/api/admin/blog/import` and require `SANITY_API_WRITE_TOKEN` or `SANITY_WRITE_TOKEN` on the server. Do not expose write tokens in client-side code.

Before production use, connect the TODO authorization guard in the import route and protect `/admin` with the project auth provider.
