-- =============================================================================
-- Finitions : services des organisations, leçons et progression des cours,
-- « marquer comme non lu » pour les messages reçus.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Services proposés par une organisation (coaching, détection, formation…)
-- Rattachés au compte de l'organisation (profiles.id = organization_profiles.user_id).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organization_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (length(trim(title)) > 0),
  description text,
  category text,
  price_label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS organization_services_owner_idx ON public.organization_services (owner_id, created_at DESC);

ALTER TABLE public.organization_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Organization services are public" ON public.organization_services;
CREATE POLICY "Organization services are public"
  ON public.organization_services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners manage their services" ON public.organization_services;
CREATE POLICY "Owners manage their services"
  ON public.organization_services FOR ALL TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Leçons d'un cours
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.course_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  title text NOT NULL CHECK (length(trim(title)) > 0),
  content text,
  video_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS course_lessons_course_idx ON public.course_lessons (course_id, position);

ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Course lessons are public" ON public.course_lessons;
CREATE POLICY "Course lessons are public"
  ON public.course_lessons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Instructors manage lessons" ON public.course_lessons;
CREATE POLICY "Instructors manage lessons"
  ON public.course_lessons FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.instructor_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.instructor_id = auth.uid()));

-- Le formateur peut aussi supprimer son cours (il n'avait que INSERT/UPDATE).
DROP POLICY IF EXISTS "Instructors can delete their courses" ON public.courses;
CREATE POLICY "Instructors can delete their courses"
  ON public.courses FOR DELETE TO authenticated
  USING (instructor_id = auth.uid());

-- Un élève peut se désinscrire.
DROP POLICY IF EXISTS "Students can unenroll" ON public.course_enrollments;
CREATE POLICY "Students can unenroll"
  ON public.course_enrollments FOR DELETE TO authenticated
  USING (student_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Progression : une ligne par leçon terminée
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.course_lesson_progress (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);

ALTER TABLE public.course_lesson_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students see their progress" ON public.course_lesson_progress;
CREATE POLICY "Students see their progress"
  ON public.course_lesson_progress FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- On ne peut cocher une leçon que d'un cours auquel on est inscrit.
DROP POLICY IF EXISTS "Enrolled students complete lessons" ON public.course_lesson_progress;
CREATE POLICY "Enrolled students complete lessons"
  ON public.course_lesson_progress FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.course_lessons l
      JOIN public.course_enrollments e ON e.course_id = l.course_id AND e.student_id = auth.uid()
      WHERE l.id = lesson_id
    )
  );

DROP POLICY IF EXISTS "Students uncheck lessons" ON public.course_lesson_progress;
CREATE POLICY "Students uncheck lessons"
  ON public.course_lesson_progress FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Recalcule course_enrollments.progress / completed. Récompense (XP, YAT Coins,
-- badge) la première fois qu'un cours est terminé.
CREATE OR REPLACE FUNCTION public.refresh_course_progress(_user_id uuid, _course_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _total integer;
  _done integer;
  _pct integer;
  _was_completed boolean;
  _xp integer := 50;
  _coins numeric := 0.005;
BEGIN
  SELECT count(*) INTO _total FROM course_lessons WHERE course_id = _course_id;
  SELECT count(*) INTO _done
  FROM course_lesson_progress p JOIN course_lessons l ON l.id = p.lesson_id
  WHERE p.user_id = _user_id AND l.course_id = _course_id;

  _pct := CASE WHEN _total = 0 THEN 0 ELSE LEAST(100, round(_done * 100.0 / _total))::integer END;

  SELECT COALESCE(completed, false) INTO _was_completed
  FROM course_enrollments WHERE student_id = _user_id AND course_id = _course_id;

  UPDATE course_enrollments
  SET progress = _pct, completed = (_total > 0 AND _done >= _total)
  WHERE student_id = _user_id AND course_id = _course_id;

  IF _total > 0 AND _done >= _total AND NOT COALESCE(_was_completed, false) THEN
    INSERT INTO user_levels (user_id, xp_total, yat_coins, level)
    VALUES (_user_id, _xp, _coins, 1)
    ON CONFLICT (user_id) DO UPDATE
      SET xp_total = user_levels.xp_total + _xp,
          yat_coins = user_levels.yat_coins + _coins,
          level = GREATEST(user_levels.level, 1 + FLOOR((user_levels.xp_total + _xp) / 100)::int);

    INSERT INTO coin_transactions (user_id, amount, reason, xp_earned)
    VALUES (_user_id, _coins, 'course_completed', _xp);

    INSERT INTO user_badges (user_id, badge_name, badge_icon, badge_color)
    SELECT _user_id, 'Premier cours terminé', 'graduation-cap', 'blue'
    WHERE NOT EXISTS (SELECT 1 FROM user_badges WHERE user_id = _user_id AND badge_name = 'Premier cours terminé');
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.on_lesson_progress_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _row course_lesson_progress := COALESCE(NEW, OLD);
  _course uuid;
BEGIN
  SELECT course_id INTO _course FROM course_lessons WHERE id = _row.lesson_id;
  IF _course IS NOT NULL THEN
    PERFORM public.refresh_course_progress(_row.user_id, _course);
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_lesson_progress_change ON public.course_lesson_progress;
CREATE TRIGGER trg_lesson_progress_change
  AFTER INSERT OR DELETE ON public.course_lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.on_lesson_progress_change();

-- Ajouter ou retirer une leçon change le pourcentage de tous les inscrits.
CREATE OR REPLACE FUNCTION public.on_course_lessons_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _course uuid := COALESCE(NEW.course_id, OLD.course_id);
  _student uuid;
BEGIN
  FOR _student IN SELECT student_id FROM course_enrollments WHERE course_id = _course LOOP
    PERFORM public.refresh_course_progress(_student, _course);
  END LOOP;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_course_lessons_change ON public.course_lessons;
CREATE TRIGGER trg_course_lessons_change
  AFTER INSERT OR DELETE ON public.course_lessons
  FOR EACH ROW EXECUTE FUNCTION public.on_course_lessons_change();

-- ---------------------------------------------------------------------------
-- Marquer un message reçu comme lu / non lu
-- (la policy UPDATE de messages est réservée à l'expéditeur)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_message_read(_message_id uuid, _read boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.messages m
  SET read = _read
  WHERE m.id = _message_id
    AND m.sender_id <> auth.uid()
    AND public.is_conversation_member(m.conversation_id, auth.uid());
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Message introuvable ou non modifiable.';
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_message_read(uuid, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_message_read(uuid, boolean) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.refresh_course_progress(uuid, uuid) FROM PUBLIC;
