
-- Categories table
CREATE TABLE public.yat_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.yat_subcategories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.yat_categories(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(category_id, slug)
);

CREATE TABLE public.user_yat_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category_id UUID NOT NULL REFERENCES public.yat_categories(id) ON DELETE CASCADE,
  subcategory_id UUID REFERENCES public.yat_subcategories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, category_id)
);

CREATE INDEX idx_user_yat_categories_user ON public.user_yat_categories(user_id);
CREATE INDEX idx_yat_subcategories_cat ON public.yat_subcategories(category_id);

ALTER TABLE public.yat_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yat_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_yat_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories viewable by everyone" ON public.yat_categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.yat_categories FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Subcategories viewable by everyone" ON public.yat_subcategories FOR SELECT USING (true);
CREATE POLICY "Admins manage subcategories" ON public.yat_subcategories FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "User cats viewable by everyone" ON public.user_yat_categories FOR SELECT USING (true);
CREATE POLICY "Users manage own cats insert" ON public.user_yat_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own cats update" ON public.user_yat_categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users manage own cats delete" ON public.user_yat_categories FOR DELETE USING (auth.uid() = user_id);

-- Limit 3 categories per user
CREATE OR REPLACE FUNCTION public.enforce_user_category_limit()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.user_yat_categories WHERE user_id = NEW.user_id) >= 3 THEN
    RAISE EXCEPTION 'A user can select at most 3 categories';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_user_category_limit
BEFORE INSERT ON public.user_yat_categories
FOR EACH ROW EXECUTE FUNCTION public.enforce_user_category_limit();

-- Seed categories
INSERT INTO public.yat_categories (slug, name_en, name_fr, name_ru, icon, color, sort_order) VALUES
('sport', 'Sport', 'Sport', 'Спорт', 'Trophy', '#3b82f6', 1),
('music', 'Music', 'Musique', 'Музыка', 'Music', '#a855f7', 2),
('dance', 'Dance', 'Danse', 'Танцы', 'PartyPopper', '#ec4899', 3),
('art', 'Art', 'Art', 'Искусство', 'Palette', '#f59e0b', 4),
('cinema', 'Cinema & TV', 'Cinéma & TV', 'Кино и ТВ', 'Film', '#ef4444', 5),
('tech', 'IT & Technology', 'IT & Technologie', 'IT и Технологии', 'Cpu', '#06b6d4', 6),
('business', 'Business', 'Business', 'Бизнес', 'Briefcase', '#10b981', 7),
('education', 'Education', 'Éducation', 'Образование', 'GraduationCap', '#6366f1', 8),
('science', 'Science', 'Science', 'Наука', 'Atom', '#14b8a6', 9),
('fashion', 'Fashion', 'Mode', 'Мода', 'Shirt', '#f43f5e', 10),
('food', 'Gastronomy', 'Gastronomie', 'Гастрономия', 'UtensilsCrossed', '#f97316', 11),
('health', 'Health & Wellness', 'Santé & Bien-être', 'Здоровье', 'Heart', '#84cc16', 12);

-- Subcategories (sample of strongest ones)
INSERT INTO public.yat_subcategories (category_id, slug, name_en, name_fr, name_ru, sort_order)
SELECT id, s.slug, s.en, s.fr, s.ru, s.ord FROM public.yat_categories c,
LATERAL (VALUES
  ('football','Football','Football','Футбол',1),
  ('basketball','Basketball','Basketball','Баскетбол',2),
  ('tennis','Tennis','Tennis','Теннис',3),
  ('martial-arts','Martial Arts','Arts martiaux','Единоборства',4),
  ('swimming','Swimming','Natation','Плавание',5),
  ('athletics','Athletics','Athlétisme','Лёгкая атлетика',6),
  ('gymnastics','Gymnastics','Gymnastique','Гимнастика',7),
  ('chess','Chess','Échecs','Шахматы',8)
) AS s(slug,en,fr,ru,ord) WHERE c.slug='sport';

INSERT INTO public.yat_subcategories (category_id, slug, name_en, name_fr, name_ru, sort_order)
SELECT id, s.slug, s.en, s.fr, s.ru, s.ord FROM public.yat_categories c,
LATERAL (VALUES
  ('vocal','Vocal','Chant','Вокал',1),
  ('piano','Piano','Piano','Фортепиано',2),
  ('guitar','Guitar','Guitare','Гитара',3),
  ('drums','Drums','Batterie','Ударные',4),
  ('dj','DJ / Producer','DJ / Producteur','DJ / Продюсер',5),
  ('classical','Classical','Classique','Классическая',6)
) AS s(slug,en,fr,ru,ord) WHERE c.slug='music';

INSERT INTO public.yat_subcategories (category_id, slug, name_en, name_fr, name_ru, sort_order)
SELECT id, s.slug, s.en, s.fr, s.ru, s.ord FROM public.yat_categories c,
LATERAL (VALUES
  ('ballet','Ballet','Ballet','Балет',1),
  ('hip-hop','Hip-Hop','Hip-Hop','Хип-хоп',2),
  ('contemporary','Contemporary','Contemporain','Контемпорари',3),
  ('ballroom','Ballroom','Danse de salon','Бальные',4),
  ('breaking','Breaking','Breaking','Брейкинг',5)
) AS s(slug,en,fr,ru,ord) WHERE c.slug='dance';

INSERT INTO public.yat_subcategories (category_id, slug, name_en, name_fr, name_ru, sort_order)
SELECT id, s.slug, s.en, s.fr, s.ru, s.ord FROM public.yat_categories c,
LATERAL (VALUES
  ('painting','Painting','Peinture','Живопись',1),
  ('sculpture','Sculpture','Sculpture','Скульптура',2),
  ('photography','Photography','Photographie','Фотография',3),
  ('digital-art','Digital Art','Art numérique','Цифровое искусство',4),
  ('illustration','Illustration','Illustration','Иллюстрация',5)
) AS s(slug,en,fr,ru,ord) WHERE c.slug='art';

INSERT INTO public.yat_subcategories (category_id, slug, name_en, name_fr, name_ru, sort_order)
SELECT id, s.slug, s.en, s.fr, s.ru, s.ord FROM public.yat_categories c,
LATERAL (VALUES
  ('acting','Acting','Comédien','Актёрское',1),
  ('directing','Directing','Réalisation','Режиссура',2),
  ('screenwriting','Screenwriting','Scénario','Сценарист',3),
  ('production','Production','Production','Продюсирование',4),
  ('vfx','VFX & Editing','VFX & Montage','VFX и монтаж',5)
) AS s(slug,en,fr,ru,ord) WHERE c.slug='cinema';

INSERT INTO public.yat_subcategories (category_id, slug, name_en, name_fr, name_ru, sort_order)
SELECT id, s.slug, s.en, s.fr, s.ru, s.ord FROM public.yat_categories c,
LATERAL (VALUES
  ('frontend','Frontend','Frontend','Фронтенд',1),
  ('backend','Backend','Backend','Бэкенд',2),
  ('mobile','Mobile','Mobile','Мобильная разработка',3),
  ('ai-ml','AI / ML','IA / ML','ИИ / ML',4),
  ('devops','DevOps','DevOps','DevOps',5),
  ('cybersecurity','Cybersecurity','Cybersécurité','Кибербезопасность',6),
  ('data','Data Science','Data Science','Data Science',7)
) AS s(slug,en,fr,ru,ord) WHERE c.slug='tech';

INSERT INTO public.yat_subcategories (category_id, slug, name_en, name_fr, name_ru, sort_order)
SELECT id, s.slug, s.en, s.fr, s.ru, s.ord FROM public.yat_categories c,
LATERAL (VALUES
  ('marketing','Marketing','Marketing','Маркетинг',1),
  ('sales','Sales','Ventes','Продажи',2),
  ('finance','Finance','Finance','Финансы',3),
  ('hr','HR','RH','HR',4),
  ('management','Management','Management','Менеджмент',5),
  ('entrepreneurship','Entrepreneurship','Entrepreneuriat','Предпринимательство',6)
) AS s(slug,en,fr,ru,ord) WHERE c.slug='business';

INSERT INTO public.yat_subcategories (category_id, slug, name_en, name_fr, name_ru, sort_order)
SELECT id, s.slug, s.en, s.fr, s.ru, s.ord FROM public.yat_categories c,
LATERAL (VALUES
  ('languages','Languages','Langues','Языки',1),
  ('coaching','Coaching','Coaching','Коучинг',2),
  ('tutoring','Tutoring','Tutorat','Репетиторство',3),
  ('mentoring','Mentoring','Mentorat','Менторство',4)
) AS s(slug,en,fr,ru,ord) WHERE c.slug='education';

INSERT INTO public.yat_subcategories (category_id, slug, name_en, name_fr, name_ru, sort_order)
SELECT id, s.slug, s.en, s.fr, s.ru, s.ord FROM public.yat_categories c,
LATERAL (VALUES
  ('math','Mathematics','Mathématiques','Математика',1),
  ('physics','Physics','Physique','Физика',2),
  ('biology','Biology','Biologie','Биология',3),
  ('chemistry','Chemistry','Chimie','Химия',4),
  ('astronomy','Astronomy','Astronomie','Астрономия',5)
) AS s(slug,en,fr,ru,ord) WHERE c.slug='science';

INSERT INTO public.yat_subcategories (category_id, slug, name_en, name_fr, name_ru, sort_order)
SELECT id, s.slug, s.en, s.fr, s.ru, s.ord FROM public.yat_categories c,
LATERAL (VALUES
  ('modeling','Modeling','Mannequinat','Модельный бизнес',1),
  ('design','Fashion Design','Stylisme','Дизайн одежды',2),
  ('makeup','Makeup','Maquillage','Макияж',3),
  ('hair','Hair Styling','Coiffure','Парикмахерское',4)
) AS s(slug,en,fr,ru,ord) WHERE c.slug='fashion';

INSERT INTO public.yat_subcategories (category_id, slug, name_en, name_fr, name_ru, sort_order)
SELECT id, s.slug, s.en, s.fr, s.ru, s.ord FROM public.yat_categories c,
LATERAL (VALUES
  ('chef','Chef','Chef','Шеф-повар',1),
  ('pastry','Pastry','Pâtisserie','Кондитер',2),
  ('barista','Barista','Barista','Бариста',3),
  ('sommelier','Sommelier','Sommelier','Сомелье',4)
) AS s(slug,en,fr,ru,ord) WHERE c.slug='food';

INSERT INTO public.yat_subcategories (category_id, slug, name_en, name_fr, name_ru, sort_order)
SELECT id, s.slug, s.en, s.fr, s.ru, s.ord FROM public.yat_categories c,
LATERAL (VALUES
  ('fitness','Fitness','Fitness','Фитнес',1),
  ('yoga','Yoga','Yoga','Йога',2),
  ('nutrition','Nutrition','Nutrition','Нутрициология',3),
  ('mental','Mental Health','Santé mentale','Ментальное здоровье',4),
  ('therapy','Therapy / Massage','Thérapie / Massage','Терапия / Массаж',5)
) AS s(slug,en,fr,ru,ord) WHERE c.slug='health';
