
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Film, Play, Users } from 'lucide-react';

interface CreatorStudioProps {
  viewerCount: number;
  onToast: (title: string, description: string) => void;
}

const CreatorStudio: React.FC<CreatorStudioProps> = ({ viewerCount, onToast }) => {
  const handleGoLive = () => {
    onToast(
      "🎬 Going live!",
      "Your audience is waiting for you!"
    );
  };

  return (
    <Card className="bg-white/10 border-white/20 text-white">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Film className="h-5 w-5 animate-bounce" />
          <h3 className="font-semibold">🎬 Creator Studio</h3>
        </div>
        
        <div className="space-y-2">
          <Button 
            onClick={handleGoLive}
            className="w-full bg-red-500 hover:bg-red-600 text-white border-0"
          >
            <Play className="h-4 w-4 mr-2" />
            ▶️ Live HQ
          </Button>
          
          <div className="flex items-center justify-between text-sm">
            <span>🎥 My TV Channel</span>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{viewerCount}</span>
            </div>
          </div>
          
          <Button variant="ghost" className="w-full text-white hover:bg-white/10">
            🎓 Learnings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatorStudio;
