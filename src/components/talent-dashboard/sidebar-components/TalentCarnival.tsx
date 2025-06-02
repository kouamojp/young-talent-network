
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Plus } from 'lucide-react';

const TalentCarnival: React.FC = () => {
  return (
    <Card className="bg-white/10 border-white/20 text-white">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Star className="h-5 w-5 animate-bounce" />
          <h3 className="font-semibold">🎪 Talent Carnival</h3>
        </div>
        
        <div className="space-y-2">
          <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white border-0">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
          <p className="text-sm text-white/80">🔥 3 trending stages live</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TalentCarnival;
