
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const FeaturedPost: React.FC = () => {
  return (
    <Card className="bg-white">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4">Почему ментальное здоровье малых команд?</h2>
        <div className="flex gap-4">
          <div className="flex-1">
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              Потому что именно развитие самостоятельности трансформирует функцию: 
              все еще больше создавать дополнительные преимущества, приходящие в голову, это отсутствие 
              определяемого времени различных дизайн.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <button className="hover:text-[#5181B8]">👍 12</button>
              <button className="hover:text-[#5181B8]">💬 3</button>
              <button className="hover:text-[#5181B8]">↗ 2</button>
            </div>
          </div>
          <div className="w-32 h-24 bg-gradient-to-br from-pink-400 via-purple-500 to-blue-500 rounded-lg flex-shrink-0">
            <div className="w-full h-full bg-black/20 rounded-lg flex items-center justify-center">
              <div className="text-white text-2xl">🎨</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeaturedPost;
