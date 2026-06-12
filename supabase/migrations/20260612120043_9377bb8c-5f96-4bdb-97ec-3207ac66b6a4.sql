
-- ALBUMS
CREATE TABLE public.music_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  cover_url TEXT,
  year INT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.music_albums TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.music_albums TO authenticated;
GRANT ALL ON public.music_albums TO service_role;
ALTER TABLE public.music_albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Albums are viewable by everyone" ON public.music_albums FOR SELECT USING (true);
CREATE POLICY "Users manage own albums" ON public.music_albums FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_music_albums_updated BEFORE UPDATE ON public.music_albums FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TRACKS
CREATE TABLE public.music_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  album_id UUID REFERENCES public.music_albums(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  cover_url TEXT,
  duration_seconds INT,
  genre TEXT,
  style TEXT,
  origin TEXT NOT NULL DEFAULT 'human' CHECK (origin IN ('ai','human')),
  plays_count INT NOT NULL DEFAULT 0,
  likes_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.music_tracks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.music_tracks TO authenticated;
GRANT ALL ON public.music_tracks TO service_role;
ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tracks are viewable by everyone" ON public.music_tracks FOR SELECT USING (true);
CREATE POLICY "Users manage own tracks" ON public.music_tracks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_music_tracks_updated BEFORE UPDATE ON public.music_tracks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_music_tracks_genre ON public.music_tracks(genre);
CREATE INDEX idx_music_tracks_style ON public.music_tracks(style);
CREATE INDEX idx_music_tracks_user ON public.music_tracks(user_id);
CREATE INDEX idx_music_tracks_album ON public.music_tracks(album_id);

-- PLAYLISTS
CREATE TABLE public.music_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  cover_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.music_playlists TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.music_playlists TO authenticated;
GRANT ALL ON public.music_playlists TO service_role;
ALTER TABLE public.music_playlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public playlists viewable" ON public.music_playlists FOR SELECT USING (is_public OR auth.uid() = user_id);
CREATE POLICY "Users manage own playlists" ON public.music_playlists FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_music_playlists_updated BEFORE UPDATE ON public.music_playlists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PLAYLIST TRACKS
CREATE TABLE public.music_playlist_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES public.music_playlists(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES public.music_tracks(id) ON DELETE CASCADE,
  position INT NOT NULL DEFAULT 0,
  added_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (playlist_id, track_id)
);
GRANT SELECT ON public.music_playlist_tracks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.music_playlist_tracks TO authenticated;
GRANT ALL ON public.music_playlist_tracks TO service_role;
ALTER TABLE public.music_playlist_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Playlist tracks viewable when playlist viewable" ON public.music_playlist_tracks FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.music_playlists p WHERE p.id = playlist_id AND (p.is_public OR p.user_id = auth.uid())));
CREATE POLICY "Owner manages playlist tracks" ON public.music_playlist_tracks FOR ALL
  USING (EXISTS (SELECT 1 FROM public.music_playlists p WHERE p.id = playlist_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.music_playlists p WHERE p.id = playlist_id AND p.user_id = auth.uid()));

-- LIKES
CREATE TABLE public.music_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES public.music_tracks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, track_id)
);
GRANT SELECT, INSERT, DELETE ON public.music_likes TO authenticated;
GRANT ALL ON public.music_likes TO service_role;
ALTER TABLE public.music_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own likes" ON public.music_likes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own likes" ON public.music_likes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- PLAYS (recommendations history)
CREATE TABLE public.music_plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES public.music_tracks(id) ON DELETE CASCADE,
  listened_seconds INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.music_plays TO authenticated;
GRANT INSERT ON public.music_plays TO anon;
GRANT ALL ON public.music_plays TO service_role;
ALTER TABLE public.music_plays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own plays" ON public.music_plays FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can record a play" ON public.music_plays FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Triggers to keep counters in sync
CREATE OR REPLACE FUNCTION public.update_music_likes_count() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.music_tracks SET likes_count = likes_count + 1 WHERE id = NEW.track_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.music_tracks SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.track_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END; $$;
CREATE TRIGGER trg_music_likes_count AFTER INSERT OR DELETE ON public.music_likes
FOR EACH ROW EXECUTE FUNCTION public.update_music_likes_count();

CREATE OR REPLACE FUNCTION public.update_music_plays_count() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.music_tracks SET plays_count = plays_count + 1 WHERE id = NEW.track_id;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_music_plays_count AFTER INSERT ON public.music_plays
FOR EACH ROW EXECUTE FUNCTION public.update_music_plays_count();
