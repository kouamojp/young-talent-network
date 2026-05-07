
-- User levels & coins table
CREATE TABLE public.user_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  level integer NOT NULL DEFAULT 1,
  xp_total integer NOT NULL DEFAULT 0,
  yat_coins numeric(12,4) NOT NULL DEFAULT 0,
  card_background text DEFAULT 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Levels viewable by everyone" ON public.user_levels FOR SELECT USING (true);
CREATE POLICY "Users can update own level data" ON public.user_levels FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own level data" ON public.user_levels FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_user_levels_updated_at BEFORE UPDATE ON public.user_levels
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- User badges table
CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_type text NOT NULL,
  badge_name text NOT NULL,
  description text,
  icon text,
  earned_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges viewable by everyone" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "System inserts badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function: award coins & XP on post creation
CREATE OR REPLACE FUNCTION public.award_post_xp()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _old_level integer;
  _new_level integer;
BEGIN
  INSERT INTO public.user_levels (user_id, xp_total, yat_coins, level)
  VALUES (NEW.user_id, 10, 0.001, 1)
  ON CONFLICT (user_id) DO UPDATE SET
    xp_total = user_levels.xp_total + 10,
    yat_coins = user_levels.yat_coins + 0.001,
    level = GREATEST(1, (user_levels.xp_total + 10) / 100 + 1);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_award_post_xp AFTER INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.award_post_xp();

-- Function: award coins & XP on like
CREATE OR REPLACE FUNCTION public.award_like_xp()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Award to the post author, not the liker
  INSERT INTO public.user_levels (user_id, xp_total, yat_coins, level)
  VALUES (
    (SELECT user_id FROM public.posts WHERE id = NEW.post_id),
    1, 0.0001, 1
  )
  ON CONFLICT (user_id) DO UPDATE SET
    xp_total = user_levels.xp_total + 1,
    yat_coins = user_levels.yat_coins + 0.0001,
    level = GREATEST(1, (user_levels.xp_total + 1) / 100 + 1);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_award_like_xp AFTER INSERT ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.award_like_xp();

-- Auto-create user_levels row on profile creation
CREATE OR REPLACE FUNCTION public.init_user_levels()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_levels (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_init_user_levels AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.init_user_levels();
