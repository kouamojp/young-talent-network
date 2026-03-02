export interface SportCategory {
  name: string;
  subcategories: string[];
}

export const sportCategories: SportCategory[] = [
  { name: 'Айкидо', subcategories: ['Айкидо айкикай', 'Айкидо ёсинкан', 'Реальное айкидо', 'Айкибудо'] },
  { name: 'Акробатика', subcategories: ['Спортивная', 'Танцевальная', 'Цирковая', 'Батут', 'Силовая'] },
  { name: 'Аэробика', subcategories: ['Силовая', 'Спортивная', 'Степ-аэробика', 'Танцевальная'] },
  { name: 'Бадминтон', subcategories: [] },
  { name: 'Балет', subcategories: ['Партерная гимнастика', 'Классический танец'] },
  { name: 'Баскетбол', subcategories: ['Классический', 'Стритбол'] },
  { name: 'Бильярд', subcategories: ['Пул', 'Русский бильярд', 'Снукер'] },
  { name: 'Бодибилдинг', subcategories: [] },
  { name: 'Бокс', subcategories: [] },
  { name: 'Большой теннис', subcategories: [] },
  { name: 'Велоспорт', subcategories: ['Велогонки', 'Горный велосипед', 'Шоссейные', 'Трек'] },
  { name: 'Волейбол', subcategories: ['Классический', 'Пляжный'] },
  { name: 'Вольная борьба', subcategories: [] },
  { name: 'Восточные танцы', subcategories: ['Арабские', 'Египетские', 'Индийские', 'Танец живота'] },
  { name: 'Гольф', subcategories: [] },
  { name: 'Горные лыжи', subcategories: ['Слалом', 'Фристайл'] },
  { name: 'Гребля', subcategories: ['Академическая'] },
  { name: 'Греко-римская борьба', subcategories: [] },
  { name: 'Дайвинг', subcategories: ['Фридайвинг'] },
  { name: 'Джиу-джитсу', subcategories: ['Бразильское', 'Японское'] },
  { name: 'Дзюдо', subcategories: [] },
  { name: 'Йога', subcategories: ['Хатха-йога', 'Аштанга-йога', 'Кундалини-йога', 'Фитнес-йога', 'Воздушная йога'] },
  { name: 'Капоэйра', subcategories: [] },
  { name: 'Карате', subcategories: ['Кекусинкай', 'Сетокан', 'Годзю-рю', 'Сито-рю', 'Ашихара'] },
  { name: 'Кикбоксинг', subcategories: [] },
  { name: 'Лёгкая атлетика', subcategories: ['Бег', 'Прыжки', 'Метание'] },
  { name: 'Лыжные гонки', subcategories: [] },
  { name: 'Муай-тай', subcategories: [] },
  { name: 'Настольный теннис', subcategories: [] },
  { name: 'Плавание', subcategories: ['Спортивное', 'Синхронное', 'Прыжки в воду'] },
  { name: 'Пилатес', subcategories: [] },
  { name: 'Регби', subcategories: [] },
  { name: 'Самбо', subcategories: ['Боевое', 'Спортивное'] },
  { name: 'Сноуборд', subcategories: [] },
  { name: 'Тхэквондо', subcategories: [] },
  { name: 'Ушу', subcategories: [] },
  { name: 'Фехтование', subcategories: ['Шпага', 'Сабля', 'Рапира'] },
  { name: 'Фигурное катание', subcategories: [] },
  { name: 'Футбол', subcategories: ['Классический', 'Мини-футбол', 'Футзал'] },
  { name: 'Хоккей', subcategories: ['На льду', 'На траве', 'Флорбол'] },
  { name: 'Шахматы', subcategories: [] },
  { name: 'Танцы', subcategories: ['Бальные', 'Современные', 'Хип-хоп', 'Брейк-данс', 'Контемпорари', 'Народные'] },
  { name: 'Гимнастика', subcategories: ['Художественная', 'Спортивная', 'Акробатическая'] },
  { name: 'Тяжёлая атлетика', subcategories: [] },
  { name: 'Водное поло', subcategories: [] },
  { name: 'Армрестлинг', subcategories: [] },
  { name: 'Биатлон', subcategories: [] },
  { name: 'Кендо', subcategories: [] },
  { name: 'Музыка', subcategories: ['Фортепиано', 'Гитара', 'Скрипка', 'Вокал', 'Духовые', 'Ударные'] },
  { name: 'Искусство', subcategories: ['Живопись', 'Скульптура', 'Графика', 'Фотография'] },
  { name: 'Наука', subcategories: ['Математика', 'Физика', 'Химия', 'Биология', 'Информатика'] },
];

// Flat list of all sport names for search/filter
export const allSportNames: string[] = sportCategories.flatMap(cat => 
  [cat.name, ...cat.subcategories.map(sub => `${cat.name} - ${sub}`)]
);
