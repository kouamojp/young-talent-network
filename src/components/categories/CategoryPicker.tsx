import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useYatCategories } from '@/hooks/useYatCategories';
import { useLanguage } from '@/i18n/LanguageContext';

interface CategoryPickerProps {
  selected: string[];
  onChange: (ids: string[]) => void;
  max?: number;
}

const CategoryPicker: React.FC<CategoryPickerProps> = ({ selected, onChange, max = 3 }) => {
  const { categories, loading, getCategoryName } = useYatCategories();
  const { t } = useLanguage();

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else if (selected.length < max) {
      onChange([...selected, id]);
    }
  };

  if (loading) return <div className="text-xs text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        {t('categories.pickHint') || `Select up to ${max} categories`} ({selected.length}/{max})
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {categories.map((cat) => {
          const isSelected = selected.includes(cat.id);
          const disabled = !isSelected && selected.length >= max;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggle(cat.id)}
              disabled={disabled}
              className={cn(
                'relative flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all text-left',
                isSelected ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border hover:border-primary/50',
                disabled && 'opacity-40 cursor-not-allowed',
              )}
              style={isSelected && cat.color ? { borderColor: cat.color, color: cat.color } : undefined}
            >
              <span className="truncate">{getCategoryName(cat)}</span>
              {isSelected && <Check className="h-4 w-4 ml-auto flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryPicker;
