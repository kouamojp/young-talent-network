// Sport-specific profile schemas based on the Rabota spec.
// Each field: key, label (en/fr/ru), type, options (for select/multiselect)

export type FieldType = 'text' | 'number' | 'textarea' | 'select' | 'multiselect';

export interface SportField {
  key: string;
  label: { en: string; fr: string; ru: string };
  type: FieldType;
  options?: { value: string; label: { en: string; fr: string; ru: string } }[];
  group?: string;
}

export interface SportSchema {
  id: string;
  label: { en: string; fr: string; ru: string };
  fields: SportField[];
}

const RANK_OPTIONS = [
  { value: 'none', label: { en: 'None', fr: 'Aucun', ru: 'нет' } },
  { value: 'youth_3', label: { en: '3rd youth', fr: '3e jeunesse', ru: '3-й юношеский' } },
  { value: 'youth_2', label: { en: '2nd youth', fr: '2e jeunesse', ru: '2-й юношеский' } },
  { value: 'youth_1', label: { en: '1st youth', fr: '1re jeunesse', ru: '1-й юношеский' } },
  { value: 'sport_3', label: { en: '3rd sport', fr: '3e sport', ru: '3-й спортивный' } },
  { value: 'sport_2', label: { en: '2nd sport', fr: '2e sport', ru: '2-й спортивный' } },
  { value: 'sport_1', label: { en: '1st sport', fr: '1er sport', ru: '1-й спортивный' } },
  { value: 'above', label: { en: 'Above (KMS/MSMK/ZMS)', fr: 'Au-dessus', ru: 'Выше (КМС/МСМК/ЗМС)' } },
];

const LEAGUE_OPTIONS = [
  { value: 'none', label: { en: 'None', fr: 'Aucune', ru: 'Нет' } },
  { value: 'school', label: { en: 'School', fr: 'École', ru: 'Школьная' } },
  { value: 'student', label: { en: 'Student', fr: 'Étudiante', ru: 'Студенческая' } },
  { value: 'amateur', label: { en: 'Amateur', fr: 'Amateur', ru: 'Любительская' } },
  { value: 'semi_pro', label: { en: 'Semi-pro', fr: 'Semi-pro', ru: 'Полупроф.' } },
  { value: 'pro', label: { en: 'Professional', fr: 'Professionnelle', ru: 'Профессиональная' } },
];

const COMMON_TAIL: SportField[] = [
  { key: 'injuries', label: { en: 'Injuries', fr: 'Blessures', ru: 'Травмы' }, type: 'textarea' },
  { key: 'achievements_notes', label: { en: 'Trophies & achievements', fr: 'Trophées & palmarès', ru: 'Награды и достижения' }, type: 'textarea' },
  { key: 'extra', label: { en: 'Additional info', fr: 'Infos supplémentaires', ru: 'Доп. информация' }, type: 'textarea' },
];

const PHYSICAL: SportField[] = [
  { key: 'height_cm', label: { en: 'Height (cm)', fr: 'Taille (cm)', ru: 'Рост (см)' }, type: 'number', group: 'physical' },
  { key: 'weight_kg', label: { en: 'Weight (kg)', fr: 'Poids (kg)', ru: 'Вес (кг)' }, type: 'number', group: 'physical' },
];

const HAND_OPTS = [
  { value: 'right', label: { en: 'Right', fr: 'Droite', ru: 'Правая' } },
  { value: 'left', label: { en: 'Left', fr: 'Gauche', ru: 'Левая' } },
  { value: 'ambi', label: { en: 'Ambidextrous', fr: 'Ambidextre', ru: 'Обе' } },
];

export const SPORT_SCHEMAS: SportSchema[] = [
  {
    id: 'volleyball',
    label: { en: 'Volleyball', fr: 'Volley-ball', ru: 'Волейбол' },
    fields: [
      ...PHYSICAL,
      { key: 'strong_hand', label: { en: 'Strong hand', fr: 'Main forte', ru: 'Рабочая рука' }, type: 'select', options: HAND_OPTS, group: 'physical' },
      { key: 'role', label: { en: 'Role', fr: 'Poste', ru: 'Амплуа' }, type: 'select', options: [
        { value: 'outside', label: { en: 'Outside hitter', fr: 'Réceptionneur-attaquant', ru: 'Доигровщик' } },
        { value: 'opposite', label: { en: 'Opposite', fr: 'Pointu', ru: 'Диагональный' } },
        { value: 'middle', label: { en: 'Middle blocker', fr: 'Central', ru: 'Центральный блок.' } },
        { value: 'setter', label: { en: 'Setter', fr: 'Passeur', ru: 'Связующий' } },
        { value: 'libero', label: { en: 'Libero', fr: 'Libero', ru: 'Либеро' } },
      ]},
      { key: 'rank', label: { en: 'Rank', fr: 'Catégorie', ru: 'Разряд' }, type: 'select', options: RANK_OPTIONS },
      { key: 'strengths', label: { en: 'Strengths', fr: 'Points forts', ru: 'Сильные качества' }, type: 'multiselect', options: [
        { value: 'block', label: { en: 'Block', fr: 'Bloc', ru: 'Блок' } },
        { value: 'reception', label: { en: 'Reception', fr: 'Réception', ru: 'Приём' } },
        { value: 'serve', label: { en: 'Serve', fr: 'Service', ru: 'Подача' } },
        { value: 'attack1', label: { en: '1st-tempo attack', fr: 'Attaque 1er temps', ru: 'Первый темп' } },
        { value: 'attack2', label: { en: '2nd-tempo attack', fr: 'Attaque 2e temps', ru: 'Второй темп' } },
        { value: 'pass', label: { en: 'Pass', fr: 'Passe', ru: 'Пас' } },
      ]},
      { key: 'weaknesses', label: { en: 'Weaknesses', fr: 'Points faibles', ru: 'Слабые качества' }, type: 'textarea' },
      { key: 'leagues', label: { en: 'League experience', fr: 'Expérience en ligue', ru: 'Опыт лиг' }, type: 'multiselect', options: LEAGUE_OPTIONS },
      ...COMMON_TAIL,
    ],
  },
  {
    id: 'rugby_15',
    label: { en: 'Rugby Union (15s)', fr: 'Rugby à XV', ru: 'Регби-15' },
    fields: [
      ...PHYSICAL,
      { key: 'strong_hand', label: { en: 'Strong hand', fr: 'Main forte', ru: 'Рабочая рука' }, type: 'select', options: HAND_OPTS },
      { key: 'strong_foot', label: { en: 'Strong foot', fr: 'Pied fort', ru: 'Сильная нога' }, type: 'select', options: HAND_OPTS },
      { key: 'line', label: { en: 'Line', fr: 'Ligne', ru: 'Линия' }, type: 'select', options: [
        { value: 'forward', label: { en: 'Forward', fr: 'Avant', ru: 'Нападающий' } },
        { value: 'back', label: { en: 'Back', fr: 'Arrière', ru: 'Защитник' } },
      ]},
      { key: 'position', label: { en: 'Position', fr: 'Position', ru: 'Роль' }, type: 'select', options: [
        { value: 'loosehead', label: { en: 'Loosehead prop (1)', fr: 'Pilier gauche', ru: 'Левый столб' } },
        { value: 'hooker', label: { en: 'Hooker (2)', fr: 'Talonneur', ru: 'Хукер' } },
        { value: 'tighthead', label: { en: 'Tighthead prop (3)', fr: 'Pilier droit', ru: 'Правый столб' } },
        { value: 'lock4', label: { en: 'Lock (4)', fr: '2e ligne G', ru: 'Левый замок' } },
        { value: 'lock5', label: { en: 'Lock (5)', fr: '2e ligne D', ru: 'Правый замок' } },
        { value: 'blindside', label: { en: 'Blindside flanker (6)', fr: '3e ligne aile fermée', ru: 'Левый фланкер' } },
        { value: 'openside', label: { en: 'Openside flanker (7)', fr: '3e ligne aile ouverte', ru: 'Правый фланкер' } },
        { value: 'number8', label: { en: 'Number 8', fr: 'Numéro 8', ru: 'Стягивающий' } },
        { value: 'scrum_half', label: { en: 'Scrum-half (9)', fr: 'Demi de mêlée', ru: 'Полуз. схватки' } },
        { value: 'fly_half', label: { en: 'Fly-half (10)', fr: 'Demi d\'ouverture', ru: 'Блужд. полуз.' } },
        { value: 'left_wing', label: { en: 'Left wing (11)', fr: 'Ailier gauche', ru: 'Левый вингер' } },
        { value: 'inside_centre', label: { en: 'Inside centre (12)', fr: '1er centre', ru: 'Внутр. центр.' } },
        { value: 'outside_centre', label: { en: 'Outside centre (13)', fr: '2e centre', ru: 'Внешн. центр.' } },
        { value: 'right_wing', label: { en: 'Right wing (14)', fr: 'Ailier droit', ru: 'Правый вингер' } },
        { value: 'fullback', label: { en: 'Fullback (15)', fr: 'Arrière', ru: 'Замыкающий' } },
      ]},
      { key: 'rank', label: { en: 'Rank', fr: 'Catégorie', ru: 'Разряд' }, type: 'select', options: RANK_OPTIONS },
      { key: 'strengths', label: { en: 'Strengths', fr: 'Points forts', ru: 'Сильные качества' }, type: 'multiselect', options: [
        { value: 'pace', label: { en: 'Pace', fr: 'Vitesse', ru: 'Скорость' } },
        { value: 'agility', label: { en: 'Agility', fr: 'Agilité', ru: 'Ловкость' } },
        { value: 'power', label: { en: 'Power', fr: 'Puissance', ru: 'Сила' } },
        { value: 'drop_kick', label: { en: 'Drop kick', fr: 'Drop', ru: 'Удар с отскока' } },
        { value: 'place_kick', label: { en: 'Place kick', fr: 'Coup de pied placé', ru: 'Удар с земли' } },
        { value: 'tackle', label: { en: 'Tackle', fr: 'Plaquage', ru: 'Захват' } },
      ]},
      { key: 'weaknesses', label: { en: 'Weaknesses', fr: 'Points faibles', ru: 'Слабые качества' }, type: 'textarea' },
      { key: 'leagues', label: { en: 'League experience', fr: 'Expérience en ligue', ru: 'Опыт лиг' }, type: 'multiselect', options: LEAGUE_OPTIONS },
      ...COMMON_TAIL,
    ],
  },
  {
    id: 'rugby_7',
    label: { en: 'Rugby Sevens', fr: 'Rugby à 7', ru: 'Регби-7' },
    fields: [
      ...PHYSICAL,
      { key: 'strong_hand', label: { en: 'Strong hand', fr: 'Main forte', ru: 'Рабочая рука' }, type: 'select', options: HAND_OPTS },
      { key: 'strong_foot', label: { en: 'Strong foot', fr: 'Pied fort', ru: 'Сильная нога' }, type: 'select', options: HAND_OPTS },
      { key: 'line', label: { en: 'Line', fr: 'Ligne', ru: 'Линия' }, type: 'select', options: [
        { value: 'forward', label: { en: 'Forward', fr: 'Avant', ru: 'Нападающий' } },
        { value: 'back', label: { en: 'Back', fr: 'Arrière', ru: 'Защитник' } },
      ]},
      { key: 'position', label: { en: 'Position', fr: 'Poste', ru: 'Роль' }, type: 'select', options: [
        { value: 'prop', label: { en: 'Prop', fr: 'Pilier', ru: 'Столб' } },
        { value: 'hooker', label: { en: 'Hooker', fr: 'Talonneur', ru: 'Хукер' } },
        { value: 'scrum_half', label: { en: 'Scrum-half', fr: 'Demi de mêlée', ru: 'Полуз. схватки' } },
        { value: 'fly_half', label: { en: 'Fly-half', fr: 'Demi d\'ouverture', ru: 'Блужд. полуз.' } },
        { value: 'center', label: { en: 'Center', fr: 'Centre', ru: 'Центровой' } },
        { value: 'wing', label: { en: 'Wing', fr: 'Ailier', ru: 'Крайний' } },
      ]},
      { key: 'rank', label: { en: 'Rank', fr: 'Catégorie', ru: 'Разряд' }, type: 'select', options: RANK_OPTIONS },
      { key: 'leagues', label: { en: 'League experience', fr: 'Expérience en ligue', ru: 'Опыт лиг' }, type: 'multiselect', options: LEAGUE_OPTIONS },
      ...COMMON_TAIL,
    ],
  },
  {
    id: 'athletics',
    label: { en: 'Track & Field', fr: 'Athlétisme', ru: 'Лёгкая атлетика' },
    fields: [
      ...PHYSICAL,
      { key: 'rank', label: { en: 'Rank', fr: 'Catégorie', ru: 'Разряд' }, type: 'select', options: RANK_OPTIONS },
      { key: 'specialization', label: { en: 'Specialization', fr: 'Spécialité', ru: 'Специализация' }, type: 'multiselect', options: [
        { value: 'sprint_100', label: { en: '100 m', fr: '100 m', ru: '100 м' } },
        { value: 'sprint_200', label: { en: '200 m', fr: '200 m', ru: '200 м' } },
        { value: 'sprint_400', label: { en: '400 m', fr: '400 m', ru: '400 м' } },
        { value: 'mid_800', label: { en: '800 m', fr: '800 m', ru: '800 м' } },
        { value: 'mid_1500', label: { en: '1500 m', fr: '1500 m', ru: '1500 м' } },
        { value: 'mid_3000', label: { en: '3000 m', fr: '3000 m', ru: '3000 м' } },
        { value: 'long_5000', label: { en: '5000 m', fr: '5000 m', ru: '5000 м' } },
        { value: 'long_10000', label: { en: '10000 m', fr: '10000 m', ru: '10000 м' } },
        { value: 'marathon', label: { en: 'Marathon', fr: 'Marathon', ru: 'Марафон' } },
        { value: 'hurdles', label: { en: 'Hurdles', fr: 'Haies', ru: 'Барьерный бег' } },
        { value: 'steeple', label: { en: 'Steeplechase', fr: 'Steeple', ru: 'С препятствиями' } },
        { value: 'long_jump', label: { en: 'Long jump', fr: 'Saut en longueur', ru: 'В длину' } },
        { value: 'triple_jump', label: { en: 'Triple jump', fr: 'Triple saut', ru: 'Тройной' } },
        { value: 'high_jump', label: { en: 'High jump', fr: 'Saut en hauteur', ru: 'В высоту' } },
        { value: 'pole_vault', label: { en: 'Pole vault', fr: 'Perche', ru: 'С шестом' } },
        { value: 'javelin', label: { en: 'Javelin', fr: 'Javelot', ru: 'Копьё' } },
        { value: 'discus', label: { en: 'Discus', fr: 'Disque', ru: 'Диск' } },
        { value: 'hammer', label: { en: 'Hammer', fr: 'Marteau', ru: 'Молот' } },
        { value: 'shot_put', label: { en: 'Shot put', fr: 'Poids', ru: 'Ядро' } },
        { value: 'walk_20', label: { en: '20 km walk', fr: '20 km marche', ru: '20 км ходьба' } },
        { value: 'walk_50', label: { en: '50 km walk', fr: '50 km marche', ru: '50 км ходьба' } },
        { value: 'pentathlon', label: { en: 'Pentathlon', fr: 'Pentathlon', ru: 'Пятиборье' } },
        { value: 'heptathlon', label: { en: 'Heptathlon', fr: 'Heptathlon', ru: 'Семиборье' } },
        { value: 'decathlon', label: { en: 'Decathlon', fr: 'Décathlon', ru: 'Десятиборье' } },
      ]},
      { key: 'competitions', label: { en: 'Competitions', fr: 'Compétitions', ru: 'Соревнования' }, type: 'multiselect', options: [
        { value: 'none', label: { en: 'None', fr: 'Aucune', ru: 'Нет' } },
        { value: 'school', label: { en: 'School', fr: 'Scolaire', ru: 'Школьные' } },
        { value: 'university', label: { en: 'University', fr: 'Universitaire', ru: 'Универ.' } },
        { value: 'city', label: { en: 'City', fr: 'Ville', ru: 'Городские' } },
        { value: 'regional', label: { en: 'Regional', fr: 'Régional', ru: 'Региональные' } },
      ]},
      ...COMMON_TAIL,
    ],
  },
  {
    id: 'swimming',
    label: { en: 'Swimming', fr: 'Natation', ru: 'Плавание' },
    fields: [
      ...PHYSICAL,
      { key: 'kind', label: { en: 'Kind', fr: 'Type', ru: 'Вид' }, type: 'select', options: [
        { value: 'open_water', label: { en: 'Open water', fr: 'Eau libre', ru: 'Открытая вода' } },
        { value: 'pool', label: { en: 'Pool', fr: 'Bassin', ru: 'Бассейн' } },
      ]},
      { key: 'style', label: { en: 'Preferred style', fr: 'Style préféré', ru: 'Стиль' }, type: 'multiselect', options: [
        { value: 'freestyle', label: { en: 'Freestyle', fr: 'Crawl', ru: 'Вольный' } },
        { value: 'backstroke', label: { en: 'Backstroke', fr: 'Dos', ru: 'На спине' } },
        { value: 'breaststroke', label: { en: 'Breaststroke', fr: 'Brasse', ru: 'Брасс' } },
        { value: 'butterfly', label: { en: 'Butterfly', fr: 'Papillon', ru: 'Баттерфляй' } },
      ]},
      { key: 'distances', label: { en: 'Distances', fr: 'Distances', ru: 'Дистанции' }, type: 'multiselect', options: [
        { value: '50', label: { en: '50 m', fr: '50 m', ru: '50 м' } },
        { value: '100', label: { en: '100 m', fr: '100 m', ru: '100 м' } },
        { value: '200', label: { en: '200 m', fr: '200 m', ru: '200 м' } },
        { value: '400', label: { en: '400 m', fr: '400 m', ru: '400 м' } },
        { value: '800', label: { en: '800 m', fr: '800 m', ru: '800 м' } },
        { value: '1500', label: { en: '1500 m', fr: '1500 m', ru: '1500 м' } },
      ]},
      { key: 'rank', label: { en: 'Rank', fr: 'Catégorie', ru: 'Разряд' }, type: 'select', options: RANK_OPTIONS },
      { key: 'competitions', label: { en: 'Competitions', fr: 'Compétitions', ru: 'Соревнования' }, type: 'multiselect', options: [
        { value: 'none', label: { en: 'None', fr: 'Aucune', ru: 'Нет' } },
        { value: 'school', label: { en: 'School', fr: 'Scolaire', ru: 'Школьные' } },
        { value: 'university', label: { en: 'University', fr: 'Universitaire', ru: 'Универ.' } },
        { value: 'city', label: { en: 'City', fr: 'Ville', ru: 'Городские' } },
        { value: 'regional', label: { en: 'Regional', fr: 'Régional', ru: 'Региональные' } },
      ]},
      ...COMMON_TAIL,
    ],
  },
  {
    id: 'basketball',
    label: { en: 'Basketball', fr: 'Basket-ball', ru: 'Баскетбол' },
    fields: [
      ...PHYSICAL,
      { key: 'strong_hand', label: { en: 'Strong hand', fr: 'Main forte', ru: 'Рабочая рука' }, type: 'select', options: HAND_OPTS },
      { key: 'position', label: { en: 'Position', fr: 'Poste', ru: 'Позиция' }, type: 'select', options: [
        { value: 'pg', label: { en: 'Point guard (1)', fr: 'Meneur', ru: 'Разыгрывающий защ.' } },
        { value: 'sg', label: { en: 'Shooting guard (2)', fr: 'Arrière', ru: 'Атакующий защ.' } },
        { value: 'sf', label: { en: 'Small forward (3)', fr: 'Ailier', ru: 'Лёгкий форвард' } },
        { value: 'pf', label: { en: 'Power forward (4)', fr: 'Ailier fort', ru: 'Мощный форвард' } },
        { value: 'c',  label: { en: 'Center (5)', fr: 'Pivot', ru: 'Центровой' } },
      ]},
      { key: 'rank', label: { en: 'Rank', fr: 'Catégorie', ru: 'Разряд' }, type: 'select', options: RANK_OPTIONS },
      { key: 'strengths', label: { en: 'Strengths', fr: 'Points forts', ru: 'Сильные качества' }, type: 'multiselect', options: [
        { value: 'shooting', label: { en: '3-pt shooting', fr: 'Tir à 3 pts', ru: 'Трёхочковый' } },
        { value: 'finishing', label: { en: 'Finishing at rim', fr: 'Finition au cercle', ru: 'Завершение у кольца' } },
        { value: 'rebound', label: { en: 'Rebounding', fr: 'Rebond', ru: 'Подбор' } },
        { value: 'defense', label: { en: 'Defense', fr: 'Défense', ru: 'Защита' } },
        { value: 'playmaking', label: { en: 'Playmaking', fr: 'Création', ru: 'Плеймейкинг' } },
        { value: 'speed', label: { en: 'Speed', fr: 'Vitesse', ru: 'Скорость' } },
      ]},
      { key: 'weaknesses', label: { en: 'Weaknesses', fr: 'Points faibles', ru: 'Слабые качества' }, type: 'textarea' },
      { key: 'leagues', label: { en: 'League experience', fr: 'Expérience en ligue', ru: 'Опыт лиг' }, type: 'multiselect', options: LEAGUE_OPTIONS },
      ...COMMON_TAIL,
    ],
  },
  {
    id: 'american_football',
    label: { en: 'American Football', fr: 'Football américain', ru: 'Американский футбол' },
    fields: [
      ...PHYSICAL,
      { key: 'strong_hand', label: { en: 'Throwing hand', fr: 'Main de lancer', ru: 'Бросковая рука' }, type: 'select', options: HAND_OPTS },
      { key: 'side', label: { en: 'Side', fr: 'Côté', ru: 'Сторона' }, type: 'select', options: [
        { value: 'offense', label: { en: 'Offense', fr: 'Attaque', ru: 'Нападение' } },
        { value: 'defense', label: { en: 'Defense', fr: 'Défense', ru: 'Защита' } },
        { value: 'special', label: { en: 'Special teams', fr: 'Équipes spéciales', ru: 'Спец. команды' } },
      ]},
      { key: 'position', label: { en: 'Position', fr: 'Poste', ru: 'Позиция' }, type: 'select', options: [
        { value: 'qb', label: { en: 'Quarterback (QB)', fr: 'Quarterback', ru: 'Квотербек' } },
        { value: 'rb', label: { en: 'Running back (RB)', fr: 'Running back', ru: 'Раннинбек' } },
        { value: 'wr', label: { en: 'Wide receiver (WR)', fr: 'Receveur', ru: 'Ресивер' } },
        { value: 'te', label: { en: 'Tight end (TE)', fr: 'Tight end', ru: 'Тайт-энд' } },
        { value: 'ot', label: { en: 'Offensive tackle (OT)', fr: 'Tackle attaque', ru: 'Тэкл нападения' } },
        { value: 'og', label: { en: 'Offensive guard (OG)', fr: 'Garde attaque', ru: 'Гард нападения' } },
        { value: 'c',  label: { en: 'Center (C)', fr: 'Centre', ru: 'Центр' } },
        { value: 'de', label: { en: 'Defensive end (DE)', fr: 'DE', ru: 'Защитный энд' } },
        { value: 'dt', label: { en: 'Defensive tackle (DT)', fr: 'DT', ru: 'Защитный тэкл' } },
        { value: 'lb', label: { en: 'Linebacker (LB)', fr: 'Linebacker', ru: 'Лайнбекер' } },
        { value: 'cb', label: { en: 'Cornerback (CB)', fr: 'Cornerback', ru: 'Корнербек' } },
        { value: 'fs', label: { en: 'Free safety (FS)', fr: 'Free safety', ru: 'Открытый сейфти' } },
        { value: 'ss', label: { en: 'Strong safety (SS)', fr: 'Strong safety', ru: 'Сильный сейфти' } },
        { value: 'k',  label: { en: 'Kicker (K)', fr: 'Kicker', ru: 'Киккер' } },
        { value: 'p',  label: { en: 'Punter (P)', fr: 'Punter', ru: 'Пантер' } },
      ]},
      { key: 'rank', label: { en: 'Level', fr: 'Niveau', ru: 'Уровень' }, type: 'select', options: RANK_OPTIONS },
      { key: 'leagues', label: { en: 'League experience', fr: 'Expérience en ligue', ru: 'Опыт лиг' }, type: 'multiselect', options: LEAGUE_OPTIONS },
      ...COMMON_TAIL,
    ],
  },
  {
    id: 'esports',
    label: { en: 'Esports', fr: 'Esports', ru: 'Киберспорт' },
    fields: [
      { key: 'discipline', label: { en: 'Discipline', fr: 'Discipline', ru: 'Дисциплина' }, type: 'select', options: [
        { value: 'cs',     label: { en: 'Counter-Strike 2', fr: 'Counter-Strike 2', ru: 'Counter-Strike 2' } },
        { value: 'dota2',  label: { en: 'Dota 2', fr: 'Dota 2', ru: 'Dota 2' } },
        { value: 'lol',    label: { en: 'League of Legends', fr: 'League of Legends', ru: 'League of Legends' } },
        { value: 'valorant', label: { en: 'Valorant', fr: 'Valorant', ru: 'Valorant' } },
        { value: 'fifa',   label: { en: 'EA FC / FIFA', fr: 'EA FC / FIFA', ru: 'EA FC / FIFA' } },
        { value: 'rocket', label: { en: 'Rocket League', fr: 'Rocket League', ru: 'Rocket League' } },
        { value: 'other',  label: { en: 'Other (specify)', fr: 'Autre (préciser)', ru: 'Другое (укажите)' } },
      ]},
      { key: 'discipline_other', label: { en: 'Other discipline', fr: 'Autre discipline', ru: 'Другая дисциплина' }, type: 'text' },
      { key: 'nickname', label: { en: 'In-game nickname', fr: 'Pseudo en jeu', ru: 'Игровой ник' }, type: 'text' },
      { key: 'role', label: { en: 'In-game role', fr: 'Rôle en jeu', ru: 'Игровая роль' }, type: 'text' },
      { key: 'rank', label: { en: 'Rank / ELO / MMR', fr: 'Rang / ELO / MMR', ru: 'Ранг / ELO / MMR' }, type: 'text' },
      { key: 'team', label: { en: 'Team / Clan', fr: 'Équipe / Clan', ru: 'Команда / Клан' }, type: 'text' },
      { key: 'platforms', label: { en: 'Platforms', fr: 'Plateformes', ru: 'Платформы' }, type: 'multiselect', options: [
        { value: 'pc', label: { en: 'PC', fr: 'PC', ru: 'ПК' } },
        { value: 'ps', label: { en: 'PlayStation', fr: 'PlayStation', ru: 'PlayStation' } },
        { value: 'xbox', label: { en: 'Xbox', fr: 'Xbox', ru: 'Xbox' } },
        { value: 'mobile', label: { en: 'Mobile', fr: 'Mobile', ru: 'Мобильные' } },
      ]},
      { key: 'streaming', label: { en: 'Streaming channels', fr: 'Chaînes de stream', ru: 'Стрим-каналы' }, type: 'textarea' },
      ...COMMON_TAIL,
    ],
  },
];
