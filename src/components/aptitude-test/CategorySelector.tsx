import React from 'react';
import { Card } from '@/components/ui/card';
import { TestCategory } from './testData';

type CategorySelectorProps = {
  categories: TestCategory[];
  onSelect: (categoryId: string) => void;
};

const CategorySelector: React.FC<CategorySelectorProps> = ({ categories, onSelect }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-2">Choose a Category</h2>
        <p className="text-muted-foreground text-sm">
          Select the domain you want to test your aptitudes in
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <Card
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className="p-5 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-2 hover:border-primary/50"
          >
            <div className="text-3xl mb-3">{cat.icon}</div>
            <h3 className="font-semibold text-lg mb-1">{cat.name}</h3>
            <p className="text-sm text-muted-foreground">{cat.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CategorySelector;
