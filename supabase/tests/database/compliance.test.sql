-- Tests pgTAP des règles de conformité : `supabase test db`
-- (base locale démarrée avec `supabase start`, migrations appliquées).
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
SET search_path = public, extensions;

SELECT plan(12);

-- Comptes de test : un adulte, un mineur de 16 ans, un mineur de 14 ans avec e-mail parent.
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
  ('00000000-0000-0000-0000-0000000000a1', 'adulte@test.local', '{"name":"Adulte","birthday":"1990-01-01"}'),
  ('00000000-0000-0000-0000-0000000000b1', 'ado16@test.local',  jsonb_build_object('name','Ado16','birthday', (current_date - interval '16 years')::date::text)),
  ('00000000-0000-0000-0000-0000000000c1', 'ado14@test.local',  jsonb_build_object('name','Ado14','birthday', (current_date - interval '14 years')::date::text, 'parent_email','parent@test.local'));

-- 1. Inscription refusée sous 13 ans
SELECT throws_ok(
  $$INSERT INTO auth.users (id, email, raw_user_meta_data)
    VALUES ('00000000-0000-0000-0000-0000000000d1', 'enfant@test.local',
            jsonb_build_object('birthday', (current_date - interval '10 years')::date::text))$$,
  'P0001',
  NULL,
  'un enfant de 10 ans ne peut pas s''inscrire'
);

-- 2-3. Date de naissance reprise et accord parental créé pour le 14 ans
SELECT ok((SELECT birthday IS NOT NULL FROM profiles WHERE id = '00000000-0000-0000-0000-0000000000c1'), 'date de naissance enregistrée');
SELECT is((SELECT status FROM parental_consents WHERE user_id = '00000000-0000-0000-0000-0000000000c1'), 'pending', 'accord parental en attente');

-- 4. Le 14 ans sans accord ne peut pas envoyer de message
SELECT is(message_block_reason('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000b1'),
          'sender_consent_pending', 'messagerie bloquée sans accord parental');

-- 5. Adulte -> mineur non connectés : refusé
SELECT is(message_block_reason('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000b1'),
          'minor_not_connected', 'un adulte ne peut pas écrire à un mineur inconnu');

-- 6. Après une demande d'ami acceptée : autorisé
INSERT INTO connections (user_id, connected_user_id, status)
VALUES ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000b1', 'accepted');
SELECT is(message_block_reason('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000b1'),
          NULL, 'connectés : message autorisé');

-- 7. Un blocage l'emporte, dans les deux sens
INSERT INTO user_blocks (blocker_id, blocked_id)
VALUES ('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000a1');
SELECT is(message_block_reason('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000b1'),
          'blocked', 'bloqué : message refusé');

-- 8. Après validation de l'accord parental, le 14 ans n'est plus restreint par l'accord
UPDATE parental_consents SET status = 'granted' WHERE user_id = '00000000-0000-0000-0000-0000000000c1';
SELECT is(consent_required('00000000-0000-0000-0000-0000000000c1'), false, 'accord donné');

-- Les tests suivants s'exécutent avec les droits d'un membre connecté (l'adulte).
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}', true);

-- 9. Les colonnes privées de profiles ne sont pas lisibles via l'API
SELECT throws_ok($$SELECT email FROM profiles LIMIT 1$$, '42501', NULL, 'e-mail illisible pour les autres membres');

-- 10. Les colonnes publiques restent lisibles
SELECT lives_ok($$SELECT id, name, city FROM profiles LIMIT 1$$, 'colonnes publiques lisibles');

-- 11. Ses propres données privées restent accessibles via get_profile_private
SELECT is((SELECT email FROM get_profile_private(ARRAY['00000000-0000-0000-0000-0000000000a1'::uuid])),
          'adulte@test.local', 'on voit son propre e-mail');

-- 12. Jamais de coordonnées publiques pour un mineur
SELECT is((SELECT count(*)::int FROM get_public_contact('00000000-0000-0000-0000-0000000000b1')), 0,
          'aucune coordonnée publique pour un mineur');

SELECT * FROM finish();
ROLLBACK;
