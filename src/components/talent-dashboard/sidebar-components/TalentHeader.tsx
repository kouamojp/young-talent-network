
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';

interface TalentHeaderProps {
  isOpenToWork: boolean;
  levelProgress: number;
  onToggleWork: (value: boolean) => void;
}

const TalentHeader: React.FC<TalentHeaderProps> = ({
  isOpenToWork,
  levelProgress,
  onToggleWork,
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="w-12 h-12 border-2 border-white/20">
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-bold text-lg">John Doe</h2>
          <p className="text-sm text-white/80">Your Talent HQ</p>
        </div>
      </div>
      
      {/* Status Toggle */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Open to Work</span>
          <Switch
            checked={isOpenToWork}
            onCheckedChange={onToggleWork}
          />
        </div>
        
        {isOpenToWork && (
          <Badge className="bg-green-500 text-white animate-pulse">
            💚 OPEN TO WORK
          </Badge>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>🔋 Charging to Level 10!</span>
            <span>{levelProgress}%</span>
          </div>
          <Progress value={levelProgress} className="h-2" />
        </div>
      </div>
    </div>
  );
};

export default TalentHeader;
