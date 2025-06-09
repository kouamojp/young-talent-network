
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const WelcomePost: React.FC = () => {
  return (
    <Card className="bg-white">
      <CardContent className="p-6">
        <h3 className="font-semibold mb-3">Всем привет!</h3>
        <p className="text-gray-700 text-sm">
          Наверхстка и персонаж постоперативных операционных навыков дисциплин.
          Баннеры и консультированные ластиковые анализы поддержки в таких блоках. 
          Кого-нибудь другого-позволе решение проблем и шага, при базе кличко, проблематики и выставки.
        </p>
        <div className="flex items-center gap-4 text-sm text-gray-500 mt-4">
          <button className="hover:text-[#5181B8]">👍 8</button>
          <button className="hover:text-[#5181B8]">💬 1</button>
          <button className="hover:text-[#5181B8]">↗ 1</button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomePost;
