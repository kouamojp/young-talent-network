
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rocket } from 'lucide-react';

interface TalentLaunchpadProps {
  onToast: (title: string, description: string) => void;
}

const TalentLaunchpad: React.FC<TalentLaunchpadProps> = ({ onToast }) => {
  const handleBoostMe = () => {
    onToast(
      "🚀 Boosting your talent!",
      "Your profile is now trending in the talent marketplace!"
    );
  };

  return (
    <Card className="bg-white/10 border-white/20 text-white">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Rocket className="h-5 w-5 animate-bounce" />
          <h3 className="font-semibold">🚀 Talent Launchpad</h3>
        </div>
        <p className="text-sm text-white/80 mb-3">3 new opportunities waiting</p>
        <Button 
          onClick={handleBoostMe}
          className="w-full bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white border-0"
        >
          Boost Me! 🚀
        </Button>
      </CardContent>
    </Card>
  );
};

export default TalentLaunchpad;
