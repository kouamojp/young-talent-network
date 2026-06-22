-- Calls history table (WebRTC signaling is done over Supabase Realtime broadcast,
-- this table only persists the call log shown in the UI).
CREATE TABLE public.calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  callee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  is_video BOOLEAN NOT NULL DEFAULT false,
  -- ringing | connected | ended | missed | rejected | cancelled
  status TEXT NOT NULL DEFAULT 'ringing',
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;

-- Either party can see the call in their history
CREATE POLICY "Users can view their own calls"
  ON public.calls FOR SELECT
  USING (auth.uid() = caller_id OR auth.uid() = callee_id);

-- A user can only log a call they initiated
CREATE POLICY "Users can create calls they make"
  ON public.calls FOR INSERT
  WITH CHECK (auth.uid() = caller_id);

-- Both parties may update the row (to set connected/ended/duration)
CREATE POLICY "Participants can update their calls"
  ON public.calls FOR UPDATE
  USING (auth.uid() = caller_id OR auth.uid() = callee_id);

CREATE INDEX idx_calls_caller_id ON public.calls(caller_id, created_at DESC);
CREATE INDEX idx_calls_callee_id ON public.calls(callee_id, created_at DESC);
