-- =============================================================================
-- Stockage : pièces jointes des messages privées, et envoi limité à son dossier.
--
-- 1. Les pièces jointes des messages allaient dans le bucket PUBLIC
--    `profile-files` : quiconque avait le lien pouvait ouvrir le fichier.
--    Elles vont désormais dans le bucket PRIVÉ `message-files`, rangées par
--    conversation : <conversation_id>/<expéditeur_id>/<fichier>. Seuls les
--    membres de la conversation peuvent les lire (liens signés temporaires).
--    Les anciennes pièces jointes restent où elles sont.
--
-- 2. Tout utilisateur connecté pouvait envoyer un fichier dans le dossier d'un
--    autre membre (`profile-files`, `marketplace-files`). L'envoi est maintenant
--    limité à son propre dossier : <mon_id>/…
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('message-files', 'message-files', false, 20971520)
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = EXCLUDED.file_size_limit;

-- Premier dossier du chemin interprété comme identifiant de conversation
-- (NULL si ce n'est pas un UUID, pour ne jamais faire échouer la policy).
CREATE OR REPLACE FUNCTION public.storage_path_conversation(_name text)
RETURNS uuid
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN split_part(_name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN split_part(_name, '/', 1)::uuid
  END;
$$;

DROP POLICY IF EXISTS "Conversation members read message files" ON storage.objects;
CREATE POLICY "Conversation members read message files"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'message-files'
    AND public.is_conversation_member(public.storage_path_conversation(name), auth.uid())
  );

-- On n'envoie que dans une conversation dont on est membre, dans son sous-dossier.
DROP POLICY IF EXISTS "Conversation members upload message files" ON storage.objects;
CREATE POLICY "Conversation members upload message files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'message-files'
    AND split_part(name, '/', 2) = auth.uid()::text
    AND public.is_conversation_member(public.storage_path_conversation(name), auth.uid())
  );

DROP POLICY IF EXISTS "Senders delete their message files" ON storage.objects;
CREATE POLICY "Senders delete their message files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'message-files' AND split_part(name, '/', 2) = auth.uid()::text);

-- ---------------------------------------------------------------------------
-- Envoi limité à son propre dossier dans les buckets publics
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can upload profile files" ON storage.objects;
CREATE POLICY "Authenticated users can upload profile files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profile-files' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Authenticated users can upload marketplace files" ON storage.objects;
CREATE POLICY "Authenticated users can upload marketplace files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'marketplace-files' AND (storage.foldername(name))[1] = auth.uid()::text);
