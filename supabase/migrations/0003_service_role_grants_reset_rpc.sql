-- Grant service_role proper access to LMS progress tables
-- (Previously only 'authenticated' was granted; service_role had no privileges.)

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_course_progress  TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_lesson_events     TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_quiz_attempts     TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.completion_attestations TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_assignments     TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enrollments            TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_progress        TO service_role;

-- ── reset_user_progress ──────────────────────────────────────────────────────
-- Completely wipes a user's LMS progress and resets assignment/enrollment status.
-- SECURITY DEFINER so the function runs as the owner (postgres) and can DELETE
-- rows that the calling role couldn't otherwise touch.
--
-- Authorization rules:
--   • A patient may only reset their own progress (auth.uid() == p_user_id).
--   • A JourneyLite admin or provider may reset any patient's progress.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.reset_user_progress(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- service_role callers (scripts / admin tools) bypass the auth guard.
  -- Authenticated callers may only reset their own progress unless they
  -- are a JourneyLite admin or provider.
  IF auth.role() <> 'service_role' THEN
    IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Not authenticated';
    END IF;

    IF auth.uid() <> p_user_id AND NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'provider')
    ) THEN
      RAISE EXCEPTION 'Permission denied: you can only reset your own progress';
    END IF;
  END IF;

  -- Wipe progress records -----------------------------------------------------
  DELETE FROM public.user_course_progress  WHERE user_id = p_user_id;
  DELETE FROM public.user_lesson_events    WHERE user_id = p_user_id;
  DELETE FROM public.user_quiz_attempts    WHERE user_id = p_user_id;
  DELETE FROM public.completion_attestations WHERE user_id = p_user_id;
  DELETE FROM public.lesson_progress       WHERE user_id = p_user_id;

  -- Reset assignment statuses -------------------------------------------------
  UPDATE public.course_assignments
  SET    status = 'assigned'
  WHERE  user_id = p_user_id
    AND  status IN ('in_progress', 'completed', 'overdue');

  -- Reset enrollment statuses -------------------------------------------------
  UPDATE public.enrollments
  SET    status = 'active',
         completed_at = NULL
  WHERE  user_id = p_user_id
    AND  status = 'completed';
END;
$$;

GRANT EXECUTE ON FUNCTION public.reset_user_progress(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_user_progress(uuid) TO service_role;

notify pgrst, 'reload schema';
