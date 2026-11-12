import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import NotificationsTab from '@/components/profile/NotificationsTab';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) navigate('/auth');
    });
  }, [navigate]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <NotificationsTab />
    </div>
  );
};

export default NotificationsPage;
