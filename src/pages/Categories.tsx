import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useYatCategories } from '@/hooks/useYatCategories';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Sparkles, ChevronRight } from 'lucide-react';
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink,
  PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';

const PAGE_SIZE = 9;

const Categories: React.FC = () => {
  const { categories, getCategoryName, getSubcategoryName, getSubcategoriesFor, loading } = useYatCategories();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState('');

  const page = Math.max(1, parseInt(params.get('page') || '1', 10) || 1);

  const filtered = useMemo(() => categories.filter((c) =>
    !q || getCategoryName(c).toLowerCase().includes(q.toLowerCase())
  ), [categories, q, getCategoryName]);

  // Top categories = first 6 by sort_order (already ordered)
  const topCategories = categories.slice(0, 6);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const goPage = (p: number) => {
    const next = new URLSearchParams(params);
    next.set('page', String(p));
    setParams(next, { replace: true });
  };

  const goToCategory = (slug: string, subSlug?: string) => {
    const url = subSlug
      ? `/yat-database?category=${slug}&subcategory=${subSlug}`
      : `/yat-database?category=${slug}`;
    navigate(url);
  };

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
        <Input
          className="pl-10"
          placeholder={t('common.search') || 'Search'}
          value={q}
          onChange={(e) => { setQ(e.target.value); goPage(1); }}
        />
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}

      {/* Top categories */}
      {!q && topCategories.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t('categories.top') || 'Top categories'}
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {topCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => goToCategory(cat.slug)}
                className="px-3 py-2 rounded-lg border bg-card hover:bg-accent transition text-sm text-left truncate"
                style={{ borderLeft: `3px solid ${cat.color || 'hsl(var(--primary))'}` }}
              >
                {getCategoryName(cat)}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* All categories with subcategories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paged.map((cat) => {
          const subs = getSubcategoriesFor(cat.id);
          return (
            <Card
              key={cat.id}
              className="p-4 hover:shadow-md transition-all"
              style={{ borderTop: `3px solid ${cat.color || 'hsl(var(--primary))'}` }}
            >
              <button
                className="flex items-center justify-between w-full font-semibold mb-2 hover:text-primary transition"
                onClick={() => goToCategory(cat.slug)}
              >
                <span className="truncate text-left">{getCategoryName(cat)}</span>
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
              </button>
              <div className="flex flex-wrap gap-1.5">
                {subs.length === 0 && (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
                {subs.map((s) => (
                  <Badge
                    key={s.id}
                    variant="secondary"
                    className="text-xs font-normal cursor-pointer hover:bg-primary/15 hover:text-primary"
                    onClick={() => goToCategory(cat.slug, s.slug)}
                  >
                    {getSubcategoryName(s)}
                  </Badge>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {!loading && filtered.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">
          {t('common.noResults') || 'No results'}
        </p>
      )}

      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => { e.preventDefault(); if (safePage > 1) goPage(safePage - 1); }}
                className={safePage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={i + 1 === safePage}
                  onClick={(e) => { e.preventDefault(); goPage(i + 1); }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => { e.preventDefault(); if (safePage < totalPages) goPage(safePage + 1); }}
                className={safePage === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default Categories;
