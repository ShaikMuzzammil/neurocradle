-- NeuroCradle Database Schema
-- Run in Supabase SQL editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Profiles ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name    TEXT,
  avatar_url   TEXT,
  bio          TEXT,
  website      TEXT,
  github       TEXT,
  twitter      TEXT,
  role         TEXT DEFAULT 'user',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles readable" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Hand Sessions ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hand_sessions (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title         TEXT,
  session_data  JSONB NOT NULL DEFAULT '{}',
  duration      INTEGER NOT NULL DEFAULT 0,  -- seconds
  gesture_labels TEXT[] DEFAULT '{}',
  thumbnail_url  TEXT,
  public         BOOLEAN DEFAULT false,
  view_count    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hand_sessions_user ON public.hand_sessions(user_id);
CREATE INDEX idx_hand_sessions_created ON public.hand_sessions(created_at DESC);
CREATE INDEX idx_hand_sessions_public ON public.hand_sessions(public) WHERE public = true;

ALTER TABLE public.hand_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own sessions" ON public.hand_sessions
  FOR SELECT USING (auth.uid() = user_id OR public = true);
CREATE POLICY "Users insert own sessions" ON public.hand_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own sessions" ON public.hand_sessions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own sessions" ON public.hand_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- ── Contact Submissions ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT,
  category   TEXT NOT NULL DEFAULT 'general',
  message    TEXT NOT NULL,
  priority   TEXT NOT NULL DEFAULT 'Medium',
  status     TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert contacts" ON public.contact_submissions
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can read contacts" ON public.contact_submissions
  FOR SELECT USING (auth.role() = 'service_role');

-- ── Session Likes ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.session_likes (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id  UUID REFERENCES public.hand_sessions ON DELETE CASCADE NOT NULL,
  user_id     UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, user_id)
);

CREATE INDEX idx_likes_session ON public.session_likes(session_id);

ALTER TABLE public.session_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read likes" ON public.session_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON public.session_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON public.session_likes
  FOR DELETE USING (auth.uid() = user_id);

-- ── Session Comments ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.session_comments (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id  UUID REFERENCES public.hand_sessions ON DELETE CASCADE NOT NULL,
  user_id     UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  body        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_session ON public.session_comments(session_id);

ALTER TABLE public.session_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments" ON public.session_comments FOR SELECT USING (true);
CREATE POLICY "Auth users can comment" ON public.session_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.session_comments
  FOR DELETE USING (auth.uid() = user_id);

-- ── Storage Buckets ────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public) VALUES ('session-thumbnails', 'session-thumbnails', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery-images', 'gallery-images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Anyone can read session-thumbnails" ON storage.objects
  FOR SELECT USING (bucket_id = 'session-thumbnails');
CREATE POLICY "Auth users can upload thumbnails" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'session-thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can read gallery" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery-images');
CREATE POLICY "Auth users can upload gallery" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'gallery-images' AND auth.role() = 'authenticated');

-- ── Realtime ──────────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_comments;

-- ── Updated at trigger ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
