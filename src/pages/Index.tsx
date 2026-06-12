import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Index: React.FC = () => {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (authed === null) return null;
  if (authed) return <Navigate to="/feed" replace />;
  // Non-authenticated/non-subscribed visitors land directly on the AI Assistant
  return <Navigate to="/assistant" replace />;
};

export default Index;
