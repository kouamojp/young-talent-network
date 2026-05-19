import React, { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

declare global {
  interface Window { VKIDSDK?: any }
}

const VK_APP_ID = 54599927;
const SDK_SRC = 'https://unpkg.com/@vkid/sdk@<3.0.0/dist-sdk/umd/index.js';

const loadSdk = () =>
  new Promise<void>((resolve, reject) => {
    if (window.VKIDSDK) return resolve();
    const existing = document.querySelector(`script[src="${SDK_SRC}"]`) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('VKID SDK failed to load')));
      return;
    }
    const s = document.createElement('script');
    s.src = SDK_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('VKID SDK failed to load'));
    document.head.appendChild(s);
  });

const VKLoginButton: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await loadSdk();
        if (cancelled || !containerRef.current || renderedRef.current) return;
        const VKID = window.VKIDSDK;
        VKID.Config.init({
          app: VK_APP_ID,
          redirectUrl: window.location.origin,
          responseMode: VKID.ConfigResponseMode.Callback,
          source: VKID.ConfigSource.LOWCODE,
          scope: 'email',
        });

        const oAuth = new VKID.OAuthList();
        oAuth.render({
          container: containerRef.current,
          oauthList: ['vkid', 'mail_ru'],
        })
          .on(VKID.WidgetEvents.ERROR, (e: any) => {
            console.error('VKID error', e);
            toast({ title: 'Ошибка ВКонтакте', description: String(e?.code ?? e), variant: 'destructive' });
          })
          .on(VKID.OAuthListInternalEvents.LOGIN_SUCCESS, async (payload: any) => {
            try {
              const tokens = await VKID.Auth.exchangeCode(payload.code, payload.device_id);
              const access_token = tokens.access_token;
              const user_id = tokens.user_id;

              const { data, error } = await supabase.functions.invoke('vk-auth', {
                body: { access_token, user_id },
              });
              if (error || !data?.token_hash) throw new Error(error?.message || data?.error || 'VK auth failed');

              const { error: otpErr } = await supabase.auth.verifyOtp({
                type: 'magiclink',
                token_hash: data.token_hash,
              });
              if (otpErr) throw otpErr;

              toast({ title: 'Вход выполнен', description: 'Добро пожаловать!' });
              navigate('/profile');
            } catch (err: any) {
              console.error(err);
              toast({ title: 'Ошибка входа', description: err.message ?? String(err), variant: 'destructive' });
            }
          });
        renderedRef.current = true;
      } catch (e: any) {
        console.error(e);
      }
    })();

    return () => { cancelled = true; };
  }, [navigate, toast]);

  return <div ref={containerRef} className="w-full [&_iframe]:!w-full" />;
};

export default VKLoginButton;
