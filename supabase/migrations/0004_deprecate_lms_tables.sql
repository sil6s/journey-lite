-- ============================================================
-- Migration 0004 — Deprecate Sanity LMS tables
-- ============================================================
-- The JourneyLite patient education portal has migrated from
-- a Sanity CMS + Supabase progress-tracking model to
-- Open edX (Tutor), which manages enrollment, progress, and
-- certificates natively.
--
-- These tables are being preserved (NOT dropped) for:
--   • Audit / historical patient progress records
--   • Rollback capability if needed
--   • Reference during the Open edX migration
--
-- To fully drop them later (when no rollback is needed) run:
--   DROP TABLE public.user_course_progress;
--   DROP TABLE public.course_assignments;
--   DROP TABLE public.enrollments;
--
-- IMPORTANT: profiles is still used by the main site (auth, admin pages).
-- It is NOT deprecated here.
-- ============================================================

-- Mark tables as deprecated using table comments
COMMENT ON TABLE public.enrollments IS
  'DEPRECATED (2026-05-25): Self-enrollment tracking moved to Open edX. '
  'This table is retained for historical records only. '
  'See lib/openedx/ for the new enrollment API.';

COMMENT ON TABLE public.course_assignments IS
  'DEPRECATED (2026-05-25): Provider course assignments moved to Open edX '
  'Instructor Dashboard. This table is retained for historical records only.';

COMMENT ON TABLE public.user_course_progress IS
  'DEPRECATED (2026-05-25): Lesson progress tracking moved to Open edX '
  'Completion API. This table is retained for historical records only.';

-- Revoke the service-role write grants for the deprecated tables
-- (read access is kept for potential data export / reporting)
DO $$
BEGIN
  -- Only revoke if the policy / grant exists (idempotent)
  EXECUTE 'REVOKE INSERT, UPDATE, DELETE ON public.enrollments FROM service_role';
  EXECUTE 'REVOKE INSERT, UPDATE, DELETE ON public.course_assignments FROM service_role';
  EXECUTE 'REVOKE INSERT, UPDATE, DELETE ON public.user_course_progress FROM service_role';
EXCEPTION
  WHEN undefined_object THEN NULL;
  WHEN insufficient_privilege THEN NULL;
END;
$$;
