import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import { TestCategory } from './testData';

type CategorySelectorProps = {
  categories: TestCategory[];
  onSelect: (categoryId: string) => void;
};

const CategorySelector: React.FC<CategorySelectorProps> = ({ categories, onSelect }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-2">Choisissez une catégorie</h2>
        <p className="text-muted-foreground text-sm">
          Sélectionnez le domaine dans lequel vous souhaitez tester vos aptitudes et découvrir vos capacités
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <Card
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className="p-5 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-2 hover:border-primary/50 group"
          >
            <div className="flex items-start justify-between">
              <div className="text-3xl mb-3">{cat.icon}</div>
              <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="font-semibold text-lg mb-1">{cat.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">{cat.description}</p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">5 questions</Badge>
              <Badge variant="secondary" className="text-xs">~3 min</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CategorySelector;
