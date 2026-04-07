import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Smartphone, Share, MoreVertical, Plus, Check, Monitor, ChevronRight } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop');

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) setPlatform('ios');
    else if (/android/.test(ua)) setPlatform('android');
    else setPlatform('desktop');

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    
    window.addEventListener('appinstalled', () => setIsInstalled(true));
    
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
  };

  const features = [
    { icon: '⚡', title: 'Accès instantané', desc: 'Lancez YAT directement depuis votre écran d\'accueil' },
    { icon: '📱', title: 'Expérience native', desc: 'Interface plein écran sans barre de navigateur' },
    { icon: '🔔', title: 'Notifications', desc: 'Restez informé des nouvelles opportunités' },
    { icon: '🌐', title: 'Accès hors ligne', desc: 'Consultez votre profil même sans connexion' },
  ];

  if (isInstalled) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full text-center border-none shadow-xl">
          <CardContent className="pt-8 pb-8 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Application installée !</h2>
            <p className="text-muted-foreground">
              YAT est maintenant disponible sur votre écran d'accueil. Vous pouvez fermer ce navigateur et utiliser l'application directement.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary via-blue-600 to-purple-600 text-white px-4 py-12 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
          <Smartphone className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Installer YAT</h1>
        <p className="text-white/80 max-w-sm mx-auto">
          Ajoutez Young & Talented à votre écran d'accueil pour une expérience optimale
        </p>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-6 space-y-6 pb-24">
        {/* Install Button */}
        {deferredPrompt && (
          <Card className="border-none shadow-xl">
            <CardContent className="p-6 text-center">
              <Button
                onClick={handleInstall}
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-semibold text-lg h-14 rounded-xl"
              >
                <Download className="mr-2 h-5 w-5" />
                Installer l'application
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Platform-specific instructions */}
        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4 text-lg">
              {platform === 'ios' ? 'Comment installer sur iPhone' : 
               platform === 'android' ? 'Comment installer sur Android' : 
               'Comment installer'}
            </h3>
            
            {platform === 'ios' ? (
              <div className="space-y-4">
                <Step number={1} icon={<Share className="h-5 w-5" />} text="Appuyez sur le bouton Partager en bas du navigateur Safari" />
                <Step number={2} icon={<Plus className="h-5 w-5" />} text={"Faites défiler et appuyez sur \"Sur l'écran d'accueil\""} />
                <Step number={3} icon={<Check className="h-5 w-5" />} text={"Appuyez sur \"Ajouter\" en haut à droite"} />
              </div>
            ) : platform === 'android' ? (
              <div className="space-y-4">
                <Step number={1} icon={<MoreVertical className="h-5 w-5" />} text="Appuyez sur le menu ⋮ en haut à droite du navigateur" />
                <Step number={2} icon={<Download className="h-5 w-5" />} text={"Appuyez sur \"Installer l'application\" ou \"Ajouter à l'écran d'accueil\""} />
                <Step number={3} icon={<Check className="h-5 w-5" />} text={"Confirmez l'installation"} />
              </div>
            ) : (
              <div className="space-y-4">
                <Step number={1} icon={<Monitor className="h-5 w-5" />} text="Cliquez sur l'icône d'installation dans la barre d'adresse" />
                <Step number={2} icon={<Check className="h-5 w-5" />} text='Cliquez sur "Installer" dans la boîte de dialogue' />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <div>
          <h3 className="font-semibold text-foreground mb-3 text-lg px-1">Pourquoi installer YAT ?</h3>
          <div className="grid grid-cols-2 gap-3">
            {features.map((f) => (
              <Card key={f.title} className="border-none shadow-md">
                <CardContent className="p-4">
                  <span className="text-2xl mb-2 block">{f.icon}</span>
                  <h4 className="font-semibold text-sm text-foreground">{f.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Step: React.FC<{ number: number; icon: React.ReactNode; text: string }> = ({ number, icon, text }) => (
  <div className="flex items-start gap-3">
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
      {number}
    </div>
    <div className="flex items-center gap-2 pt-1">
      <span className="text-primary">{icon}</span>
      <span className="text-sm text-foreground">{text}</span>
    </div>
  </div>
);

export default Install;
