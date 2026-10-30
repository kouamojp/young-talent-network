import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useYatCategories } from '@/hooks/useYatCategories';
import { useLanguage } from '@/i18n/LanguageContext';
import { Separator } from '@/components/ui/separator';

const SidebarCategories: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
  const { categories, getCategoryName, loading } = useYatCategories();
  const { t } = useLanguage();
  const top = categories.slice(0, 10);

  if (loading || categories.length === 0) return null;

  return (
    <div>
      <Separator className="mb-3" />
      <p className="px-2 text-xs font-semibold text-muted-foreground mb-1">
        {t('categories.title') || 'Categories'}
      </p>
      <div className="space-y-0.5">
        {top.map((cat) => (
          <Link
            key={cat.id}
            to={`/yat-database?category=${cat.slug}`}
            onClick={onNavigate}
            className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
              <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground" style={{ backgroundColor: cat.color || undefined }} />
            </div>
            <span className="text-[13.5px] font-medium truncate flex-1">{getCategoryName(cat)}</span>
          </Link>
        ))}
        <Link
          to="/categories"
          onClick={onNavigate}
          className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-accent transition-colors text-primary"
        >
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
            <ChevronRight className="h-[18px] w-[18px]" />
          </div>
          <span className="text-[13.5px] font-semibold">{t('categories.viewAll') || 'All categories'}</span>
        </Link>
      </div>
    </div>
  );
};

export default SidebarCategories;
