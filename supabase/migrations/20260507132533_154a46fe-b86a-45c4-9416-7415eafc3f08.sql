
-- 1. Coin transactions history table
CREATE TABLE public.coin_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  reason text NOT NULL,
  xp_earned integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own transactions" ON public.coin_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System inserts transactions" ON public.coin_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. Fix talent_media constraint to allow 'image'
ALTER TABLE public.talent_media DROP CONSTRAINT talent_media_media_type_check;
ALTER TABLE public.talent_media ADD CONSTRAINT talent_media_media_type_check
  CHECK (media_type = ANY (ARRAY['photo','video','youtube','image','audio','document']));

-- 3. Updated award_post_xp with coin history + auto badge
CREATE OR REPLACE FUNCTION public.award_post_xp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _old_level integer;
  _new_level integer;
  _uid uuid;
  _badge_name text;
  _badge_icon text;
BEGIN
  _uid := NEW.user_id;
  
  SELECT level INTO _old_level FROM user_levels WHERE user_id = _uid;
  IF _old_level IS NULL THEN _old_level := 0; END IF;

  INSERT INTO public.user_levels (user_id, xp_total, yat_coins, level)
  VALUES (_uid, 10, 0.001, 1)
  ON CONFLICT (user_id) DO UPDATE SET
    xp_total = user_levels.xp_total + 10,
    yat_coins = user_levels.yat_coins + 0.001,
    level = GREATEST(1, (user_levels.xp_total + 10) / 100 + 1);

  -- Log transaction
  INSERT INTO coin_transactions (user_id, amount, reason, xp_earned)
  VALUES (_uid, 0.001, 'post', 10);

  SELECT level INTO _new_level FROM user_levels WHERE user_id = _uid;

  -- Auto-award badge on level up
  IF _new_level > _old_level AND _old_level > 0 THEN
    SELECT
      CASE
        WHEN _new_level >= 50 THEN 'Icon'
        WHEN _new_level >= 25 THEN 'Champion'
        WHEN _new_level >= 20 THEN 'Master'
        WHEN _new_level >= 15 THEN 'Legend'
        WHEN _new_level >= 10 THEN 'Influencer'
        WHEN _new_level >= 5 THEN 'Rising Star'
        WHEN _new_level >= 3 THEN 'Creator'
        WHEN _new_level >= 2 THEN 'Explorer'
        ELSE 'Newcomer'
      END,
      CASE
        WHEN _new_level >= 50 THEN '🌟'
        WHEN _new_level >= 25 THEN '🏆'
        WHEN _new_level >= 20 THEN '💎'
        WHEN _new_level >= 15 THEN '👑'
        WHEN _new_level >= 10 THEN '🔥'
        WHEN _new_level >= 5 THEN '⭐'
        WHEN _new_level >= 3 THEN '✨'
        WHEN _new_level >= 2 THEN '🧭'
        ELSE '🌱'
      END
    INTO _badge_name, _badge_icon;

    INSERT INTO user_badges (user_id, badge_type, badge_name, icon, description)
    VALUES (_uid, 'level', _badge_name, _badge_icon, 'Reached level ' || _new_level)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- 4. Updated award_like_xp with coin history + auto badge
CREATE OR REPLACE FUNCTION public.award_like_xp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _old_level integer;
  _new_level integer;
  _uid uuid;
  _badge_name text;
  _badge_icon text;
BEGIN
  _uid := (SELECT user_id FROM public.posts WHERE id = NEW.post_id);
  IF _uid IS NULL THEN RETURN NEW; END IF;

  SELECT level INTO _old_level FROM user_levels WHERE user_id = _uid;
  IF _old_level IS NULL THEN _old_level := 0; END IF;

  INSERT INTO public.user_levels (user_id, xp_total, yat_coins, level)
  VALUES (_uid, 1, 0.0001, 1)
  ON CONFLICT (user_id) DO UPDATE SET
    xp_total = user_levels.xp_total + 1,
    yat_coins = user_levels.yat_coins + 0.0001,
    level = GREATEST(1, (user_levels.xp_total + 1) / 100 + 1);

  -- Log transaction
  INSERT INTO coin_transactions (user_id, amount, reason, xp_earned)
  VALUES (_uid, 0.0001, 'like', 1);

  SELECT level INTO _new_level FROM user_levels WHERE user_id = _uid;

  IF _new_level > _old_level AND _old_level > 0 THEN
    SELECT
      CASE
        WHEN _new_level >= 50 THEN 'Icon'
        WHEN _new_level >= 25 THEN 'Champion'
        WHEN _new_level >= 20 THEN 'Master'
        WHEN _new_level >= 15 THEN 'Legend'
        WHEN _new_level >= 10 THEN 'Influencer'
        WHEN _new_level >= 5 THEN 'Rising Star'
        WHEN _new_level >= 3 THEN 'Creator'
        WHEN _new_level >= 2 THEN 'Explorer'
        ELSE 'Newcomer'
      END,
      CASE
        WHEN _new_level >= 50 THEN '🌟'
        WHEN _new_level >= 25 THEN '🏆'
        WHEN _new_level >= 20 THEN '💎'
        WHEN _new_level >= 15 THEN '👑'
        WHEN _new_level >= 10 THEN '🔥'
        WHEN _new_level >= 5 THEN '⭐'
        WHEN _new_level >= 3 THEN '✨'
        WHEN _new_level >= 2 THEN '🧭'
        ELSE '🌱'
      END
    INTO _badge_name, _badge_icon;

    INSERT INTO user_badges (user_id, badge_type, badge_name, icon, description)
    VALUES (_uid, 'level', _badge_name, _badge_icon, 'Reached level ' || _new_level)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;
