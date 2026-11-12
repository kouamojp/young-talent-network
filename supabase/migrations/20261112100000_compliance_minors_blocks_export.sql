-- =============================================================================
-- Conformité : protection des mineurs, accord parental, blocage, export RGPD.
--
-- Règles retenues :
--   * moins de 13 ans : inscription refusée ;
--   * 13-14 ans : accord parental obligatoire (validé par e-mail). Tant qu'il
--     n'est pas donné, le compte ne peut ni envoyer ni recevoir de messages ;
--   * un adulte et un mineur ne peuvent s'écrire que s'ils sont connectés
--     (demande d'ami acceptée). Une date de naissance inconnue compte comme
--     adulte ;
--   * un blocage, dans un sens ou dans l'autre, empêche tout message.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Helpers d'âge
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.age_years(_birthday date)
RETURNS integer
LANGUAGE sql
STABLE  -- dépend de current_date
AS $$
  SELECT CASE WHEN _birthday IS NULL THEN NULL
              ELSE date_part('year', age(current_date, _birthday))::integer END;
$$;

CREATE OR REPLACE FUNCTION public.is_minor(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT public.age_years(birthday) < 18 FROM public.profiles WHERE id = _user_id), false);
$$;

-- ---------------------------------------------------------------------------
-- Accord parental
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.parental_consents (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_email text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'granted', 'revoked')),
  token uuid DEFAULT gen_random_uuid(),
  requested_at timestamptz NOT NULL DEFAULT now(),
  last_sent_at timestamptz,
  granted_at timestamptz
);

-- Pas de policy : la table n'est lisible et modifiable que par les fonctions
-- SECURITY DEFINER ci-dessous et par la fonction Edge (service role). Le jeton
-- ne doit jamais être visible par le mineur, sinon il pourrait s'auto-valider.
ALTER TABLE public.parental_consents ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.consent_required(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((
    SELECT public.age_years(p.birthday) < 15
       AND NOT EXISTS (
         SELECT 1 FROM public.parental_consents c
         WHERE c.user_id = p.id AND c.status = 'granted'
       )
    FROM public.profiles p WHERE p.id = _user_id
  ), false);
$$;

-- La date de naissance ne peut plus être modifiée par l'utilisateur une fois
-- renseignée (sinon un mineur pourrait se déclarer majeur). Les admins et le
-- service role (auth.uid() NULL) restent libres de la corriger.
CREATE OR REPLACE FUNCTION public.lock_profile_birthday()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.birthday IS NOT NULL
     AND NEW.birthday IS DISTINCT FROM OLD.birthday
     AND auth.uid() IS NOT NULL
     AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'La date de naissance ne peut plus être modifiée. Contactez le support.'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lock_profile_birthday ON public.profiles;
CREATE TRIGGER trg_lock_profile_birthday
  BEFORE UPDATE OF birthday ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.lock_profile_birthday();

-- Inscription : on reprend la date de naissance et l'e-mail du parent passés
-- dans les métadonnées du signUp. Les inscriptions OAuth (Telegram, VK…)
-- n'ont pas de date : elle sera demandée à la première connexion.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _birthday date;
  _age integer;
  _parent_email text := NULLIF(trim(NEW.raw_user_meta_data->>'parent_email'), '');
BEGIN
  BEGIN
    _birthday := NULLIF(NEW.raw_user_meta_data->>'birthday', '')::date;
  EXCEPTION WHEN others THEN
    _birthday := NULL;
  END;
  _age := public.age_years(_birthday);

  IF _age IS NOT NULL AND _age < 13 THEN
    RAISE EXCEPTION 'YAT est réservé aux 13 ans et plus.';
  END IF;

  INSERT INTO public.profiles (id, user_type, name, email, avatar_url, birthday)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'talent'),
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1),
      ''
    ),
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    ),
    _birthday
  );

  IF _age IS NOT NULL AND _age < 15 AND _parent_email IS NOT NULL THEN
    INSERT INTO public.parental_consents (user_id, parent_email)
    VALUES (NEW.id, lower(_parent_email))
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Date de naissance pour les comptes qui n'en ont pas encore.
CREATE OR REPLACE FUNCTION public.set_my_birthday(_birthday date, _parent_email text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _age integer := public.age_years(_birthday);
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _birthday IS NULL OR _birthday > current_date THEN
    RAISE EXCEPTION 'Date de naissance invalide.';
  END IF;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = _uid AND birthday IS NOT NULL) THEN
    RAISE EXCEPTION 'La date de naissance est déjà renseignée.';
  END IF;
  IF _age < 13 THEN
    RAISE EXCEPTION 'YAT est réservé aux 13 ans et plus.';
  END IF;
  IF _age < 15 AND NULLIF(trim(_parent_email), '') IS NULL THEN
    RAISE EXCEPTION 'L''e-mail d''un parent est obligatoire avant 15 ans.';
  END IF;

  UPDATE public.profiles SET birthday = _birthday WHERE id = _uid;

  IF _age < 15 THEN
    INSERT INTO public.parental_consents (user_id, parent_email)
    VALUES (_uid, lower(trim(_parent_email)))
    ON CONFLICT (user_id) DO UPDATE
      SET parent_email = EXCLUDED.parent_email, status = 'pending',
          token = gen_random_uuid(), requested_at = now(), last_sent_at = NULL;
  END IF;
END;
$$;

-- Changer l'e-mail du parent tant que l'accord n'est pas donné.
CREATE OR REPLACE FUNCTION public.set_parent_email(_parent_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF NULLIF(trim(_parent_email), '') IS NULL OR position('@' in _parent_email) = 0 THEN
    RAISE EXCEPTION 'E-mail invalide.';
  END IF;
  IF NOT public.consent_required(_uid) THEN
    RAISE EXCEPTION 'Aucun accord parental n''est requis pour ce compte.';
  END IF;

  INSERT INTO public.parental_consents (user_id, parent_email)
  VALUES (_uid, lower(trim(_parent_email)))
  ON CONFLICT (user_id) DO UPDATE
    SET parent_email = EXCLUDED.parent_email, status = 'pending',
        token = gen_random_uuid(), requested_at = now(), last_sent_at = NULL;
END;
$$;

-- État de conformité du compte connecté, pour l'interface.
CREATE OR REPLACE FUNCTION public.my_compliance_status()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'user_type', p.user_type,
    'birthday_set', p.birthday IS NOT NULL,
    'age', public.age_years(p.birthday),
    'is_minor', COALESCE(public.age_years(p.birthday) < 18, false),
    'consent_required', public.consent_required(p.id),
    'consent_status', c.status,
    'parent_email', CASE WHEN c.parent_email IS NULL THEN NULL
                         ELSE left(c.parent_email, 2) || '***' || substr(c.parent_email, position('@' in c.parent_email)) END,
    'last_sent_at', c.last_sent_at
  )
  FROM public.profiles p
  LEFT JOIN public.parental_consents c ON c.user_id = p.id
  WHERE p.id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- Blocage d'utilisateurs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_blocks (
  blocker_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);

ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see who they blocked" ON public.user_blocks;
CREATE POLICY "Users see who they blocked"
  ON public.user_blocks FOR SELECT TO authenticated
  USING (blocker_id = auth.uid());

DROP POLICY IF EXISTS "Users can block" ON public.user_blocks;
CREATE POLICY "Users can block"
  ON public.user_blocks FOR INSERT TO authenticated
  WITH CHECK (blocker_id = auth.uid());

DROP POLICY IF EXISTS "Users can unblock" ON public.user_blocks;
CREATE POLICY "Users can unblock"
  ON public.user_blocks FOR DELETE TO authenticated
  USING (blocker_id = auth.uid());

CREATE OR REPLACE FUNCTION public.is_blocked_between(_a uuid, _b uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_blocks
    WHERE (blocker_id = _a AND blocked_id = _b) OR (blocker_id = _b AND blocked_id = _a)
  );
$$;

-- ---------------------------------------------------------------------------
-- Règles de messagerie
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.are_connected(_a uuid, _b uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.connections
    WHERE status = 'accepted'
      AND ((user_id = _a AND connected_user_id = _b) OR (user_id = _b AND connected_user_id = _a))
  );
$$;

-- Raison pour laquelle _sender ne peut pas écrire à _recipient, ou NULL si
-- c'est autorisé. Sert à la fois aux policies et aux messages d'erreur.
CREATE OR REPLACE FUNCTION public.message_block_reason(_sender uuid, _recipient uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_blocked_between(_sender, _recipient) THEN
    RETURN 'blocked';
  END IF;
  IF public.consent_required(_sender) THEN
    RETURN 'sender_consent_pending';
  END IF;
  IF public.consent_required(_recipient) THEN
    RETURN 'recipient_consent_pending';
  END IF;
  IF public.is_minor(_sender) <> public.is_minor(_recipient)
     AND NOT public.are_connected(_sender, _recipient) THEN
    RETURN 'minor_not_connected';
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.can_message_conversation(_conversation_id uuid, _sender uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = _conversation_id
      AND cp.user_id <> _sender
      AND public.message_block_reason(_sender, cp.user_id) IS NOT NULL
  );
$$;

-- Policy RESTRICTIVE : s'ajoute (ET logique) à la policy d'envoi existante.
DROP POLICY IF EXISTS "Messaging safety rules" ON public.messages;
CREATE POLICY "Messaging safety rules"
  ON public.messages AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.can_message_conversation(conversation_id, auth.uid()));

-- Création d'une conversation : même règle, avec un message clair.
CREATE OR REPLACE FUNCTION public.create_conversation_with_participant(_other_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _conv_id uuid;
  _current_user uuid := auth.uid();
  _existing_id uuid;
  _reason text;
BEGIN
  IF _current_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF _other_user_id = _current_user THEN
    RAISE EXCEPTION 'Cannot create conversation with yourself';
  END IF;

  _reason := public.message_block_reason(_current_user, _other_user_id);
  IF _reason = 'blocked' THEN
    RAISE EXCEPTION 'Vous ne pouvez pas écrire à cette personne.';
  ELSIF _reason = 'sender_consent_pending' THEN
    RAISE EXCEPTION 'La messagerie sera disponible après l''accord de votre parent.';
  ELSIF _reason = 'recipient_consent_pending' THEN
    RAISE EXCEPTION 'Cette personne ne peut pas encore recevoir de messages.';
  ELSIF _reason = 'minor_not_connected' THEN
    RAISE EXCEPTION 'Pour la sécurité des mineurs, vous devez d''abord être connectés (demande d''ami acceptée).';
  END IF;

  SELECT cp1.conversation_id INTO _existing_id
  FROM conversation_participants cp1
  JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
  JOIN conversations c ON c.id = cp1.conversation_id
  WHERE cp1.user_id = _current_user
    AND cp2.user_id = _other_user_id
    AND COALESCE(c.is_group, false) = false
  LIMIT 1;

  IF _existing_id IS NOT NULL THEN
    RETURN _existing_id;
  END IF;

  INSERT INTO conversations DEFAULT VALUES RETURNING id INTO _conv_id;

  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES (_conv_id, _current_user), (_conv_id, _other_user_id);

  RETURN _conv_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_conversation_with_participant(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- Export des données personnelles (RGPD art. 15 et 20)
-- ---------------------------------------------------------------------------
-- Parcourt toutes les tables publiques et exporte les lignes rattachées à
-- l'utilisateur par une colonne « propriétaire » connue.
CREATE OR REPLACE FUNCTION public.export_my_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _result jsonb := '{}'::jsonb;
  _rows jsonb;
  _col record;
  _owner_columns text[] := ARRAY[
    'user_id', 'sender_id', 'creator_id', 'author_id', 'student_id', 'streamer_id',
    'instructor_id', 'blocker_id', 'talent_id', 'agent_id', 'organization_id',
    'owner_id', 'requester_id', 'reporter_id', 'caller_id', 'receiver_id',
    'follower_id', 'uploader_id', 'seller_id', 'applicant_id'
  ];
  -- Tables jamais exportées : secrets ou données d'autres personnes.
  _excluded text[] := ARRAY['parental_consents'];
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;

  _result := jsonb_build_object(
    'exported_at', now(),
    'user_id', _uid,
    'profiles', (SELECT COALESCE(jsonb_agg(to_jsonb(p)), '[]'::jsonb) FROM public.profiles p WHERE p.id = _uid)
  );

  FOR _col IN
    SELECT c.table_name, c.column_name
    FROM information_schema.columns c
    JOIN information_schema.tables t
      ON t.table_schema = c.table_schema AND t.table_name = c.table_name AND t.table_type = 'BASE TABLE'
    WHERE c.table_schema = 'public'
      AND c.data_type = 'uuid'
      AND c.column_name = ANY(_owner_columns)
      AND c.table_name <> ALL(_excluded)
      AND c.table_name <> 'profiles'
    ORDER BY c.table_name, c.column_name
  LOOP
    EXECUTE format(
      'SELECT COALESCE(jsonb_agg(to_jsonb(x)), ''[]''::jsonb) FROM public.%I x WHERE x.%I = $1',
      _col.table_name, _col.column_name
    ) INTO _rows USING _uid;

    IF jsonb_array_length(_rows) > 0 THEN
      _result := _result || jsonb_build_object(
        _col.table_name || CASE WHEN _col.column_name = 'user_id' THEN '' ELSE '.' || _col.column_name END,
        _rows
      );
    END IF;
  END LOOP;

  -- Accord parental : on exporte l'état, jamais le jeton.
  _result := _result || jsonb_build_object('parental_consent', (
    SELECT to_jsonb(c) - 'token' FROM public.parental_consents c WHERE c.user_id = _uid
  ));

  RETURN _result;
END;
$$;

-- ---------------------------------------------------------------------------
-- Droits d'exécution
-- ---------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.set_my_birthday(date, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_parent_email(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.my_compliance_status() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.export_my_data() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.message_block_reason(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_my_birthday(date, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_parent_email(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_compliance_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.export_my_data() TO authenticated;
GRANT EXECUTE ON FUNCTION public.message_block_reason(uuid, uuid) TO authenticated;
