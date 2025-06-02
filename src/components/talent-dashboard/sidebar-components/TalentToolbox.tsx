
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search, Zap, Megaphone, AlertTriangle } from 'lucide-react';

interface TalentToolboxProps {
  onToast: (title: string, description: string) => void;
}

const TalentToolbox: React.FC<TalentToolboxProps> = ({ onToast }) => {
  const handleSOS = () => {
    onToast(
      "🆘 SOS Boost activated!",
      "Emergency funding request sent to your network!"
    );
  };

  const handleShake = () => {
    const fortunes = [
      "🌟 Your next breakthrough is just one connection away!",
      "💎 Trust your instincts - they're your superpower!",
      "🚀 Today's failure is tomorrow's success story!",
      "✨ You're not just talented, you're irreplaceable!",
      "🎯 Focus on progress, not perfection!"
    ];
    const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
    onToast(
      "🥠 Talent Fortune Cookie",
      randomFortune
    );
  };

  return (
    <>
      {/* Toolbox */}
      <div className="mt-6 pt-4 border-t border-white/20">
        <h3 className="font-semibold mb-3">🛠️ Toolbox</h3>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button variant="ghost" className="text-white hover:bg-white/10">
            <Search className="h-4 w-4 mr-1" />
            🔍 Discovery
          </Button>
          <Button variant="ghost" className="text-white hover:bg-white/10">
            <Zap className="h-4 w-4 mr-1" />
            🧠 Talent GPT
          </Button>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium">⚡ Quick Actions</h4>
          <div className="grid grid-cols-1 gap-1">
            <Button variant="ghost" className="text-white hover:bg-white/10 justify-start">
              💸 Cash Out
            </Button>
            <Button variant="ghost" className="text-white hover:bg-white/10 justify-start">
              <Megaphone className="h-4 w-4 mr-2" />
              📣 Go Viral
            </Button>
            <Button 
              onClick={handleSOS}
              variant="ghost" 
              className="text-white hover:bg-white/10 justify-start"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              🆘 SOS Boost
            </Button>
          </div>
        </div>
      </div>

      {/* Secret Easter Egg */}
      <div className="mt-6 pt-4 border-t border-white/20">
        <Button 
          onClick={handleShake}
          variant="ghost" 
          className="w-full text-white hover:bg-white/10 text-xs"
        >
          🥠 Shake for Fortune Cookie
        </Button>
      </div>
    </>
  );
};

export default TalentToolbox;
