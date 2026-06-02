# Archived — Sanity LMS scripts

These scripts were used when the JourneyLite patient education portal was backed
by Sanity CMS. They are kept for historical reference only.

**The LMS is now powered by Open edX (Tutor).**

| File | Purpose |
|---|---|
| `export-lms-course-details.ts` | Exported full course/lesson tree from Sanity to `exports/education-course-details.json` |
| `import-enhanced-lms-courses.ts` | Imported enhanced course structure into Sanity |
| `migrate-lms-content.ts` | General migration helper for Sanity LMS content |
| `flush-user-progress.ts` | Flushed Supabase `user_course_progress` rows for a test user |
| `seed-lms-test-account.ts` | Seeded a Supabase test account with enrollments and progress |

## Migrating course content to Open edX

The exported Sanity data lives at:
  `exports/education-course-details.json`  (2 courses, 90 lessons)

Use the OLX importer to generate Open edX course packages:
  `python3 scripts/generate-openedx-olx.py`

Then import each `.tar.gz` from `exports/olx/` in Open edX Studio:
  Tools → Import → Upload a Course Export File
