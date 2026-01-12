-- Drop tables if they exist partially and recreate
DROP TABLE IF EXISTS public.user_skills CASCADE;
DROP TABLE IF EXISTS public.skills CASCADE;

-- Create skills table
CREATE TABLE public.skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_skills table for linking users to skills
CREATE TABLE public.user_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  years_experience INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

-- Enable RLS on new tables
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;

-- Skills policies (public read)
CREATE POLICY "Anyone can view skills" ON public.skills FOR SELECT USING (true);

-- User skills policies
CREATE POLICY "Users can view all user skills" ON public.user_skills FOR SELECT USING (true);
CREATE POLICY "Users can manage their own skills" ON public.user_skills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own skills" ON public.user_skills FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own skills" ON public.user_skills FOR DELETE USING (auth.uid() = user_id);

-- Insert default skills
INSERT INTO public.skills (name, category) VALUES
('JavaScript', 'Programming'),
('TypeScript', 'Programming'),
('React', 'Frontend'),
('Node.js', 'Backend'),
('Python', 'Programming'),
('UI/UX Design', 'Design'),
('Graphic Design', 'Design'),
('Project Management', 'Management'),
('Data Analysis', 'Analytics'),
('Machine Learning', 'AI'),
('Marketing', 'Business'),
('Sales', 'Business'),
('Communication', 'Soft Skills'),
('Leadership', 'Soft Skills'),
('Problem Solving', 'Soft Skills'),
('Photography', 'Creative'),
('Video Editing', 'Creative'),
('Music Production', 'Creative'),
('Writing', 'Creative'),
('Public Speaking', 'Soft Skills');

-- Create indexes for better performance
CREATE INDEX idx_user_skills_user_id ON public.user_skills(user_id);
CREATE INDEX idx_user_skills_skill_id ON public.user_skills(skill_id);
CREATE INDEX idx_skills_category ON public.skills(category);