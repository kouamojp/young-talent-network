import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useYatCategories } from '@/hooks/useYatCategories';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Categories: React.FC = () => {
  const { categories, getCategoryName, getSubcategoryName, getSubcategoriesFor, loading } = useYatCategories();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const filtered = categories.filter((c) =>
    !q || getCategoryName(c).toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">{t('categories.title') || 'YAT Categories'}</h1>
        <p className="text-sm text-muted-foreground">
          {t('categories.subtitle') || 'Browse all categories used across the platform'}
        </p>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-10" placeholder={t('common.search') || 'Search'} value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cat) => {
          const subs = getSubcategoriesFor(cat.id);
          return (
            <Card
              key={cat.id}
              className="p-4 cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5"
              onClick={() => navigate(`/yat-database?category=${cat.slug}`)}
              style={{ borderTop: `3px solid ${cat.color || 'hsl(var(--primary))'}` }}
            >
              <h3 className="font-semibold mb-2">{getCategoryName(cat)}</h3>
              <div className="flex flex-wrap gap-1.5">
                {subs.slice(0, 6).map((s) => (
                  <Badge key={s.id} variant="secondary" className="text-xs font-normal">
                    {getSubcategoryName(s)}
                  </Badge>
                ))}
                {subs.length > 6 && (
                  <Badge variant="outline" className="text-xs">+{subs.length - 6}</Badge>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Categories;
