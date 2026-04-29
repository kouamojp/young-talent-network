import React from 'react';
import { Link } from 'react-router-dom';
import { Tag, ChevronRight } from 'lucide-react';
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
      <Separator className="mb-2.5" />
      <p className="px-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
        {t('categories.title') || 'Categories'}
      </p>
      <div className="space-y-0.5">
        {top.map((cat) => (
          <Link
            key={cat.id}
            to={`/yat-database?category=${cat.slug}`}
            onClick={onNavigate}
            className="flex items-center gap-3 px-2.5 py-1.5 rounded-lg hover:bg-muted/80 transition-all"
          >
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-muted">
              <Tag className="h-4 w-4" style={{ color: cat.color || undefined }} />
            </div>
            <span className="text-[13px] font-medium truncate flex-1">{getCategoryName(cat)}</span>
          </Link>
        ))}
        <Link
          to="/categories"
          onClick={onNavigate}
          className="flex items-center gap-3 px-2.5 py-1.5 rounded-lg hover:bg-muted/80 transition-all text-primary"
        >
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-primary/10">
            <ChevronRight className="h-4 w-4" />
          </div>
          <span className="text-[13px] font-medium">{t('categories.viewAll') || 'All categories'}</span>
        </Link>
      </div>
    </div>
  );
};

export default SidebarCategories;
