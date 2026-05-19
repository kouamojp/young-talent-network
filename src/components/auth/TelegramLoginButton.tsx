import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    onTelegramAuth?: (user: any) => void;
  }
}

const TelegramLoginButton: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [botUsername, setBotUsername] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch bot username from the edge function (keeps it out of client bundle)
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('telegram-auth', { method: 'GET' });
        if (error) throw error;
        if (data?.bot_username) setBotUsername(data.bot_username);
      } catch (e) {
        console.error('telegram-auth config error', e);
      }
    })();
  }, []);

  // Define global callback used by Telegram widget
  useEffect(() => {
    const friendly = (raw: string): string => {
      const m = (raw || '').toLowerCase();
      if (m.includes('bad telegram signature') || m.includes('signature'))
        return 'Неверная подпись Telegram. Попробуйте войти ещё раз.';
      if (m.includes('outdated') || m.includes('auth_date') || m.includes('expired'))
        return 'Срок действия данных Telegram истёк. Пожалуйста, повторите вход.';
      if (m.includes('invalid payload') || m.includes('invalid'))
        return 'Некорректные данные от Telegram. Попробуйте ещё раз.';
      if (m.includes('not configured'))
        return 'Telegram-вход временно недоступен. Попробуйте позже.';
      if (m.includes('failed to generate token'))
        return 'Не удалось создать сессию. Попробуйте ещё раз.';
      if (m.includes('network') || m.includes('fetch'))
        return 'Проблема с сетью. Проверьте подключение и повторите.';
      return raw || 'Не удалось войти через Telegram.';
    };

    window.onTelegramAuth = async (tgUser: any) => {
      try {
        const { data, error } = await supabase.functions.invoke('telegram-auth', {
          body: tgUser,
        });
        let serverMsg: string | undefined = (data as any)?.error;
        if (error && (error as any).context?.json) {
          try { serverMsg = (await (error as any).context.json())?.error; } catch {}
        } else if (error && (error as any).context?.text) {
          try { serverMsg = await (error as any).context.text(); } catch {}
        }
        if (error || serverMsg || !data?.token_hash) {
          throw new Error(serverMsg || error?.message || 'Telegram auth failed');
        }
        const { error: otpErr } = await supabase.auth.verifyOtp({
          type: 'magiclink',
          token_hash: data.token_hash,
        });
        if (otpErr) throw otpErr;
        toast({ title: 'Вход выполнен', description: 'Добро пожаловать!' });
        navigate('/profile');
      } catch (err: any) {
        console.error('Telegram auth error:', err);
        toast({
          title: 'Ошибка входа через Telegram',
          description: friendly(err?.message ?? String(err)),
          variant: 'destructive',
        });
      }
    };
    return () => { delete window.onTelegramAuth; };
  }, [navigate, toast]);

  // Inject Telegram widget script once we have the bot username
  useEffect(() => {
    if (!botUsername || !containerRef.current) return;
    containerRef.current.innerHTML = '';
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://telegram.org/js/telegram-widget.js?22';
    s.setAttribute('data-telegram-login', botUsername);
    s.setAttribute('data-size', 'large');
    s.setAttribute('data-radius', '8');
    s.setAttribute('data-onauth', 'onTelegramAuth(user)');
    s.setAttribute('data-request-access', 'write');
    s.setAttribute('data-userpic', 'false');
    containerRef.current.appendChild(s);
  }, [botUsername]);

  if (!botUsername) {
    return (
      <div className="w-full text-center text-xs text-muted-foreground py-2 border rounded-md">
        Загрузка Telegram…
      </div>
    );
  }

  return <div ref={containerRef} className="w-full flex justify-center [&>iframe]:!w-full" />;
};

export default TelegramLoginButton;
