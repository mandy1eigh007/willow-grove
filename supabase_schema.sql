-- Enable RLS on all tables
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

-- Create tables
CREATE TABLE public.episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  age_mode text NOT NULL CHECK (age_mode IN ('4-6', '7-9', '10-12')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.panels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id uuid REFERENCES public.episodes(id) ON DELETE CASCADE,
  idx int NOT NULL,
  body text NOT NULL,
  next_idx int NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(episode_id, idx)
);

CREATE TABLE public.choices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id uuid REFERENCES public.episodes(id) ON DELETE CASCADE,
  from_idx int NOT NULL,
  choice_text text NOT NULL,
  to_idx int NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.progress (
  profile_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  episode_id uuid REFERENCES public.episodes(id) ON DELETE SET NULL,
  panel_idx int NOT NULL DEFAULT 0,
  choice_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS Policies for episodes, panels, choices: readable by authenticated users, no client inserts/updates/deletes
CREATE POLICY "episodes_read" ON public.episodes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "panels_read" ON public.panels FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "choices_read" ON public.choices FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for progress: only if progress.profile_id belongs to a profile where profiles.user_id = auth.uid()
CREATE POLICY "progress_all" ON public.progress FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = progress.profile_id
    AND profiles.user_id = auth.uid()
  )
);

-- Demo seed data
INSERT INTO public.episodes (slug, title, age_mode) VALUES ('demo-episode', 'Demo Adventure', '7-9');

-- Assuming the episode id is generated, but for simplicity, we'll use a fixed uuid for demo
-- In practice, you'd insert and capture the uuid
INSERT INTO public.panels (episode_id, idx, body, next_idx) VALUES
  ((SELECT id FROM public.episodes WHERE slug = 'demo-episode'), 0, 'Welcome to the adventure! You find yourself in a forest.', 1),
  ((SELECT id FROM public.episodes WHERE slug = 'demo-episode'), 1, 'You see a path ahead. What do you do?', 2),
  ((SELECT id FROM public.episodes WHERE slug = 'demo-episode'), 2, 'At the fork in the path, you can go left or right.', NULL),
  ((SELECT id FROM public.episodes WHERE slug = 'demo-episode'), 3, 'You went left and found a treasure!', 5),
  ((SELECT id FROM public.episodes WHERE slug = 'demo-episode'), 4, 'You went right and encountered a dragon!', 5),
  ((SELECT id FROM public.episodes WHERE slug = 'demo-episode'), 5, 'The adventure ends here.', NULL);

INSERT INTO public.choices (episode_id, from_idx, choice_text, to_idx) VALUES
  ((SELECT id FROM public.episodes WHERE slug = 'demo-episode'), 2, 'Go left', 3),
  ((SELECT id FROM public.episodes WHERE slug = 'demo-episode'), 2, 'Go right', 4);