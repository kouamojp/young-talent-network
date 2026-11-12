-- =============================================================================
-- Diffusion des directs (vidéo WebRTC du diffuseur vers chaque spectateur).
--
-- 1. signal_public_key : clé publique (JWK) du diffuseur pour ce direct. La
--    signalisation passe par un canal Realtime « broadcast » non authentifié :
--    le diffuseur signe chaque offre vidéo et le spectateur la vérifie avec
--    cette clé, que seul le diffuseur peut écrire (RLS). Personne ne peut donc
--    injecter sa propre vidéo dans le direct d'un autre.
-- 2. last_heartbeat_at : le diffuseur met sa ligne à jour toutes les 20 s ; un
--    direct sans signe de vie depuis 3 minutes (onglet fermé, coupure réseau)
--    est clos par close_stale_live_streams(), appelée par la liste des directs.
-- 3. live_streams est publiée en Realtime (compteur de spectateurs, fin du direct).
-- =============================================================================

ALTER TABLE public.live_streams
  ADD COLUMN IF NOT EXISTS signal_public_key text,
  ADD COLUMN IF NOT EXISTS last_heartbeat_at timestamptz NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION public.trg_live_streams_guard() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.streamer_id <> OLD.streamer_id THEN
    RAISE EXCEPTION 'Le diffuseur d''un direct ne peut pas être modifié.';
  END IF;
  IF NEW.is_live THEN
    -- Heure du serveur : l'horloge du navigateur n'est pas fiable.
    NEW.last_heartbeat_at := now();
  ELSIF OLD.is_live AND NEW.ended_at IS NULL THEN
    NEW.ended_at := now();
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_live_streams_guard ON public.live_streams;
CREATE TRIGGER trg_live_streams_guard BEFORE UPDATE ON public.live_streams
  FOR EACH ROW EXECUTE FUNCTION public.trg_live_streams_guard();

-- Clôt les directs abandonnés. Sans danger à exposer : idempotente, elle ne
-- touche que des directs dont le diffuseur a disparu.
CREATE OR REPLACE FUNCTION public.close_stale_live_streams()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.live_streams
  SET is_live = false, ended_at = last_heartbeat_at
  WHERE is_live
    AND last_heartbeat_at < now() - interval '3 minutes';
$$;

REVOKE EXECUTE ON FUNCTION public.close_stale_live_streams() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.close_stale_live_streams() TO anon, authenticated;

CREATE INDEX IF NOT EXISTS idx_live_streams_live ON public.live_streams (started_at DESC) WHERE is_live;

DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.live_streams; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
