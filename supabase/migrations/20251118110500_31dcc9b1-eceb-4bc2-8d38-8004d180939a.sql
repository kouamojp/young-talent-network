-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create user_categories table for user category preferences
CREATE TABLE public.user_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_pages table for user-created pages
CREATE TABLE public.user_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  category TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_interests table for detailed user interests
CREATE TABLE public.user_interests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interest_type TEXT NOT NULL,
  interest_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ai_search_history table
CREATE TABLE public.ai_search_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  results JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_search_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_categories
CREATE POLICY "Users can view their own categories"
  ON public.user_categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own categories"
  ON public.user_categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
  ON public.user_categories FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_pages
CREATE POLICY "Public pages viewable by everyone"
  ON public.user_pages FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own pages"
  ON public.user_pages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pages"
  ON public.user_pages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pages"
  ON public.user_pages FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_interests
CREATE POLICY "Users can view their own interests"
  ON public.user_interests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interests"
  ON public.user_interests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interests"
  ON public.user_interests FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for ai_search_history
CREATE POLICY "Users can view their own search history"
  ON public.ai_search_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create search history"
  ON public.ai_search_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_categories_user_id ON public.user_categories(user_id);
CREATE INDEX idx_user_pages_user_id ON public.user_pages(user_id);
CREATE INDEX idx_user_pages_category ON public.user_pages(category);
CREATE INDEX idx_user_interests_user_id ON public.user_interests(user_id);
CREATE INDEX idx_ai_search_history_user_id ON public.ai_search_history(user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_pages_updated_at
  BEFORE UPDATE ON public.user_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();