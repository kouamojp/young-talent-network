
-- Trigger function: award XP for comments
CREATE OR REPLACE FUNCTION public.award_comment_xp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _xp INT := 5;
  _coins NUMERIC := 0.0005;
  _new_level INT;
BEGIN
  INSERT INTO user_levels (user_id, xp_total, yat_coins, level)
  VALUES (NEW.user_id, _xp, _coins, 1)
  ON CONFLICT (user_id) DO UPDATE
    SET xp_total = user_levels.xp_total + _xp,
        yat_coins = user_levels.yat_coins + _coins,
        level = GREATEST(user_levels.level, 1 + FLOOR((user_levels.xp_total + _xp) / 100)::int);

  SELECT level INTO _new_level FROM user_levels WHERE user_id = NEW.user_id;

  INSERT INTO coin_transactions (user_id, amount, reason, xp_earned)
  VALUES (NEW.user_id, _coins, 'comment', _xp);

  -- Auto-award badges at milestones
  IF _new_level >= 5 THEN
    INSERT INTO user_badges (user_id, badge_name, badge_icon, badge_color)
    VALUES (NEW.user_id, 'Rising Star', '⭐', '#facc15')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_award_comment_xp
AFTER INSERT ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.award_comment_xp();

-- Trigger function: award XP for new connections (accepted)
CREATE OR REPLACE FUNCTION public.award_connection_xp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _xp INT := 3;
  _coins NUMERIC := 0.0003;
  _uid UUID;
  _new_level INT;
BEGIN
  -- Award XP to both parties when connection is accepted
  IF NEW.status = 'accepted' AND (OLD IS NULL OR OLD.status <> 'accepted') THEN
    FOREACH _uid IN ARRAY ARRAY[NEW.user_id, NEW.connected_user_id] LOOP
      INSERT INTO user_levels (user_id, xp_total, yat_coins, level)
      VALUES (_uid, _xp, _coins, 1)
      ON CONFLICT (user_id) DO UPDATE
        SET xp_total = user_levels.xp_total + _xp,
            yat_coins = user_levels.yat_coins + _coins,
            level = GREATEST(user_levels.level, 1 + FLOOR((user_levels.xp_total + _xp) / 100)::int);

      SELECT level INTO _new_level FROM user_levels WHERE user_id = _uid;

      INSERT INTO coin_transactions (user_id, amount, reason, xp_earned)
      VALUES (_uid, _coins, 'connection', _xp);

      IF _new_level >= 5 THEN
        INSERT INTO user_badges (user_id, badge_name, badge_icon, badge_color)
        VALUES (_uid, 'Rising Star', '⭐', '#facc15')
        ON CONFLICT DO NOTHING;
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_award_connection_xp
AFTER INSERT OR UPDATE ON public.connections
FOR EACH ROW EXECUTE FUNCTION public.award_connection_xp();
