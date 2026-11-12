-- =============================================================================
-- Notifications automatiques.
--
-- Des triggers créent une notification pour le destinataire quand quelqu'un
-- aime ou commente sa publication, lui écrit, lui envoie ou accepte une demande
-- d'ami, postule à son offre, s'inscrit à son cours ou à son événement, lui
-- propose un contrat, ou quand sa demande de vérification est traitée.
--
-- Le texte affiché est traduit côté application à partir de `type` et `data`
-- (clés notif.<type> dans src/i18n/locales). `title` garde un texte français
-- de secours pour les anciens clients.
-- =============================================================================

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS actor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS data jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications (user_id, created_at DESC);

-- Les compteurs et la page de notifications s'abonnent aux changements en temps réel.
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- Un membre peut supprimer ses propres notifications.
DROP POLICY IF EXISTS "Users can delete their notifications" ON public.notifications;
CREATE POLICY "Users can delete their notifications"
  ON public.notifications FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Création d'une notification
-- ---------------------------------------------------------------------------
-- Règles communes : jamais de notification à soi-même, jamais entre deux
-- comptes dont l'un a bloqué l'autre, et pas de doublon tant qu'une
-- notification identique (même type, même auteur, même lien) n'est pas lue.
CREATE OR REPLACE FUNCTION public.notify_user(
  _user_id uuid,
  _type text,
  _actor_id uuid,
  _title text,
  _link text,
  _data jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _actor_name text;
BEGIN
  IF _user_id IS NULL OR _user_id = _actor_id THEN RETURN; END IF;
  IF _actor_id IS NOT NULL AND public.is_blocked_between(_user_id, _actor_id) THEN RETURN; END IF;

  IF EXISTS (
    SELECT 1 FROM public.notifications n
    WHERE n.user_id = _user_id AND n.type = _type AND n.read = false
      AND n.actor_id IS NOT DISTINCT FROM _actor_id
      AND n.link IS NOT DISTINCT FROM _link
  ) THEN
    RETURN;
  END IF;

  SELECT name INTO _actor_name FROM public.profiles WHERE id = _actor_id;

  INSERT INTO public.notifications (user_id, type, title, link, actor_id, data)
  VALUES (
    _user_id, _type,
    replace(_title, '{name}', COALESCE(NULLIF(_actor_name, ''), 'Quelqu''un')),
    _link, _actor_id,
    COALESCE(_data, '{}'::jsonb) || jsonb_build_object('name', COALESCE(NULLIF(_actor_name, ''), ''))
  );
EXCEPTION WHEN others THEN
  -- Une notification ne doit jamais faire échouer l'action qui la déclenche.
  RAISE WARNING 'notify_user: %', SQLERRM;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.notify_user(uuid, text, uuid, text, text, jsonb) FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Publications : like et commentaire
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_notify_post_like() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _owner uuid;
BEGIN
  SELECT user_id INTO _owner FROM posts WHERE id = NEW.post_id;
  PERFORM notify_user(_owner, 'like', NEW.user_id, '{name} a aimé votre publication', '/talent/' || _owner, jsonb_build_object('post_id', NEW.post_id));
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_post_like ON public.post_likes;
CREATE TRIGGER trg_notify_post_like AFTER INSERT ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_post_like();

CREATE OR REPLACE FUNCTION public.trg_notify_post_comment() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _owner uuid;
BEGIN
  SELECT user_id INTO _owner FROM posts WHERE id = NEW.post_id;
  PERFORM notify_user(_owner, 'comment', NEW.user_id, '{name} a commenté votre publication', '/talent/' || _owner,
    jsonb_build_object('post_id', NEW.post_id, 'excerpt', left(NEW.content, 80)));
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_post_comment ON public.comments;
CREATE TRIGGER trg_notify_post_comment AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_post_comment();

-- Publications de communauté
CREATE OR REPLACE FUNCTION public.trg_notify_community_post_like() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _owner uuid;
BEGIN
  SELECT user_id INTO _owner FROM community_posts WHERE id = NEW.post_id;
  PERFORM notify_user(_owner, 'like', NEW.user_id, '{name} a aimé votre publication', '/communities', jsonb_build_object('community_post_id', NEW.post_id));
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_community_post_like ON public.community_post_likes;
CREATE TRIGGER trg_notify_community_post_like AFTER INSERT ON public.community_post_likes
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_community_post_like();

CREATE OR REPLACE FUNCTION public.trg_notify_community_post_comment() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _owner uuid;
BEGIN
  SELECT user_id INTO _owner FROM community_posts WHERE id = NEW.post_id;
  PERFORM notify_user(_owner, 'comment', NEW.user_id, '{name} a commenté votre publication', '/communities',
    jsonb_build_object('community_post_id', NEW.post_id, 'excerpt', left(NEW.content, 80)));
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_community_post_comment ON public.community_post_comments;
CREATE TRIGGER trg_notify_community_post_comment AFTER INSERT ON public.community_post_comments
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_community_post_comment();

-- ---------------------------------------------------------------------------
-- Messages : une notification non lue au plus par conversation et par expéditeur
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_notify_message() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _recipient uuid;
BEGIN
  FOR _recipient IN
    SELECT user_id FROM conversation_participants
    WHERE conversation_id = NEW.conversation_id AND user_id <> NEW.sender_id
  LOOP
    PERFORM notify_user(_recipient, 'message', NEW.sender_id, '{name} vous a envoyé un message', '/messages',
      jsonb_build_object('conversation_id', NEW.conversation_id));
  END LOOP;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_message ON public.messages;
CREATE TRIGGER trg_notify_message AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_message();

-- Lire une conversation marque aussi ses notifications de message comme lues.
CREATE OR REPLACE FUNCTION public.mark_conversation_read(_conversation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_conversation_member(_conversation_id, auth.uid()) THEN
    RAISE EXCEPTION 'not a member of this conversation';
  END IF;

  UPDATE public.messages
  SET read = true
  WHERE conversation_id = _conversation_id
    AND sender_id <> auth.uid()
    AND read = false;

  UPDATE public.notifications
  SET read = true
  WHERE user_id = auth.uid()
    AND type = 'message'
    AND read = false
    AND data->>'conversation_id' = _conversation_id::text;
END;
$$;

-- ---------------------------------------------------------------------------
-- Demandes d'ami
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_notify_connection() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' AND COALESCE(NEW.status, 'pending') = 'pending' THEN
    PERFORM notify_user(NEW.connected_user_id, 'connection', NEW.user_id, '{name} vous a envoyé une demande d''ami', '/friends');
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'accepted' AND OLD.status IS DISTINCT FROM 'accepted' THEN
    PERFORM notify_user(NEW.user_id, 'connection_accepted', NEW.connected_user_id, '{name} a accepté votre demande d''ami', '/friends');
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_connection ON public.connections;
CREATE TRIGGER trg_notify_connection AFTER INSERT OR UPDATE OF status ON public.connections
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_connection();

-- ---------------------------------------------------------------------------
-- Candidatures
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_notify_job_application() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _job record;
BEGIN
  SELECT organization_id, title INTO _job FROM job_postings WHERE id = NEW.job_id;
  PERFORM notify_user(_job.organization_id, 'application', NEW.applicant_id, '{name} a postulé à votre offre', '/organization/' || _job.organization_id,
    jsonb_build_object('title', _job.title, 'job_id', NEW.job_id));
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_job_application ON public.job_applications;
CREATE TRIGGER trg_notify_job_application AFTER INSERT ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_job_application();

CREATE OR REPLACE FUNCTION public.trg_notify_talent_request_application() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _req record;
BEGIN
  SELECT user_id, title INTO _req FROM talent_requests WHERE id = NEW.request_id;
  PERFORM notify_user(_req.user_id, 'application', NEW.applicant_id, '{name} a répondu à votre annonce', '/talent-marketplace',
    jsonb_build_object('title', _req.title, 'request_id', NEW.request_id));
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_talent_request_application ON public.talent_request_applications;
CREATE TRIGGER trg_notify_talent_request_application AFTER INSERT ON public.talent_request_applications
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_talent_request_application();

-- ---------------------------------------------------------------------------
-- Cours et événements
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_notify_course_enrollment() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _course record;
BEGIN
  SELECT instructor_id, title INTO _course FROM courses WHERE id = NEW.course_id;
  PERFORM notify_user(_course.instructor_id, 'enrollment', NEW.student_id, '{name} s''est inscrit à votre cours', '/course/' || NEW.course_id,
    jsonb_build_object('title', _course.title));
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_course_enrollment ON public.course_enrollments;
CREATE TRIGGER trg_notify_course_enrollment AFTER INSERT ON public.course_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_course_enrollment();

CREATE OR REPLACE FUNCTION public.trg_notify_event_attendee() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _event record;
BEGIN
  SELECT organizer_id, title INTO _event FROM events WHERE id = NEW.event_id;
  PERFORM notify_user(_event.organizer_id, 'event', NEW.user_id, '{name} participe à votre événement', '/events',
    jsonb_build_object('title', _event.title, 'event_id', NEW.event_id));
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_event_attendee ON public.event_attendees;
CREATE TRIGGER trg_notify_event_attendee AFTER INSERT ON public.event_attendees
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_event_attendee();

-- ---------------------------------------------------------------------------
-- Contrats agent ↔ talent
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_notify_contract() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM notify_user(NEW.talent_id, 'contract', NEW.agent_id, '{name} vous propose un contrat', '/profile');
  ELSIF NEW.status IS DISTINCT FROM OLD.status AND NEW.status IN ('active', 'accepted') THEN
    PERFORM notify_user(NEW.agent_id, 'contract_accepted', NEW.talent_id, '{name} a accepté votre contrat', '/agent/' || NEW.agent_id);
  ELSIF NEW.status IS DISTINCT FROM OLD.status AND NEW.status IN ('declined', 'rejected') THEN
    PERFORM notify_user(NEW.agent_id, 'contract_declined', NEW.talent_id, '{name} a refusé votre contrat', '/agent/' || NEW.agent_id);
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_contract ON public.agent_talent_contracts;
CREATE TRIGGER trg_notify_contract AFTER INSERT OR UPDATE OF status ON public.agent_talent_contracts
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_contract();

-- ---------------------------------------------------------------------------
-- Vérification : la décision de l'équipe
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_notify_verification() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status IN ('approved', 'rejected', 'info_requested') THEN
    PERFORM notify_user(NEW.user_id, 'verification_' || CASE WHEN NEW.status = 'info_requested' THEN 'info' ELSE NEW.status END,
      NULL, 'Votre demande de vérification a été traitée', '/verification', jsonb_build_object('badge', NEW.badge_type));
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_verification ON public.verification_requests;
CREATE TRIGGER trg_notify_verification AFTER UPDATE OF status ON public.verification_requests
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_verification();
