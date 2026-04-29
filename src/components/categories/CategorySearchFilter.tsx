import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useYatCategories } from '@/hooks/useYatCategories';
import { useLanguage } from '@/i18n/LanguageContext';

interface CategorySearchFilterProps {
  category: string | null;
  subcategory: string | null;
  onCategoryChange: (id: string | null) => void;
  onSubcategoryChange: (id: string | null) => void;
  className?: string;
}

const ALL = '__all__';

const CategorySearchFilter: React.FC<CategorySearchFilterProps> = ({
  category, subcategory, onCategoryChange, onSubcategoryChange, className,
}) => {
  const { categories, getCategoryName, getSubcategoryName, getSubcategoriesFor } = useYatCategories();
  const { t } = useLanguage();
  const subs = category ? getSubcategoriesFor(category) : [];

  return (
    <div className={`flex flex-col sm:flex-row gap-2 ${className || ''}`}>
      <Select
        value={category ?? ALL}
        onValueChange={(v) => {
          const next = v === ALL ? null : v;
          onCategoryChange(next);
          onSubcategoryChange(null);
        }}
      >
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder={t('categories.selectCategory') || 'Category'} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t('categories.all') || 'All categories'}</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>{getCategoryName(c)}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={subcategory ?? ALL}
        onValueChange={(v) => onSubcategoryChange(v === ALL ? null : v)}
        disabled={!category || subs.length === 0}
      >
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder={t('categories.selectSubcategory') || 'Subcategory'} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t('categories.allSub') || 'All subcategories'}</SelectItem>
          {subs.map((s) => (
            <SelectItem key={s.id} value={s.id}>{getSubcategoryName(s)}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CategorySearchFilter;
