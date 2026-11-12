-- =============================================================================
-- Appels audio / vidéo : règles de sécurité et notification d'appel manqué.
--
-- 1. Un appel suit les mêmes règles qu'un message privé (message_block_reason) :
--    pas d'appel entre comptes bloqués, pas d'appel d'un adulte vers un mineur
--    non connecté, pas d'appel tant qu'un accord parental est en attente.
--    L'appelé vérifie la ligne `calls` avant de sonner : sans cette ligne,
--    le téléphone ne sonne pas.
-- 2. L'appel manqué est notifié par la base, donc même si l'appelé était hors
--    ligne au moment de l'appel.
-- =============================================================================

DROP POLICY IF EXISTS "Call safety rules" ON public.calls;
CREATE POLICY "Call safety rules"
  ON public.calls AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (
    caller_id <> callee_id
    AND public.message_block_reason(auth.uid(), callee_id) IS NULL
  );

-- Les deux participants ne changent jamais après la création de l'appel.
CREATE OR REPLACE FUNCTION public.trg_calls_guard() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.caller_id <> OLD.caller_id OR NEW.callee_id <> OLD.callee_id THEN
    RAISE EXCEPTION 'Les participants d''un appel ne peuvent pas être modifiés.';
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_calls_guard ON public.calls;
CREATE TRIGGER trg_calls_guard BEFORE UPDATE ON public.calls
  FOR EACH ROW EXECUTE FUNCTION public.trg_calls_guard();

-- Appel manqué : sans réponse, annulé par l'appelant, ou appelé déjà en ligne.
CREATE OR REPLACE FUNCTION public.trg_notify_missed_call() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IN ('missed', 'cancelled') AND OLD.status = 'ringing' THEN
    PERFORM notify_user(NEW.callee_id, 'call_missed', NEW.caller_id, 'Appel manqué de {name}', '/calls',
      jsonb_build_object('video', NEW.is_video));
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_missed_call ON public.calls;
CREATE TRIGGER trg_notify_missed_call AFTER UPDATE OF status ON public.calls
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_missed_call();

-- Un appel resté « ringing » (onglet fermé, coupure réseau) est clos au bout de 2 minutes
-- dès que l'un des participants relit son historique.
CREATE OR REPLACE FUNCTION public.close_stale_calls()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.calls
  SET status = 'missed', ended_at = now()
  WHERE status = 'ringing'
    AND created_at < now() - interval '2 minutes'
    AND (caller_id = auth.uid() OR callee_id = auth.uid());
$$;

REVOKE EXECUTE ON FUNCTION public.close_stale_calls() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.close_stale_calls() TO authenticated;
