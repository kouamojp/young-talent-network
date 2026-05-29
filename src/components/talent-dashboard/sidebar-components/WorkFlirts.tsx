import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WorkFlirtsProps {
  onToast: (title: string, description: string) => void;
}

const WorkFlirts: React.FC<WorkFlirtsProps> = ({ onToast }) => {
  const navigate = useNavigate();
  return (
    <Card className="bg-white/10 border-white/20 text-white">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="h-5 w-5 animate-bounce" />
          <h3 className="font-semibold">💌 Work Flirts</h3>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-white/80">5 job requests waiting</p>
          <Button
            onClick={() => navigate('/work')}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white border-0"
          >
            ❤️ Swipe to Accept
          </Button>
          <Button
            variant="ghost"
            className="w-full text-white hover:bg-white/10"
            onClick={() => onToast('💡 Indice envoyé', 'Votre intérêt a été signalé discrètement.')}
          >
            Drop a Hint 💡
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkFlirts;
