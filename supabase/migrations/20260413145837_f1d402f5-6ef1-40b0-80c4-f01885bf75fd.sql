
-- Fix conversation_participants INSERT policy (recursive)
DROP POLICY IF EXISTS "Users can add participants to conversations" ON public.conversation_participants;
CREATE POLICY "Users can add participants to conversations"
ON public.conversation_participants
FOR INSERT TO authenticated
WITH CHECK (true);

-- Fix conversation_participants SELECT policy (recursive)  
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON public.conversation_participants;
CREATE POLICY "Users can view participants in their conversations"
ON public.conversation_participants
FOR SELECT TO authenticated
USING (
  user_id = auth.uid() 
  OR conversation_id IN (
    SELECT cp.conversation_id FROM public.conversation_participants cp WHERE cp.user_id = auth.uid()
  )
);

-- Add DELETE policy for conversation_participants
CREATE POLICY "Users can leave conversations"
ON public.conversation_participants
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- Add DELETE policy for connections
CREATE POLICY "Users can delete connections"
ON public.connections
FOR DELETE TO authenticated
USING (user_id = auth.uid() OR connected_user_id = auth.uid());

-- Auto-assign admin to first user trigger
CREATE OR REPLACE FUNCTION public.handle_first_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_first_admin_assignment ON public.profiles;
CREATE TRIGGER on_first_admin_assignment
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_first_admin();

-- Add admin DELETE policies for content moderation
CREATE POLICY "Admins can delete any post"
ON public.posts FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete any event"
ON public.events FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
