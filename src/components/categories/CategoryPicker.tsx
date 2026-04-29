import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useYatCategories } from '@/hooks/useYatCategories';
import { useLanguage } from '@/i18n/LanguageContext';

interface CategoryPickerProps {
  selected: string[];
  onChange: (ids: string[]) => void;
  max?: number;
  suggestions?: string[];
}

const CategoryPicker: React.FC<CategoryPickerProps> = ({ selected, onChange, max = 3, suggestions = [] }) => {
  const { categories, loading, getCategoryName } = useYatCategories();
  const { t } = useLanguage();

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else if (selected.length < max) {
      onChange([...selected, id]);
    }
  };

  const applySuggestions = () => {
    const merged = Array.from(new Set([...selected, ...suggestions])).slice(0, max);
    onChange(merged);
  };

  if (loading) return <div className="text-xs text-muted-foreground">Loading…</div>;

  const suggestionCats = suggestions
    .map((id) => categories.find((c) => c.id === id))
    .filter(Boolean) as typeof categories;

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        {t('categories.pickHint') || `Select up to ${max} categories`} ({selected.length}/{max})
      </p>

      {suggestionCats.length > 0 && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-2 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              {t('categories.suggested') || 'Suggested for you'}
            </div>
            <button
              type="button"
              onClick={applySuggestions}
              className="text-[11px] text-primary hover:underline"
            >
              {t('categories.applyAll') || 'Apply all'}
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestionCats.map((cat) => {
              const isSelected = selected.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggle(cat.id)}
                  className={cn(
                    'text-xs px-2 py-1 rounded-md border transition',
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-primary/40 text-primary hover:bg-primary/10'
                  )}
                >
                  {getCategoryName(cat)}
                </button>
              );
            })}
          </div>
        </div>
      )}

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
