import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/i18n/LanguageContext';

export interface YatCategory {
  id: string;
  slug: string;
  name_en: string;
  name_fr: string;
  name_ru: string;
  icon: string | null;
  color: string | null;
  sort_order: number;
}

export interface YatSubcategory {
  id: string;
  category_id: string;
  slug: string;
  name_en: string;
  name_fr: string;
  name_ru: string;
  sort_order: number;
}

export const useYatCategories = () => {
  const [categories, setCategories] = useState<YatCategory[]>([]);
  const [subcategories, setSubcategories] = useState<YatSubcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [cats, subs] = await Promise.all([
        supabase.from('yat_categories').select('*').order('sort_order'),
        supabase.from('yat_subcategories').select('*').order('sort_order'),
      ]);
      if (!mounted) return;
      if (cats.data) setCategories(cats.data as YatCategory[]);
      if (subs.data) setSubcategories(subs.data as YatSubcategory[]);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const getCategoryName = (cat: YatCategory) =>
    language === 'fr' ? cat.name_fr : language === 'ru' ? cat.name_ru : cat.name_en;

  const getSubcategoryName = (sub: YatSubcategory) =>
    language === 'fr' ? sub.name_fr : language === 'ru' ? sub.name_ru : sub.name_en;

  const getSubcategoriesFor = (categoryId: string) =>
    subcategories.filter((s) => s.category_id === categoryId);

  return { categories, subcategories, loading, getCategoryName, getSubcategoryName, getSubcategoriesFor };
};
