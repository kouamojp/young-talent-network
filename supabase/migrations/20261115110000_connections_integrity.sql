-- =============================================================================
-- Demandes d'ami : seul le destinataire peut accepter.
--
-- Les policies laissaient le demandeur créer une connexion déjà « accepted »
-- (c'est ce que faisait le bouton « suivre » des Shorts) ou accepter lui-même
-- sa propre demande. Or la messagerie entre un adulte et un mineur n'est
-- ouverte qu'aux membres connectés : un adulte pouvait donc se connecter seul
-- à un mineur. Ce trigger ferme cette faille, quel que soit le client.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.enforce_connection_rules()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
BEGIN
  -- Service role, migrations et tâches internes (pas d'utilisateur) : rien à imposer.
  IF _uid IS NULL OR public.has_role(_uid, 'admin') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.user_id = NEW.connected_user_id THEN
      RAISE EXCEPTION 'Vous ne pouvez pas vous ajouter vous-même.';
    END IF;
    IF public.is_blocked_between(NEW.user_id, NEW.connected_user_id) THEN
      RAISE EXCEPTION 'Vous ne pouvez pas envoyer de demande à cette personne.';
    END IF;
    -- Une demande inverse déjà en attente vaut acceptation : pas de doublon.
    IF EXISTS (
      SELECT 1 FROM public.connections c
      WHERE c.user_id = NEW.connected_user_id AND c.connected_user_id = NEW.user_id
    ) THEN
      RAISE EXCEPTION 'Une demande existe déjà entre vous deux.' USING ERRCODE = 'unique_violation';
    END IF;
    NEW.status := 'pending';
    RETURN NEW;
  END IF;

  -- UPDATE : les deux comptes liés ne changent jamais, et seul le destinataire accepte.
  IF NEW.user_id <> OLD.user_id OR NEW.connected_user_id <> OLD.connected_user_id THEN
    RAISE EXCEPTION 'Une demande d''ami ne peut pas être transférée.';
  END IF;
  IF NEW.status = 'accepted' AND OLD.status IS DISTINCT FROM 'accepted' AND _uid <> OLD.connected_user_id THEN
    RAISE EXCEPTION 'Seul le destinataire peut accepter une demande d''ami.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_connection_rules ON public.connections;
CREATE TRIGGER trg_enforce_connection_rules
  BEFORE INSERT OR UPDATE ON public.connections
  FOR EACH ROW EXECUTE FUNCTION public.enforce_connection_rules();
