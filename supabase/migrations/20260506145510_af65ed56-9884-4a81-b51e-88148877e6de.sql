
-- Assistant conversations
CREATE TABLE public.assistant_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text DEFAULT 'New conversation',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.assistant_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own assistant convos" ON public.assistant_conversations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Assistant messages
CREATE TABLE public.assistant_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.assistant_conversations(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user',
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.assistant_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own assistant msgs" ON public.assistant_messages FOR ALL
  USING (EXISTS (SELECT 1 FROM public.assistant_conversations ac WHERE ac.id = conversation_id AND ac.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.assistant_conversations ac WHERE ac.id = conversation_id AND ac.user_id = auth.uid()));

-- Agent suggestions
CREATE TABLE public.agent_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  suggestion_type text NOT NULL DEFAULT 'general',
  title text NOT NULL,
  description text,
  action_link text,
  action_data jsonb DEFAULT '{}'::jsonb,
  dismissed boolean NOT NULL DEFAULT false,
  acted_on boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);
ALTER TABLE public.agent_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own suggestions" ON public.agent_suggestions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own suggestions" ON public.agent_suggestions FOR UPDATE USING (auth.uid() = user_id);

-- Triggers
CREATE TRIGGER update_assistant_conversations_updated_at BEFORE UPDATE ON public.assistant_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
