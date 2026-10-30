import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PlatformCounts {
  talents: number;
  organizations: number;
  openJobs: number;
  courses: number;
  learners: number;
  instructors: number;
}

const EMPTY: PlatformCounts = { talents: 0, organizations: 0, openJobs: 0, courses: 0, learners: 0, instructors: 0 };

/**
 * Compteurs réels de la plateforme, lus dans la base. Remplace les chiffres
 * écrits en dur (« 4 650 talents actifs »…). `null` tant que le chargement
 * n'est pas terminé, pour afficher un tiret plutôt qu'un faux zéro.
 */
export function usePlatformCounts(): PlatformCounts | null {
  const [counts, setCounts] = useState<PlatformCounts | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const head = { count: 'exact' as const, head: true };
      const [talents, organizations, openJobs, courses, enrollments, courseRows] = await Promise.all([
        supabase.from('profiles').select('id', head).eq('user_type', 'talent'),
        supabase.from('organization_profiles').select('id', head),
        supabase.from('job_postings').select('id', head).eq('status', 'open'),
        supabase.from('courses').select('id', head),
        supabase.from('course_enrollments').select('student_id'),
        supabase.from('courses').select('instructor_id'),
      ]);
      if (cancelled) return;
      setCounts({
        ...EMPTY,
        talents: talents.count ?? 0,
        organizations: organizations.count ?? 0,
        openJobs: openJobs.count ?? 0,
        courses: courses.count ?? 0,
        learners: new Set((enrollments.data ?? []).map((r) => r.student_id)).size,
        instructors: new Set((courseRows.data ?? []).map((r) => r.instructor_id).filter(Boolean)).size,
      });
    })();
    return () => { cancelled = true; };
  }, []);

  return counts;
}

/** Affiche un compteur, ou un tiret tant qu'il charge. */
export const formatCount = (value: number | undefined) =>
  value === undefined ? '–' : value.toLocaleString();
