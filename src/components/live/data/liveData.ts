export interface StreamCategory {
  id: string;
  name: string;
  icon: string;
  subcategories: string[];
}

export const streamCategories: StreamCategory[] = [
  {
    id: 'sports',
    name: 'Sports',
    icon: '⚽',
    subcategories: ['Football', 'Gymnastics', 'Basketball', 'Swimming', 'Quidditch for Beginners']
  },
  {
    id: 'it',
    name: 'IT',
    icon: '💻',
    subcategories: ['Coding', 'AI Demos', 'Web Development', 'Coding with Emoji', 'Game Development']
  },
  {
    id: 'esports',
    name: 'Esports',
    icon: '🎮',
    subcategories: ['Valorant', 'Fortnite', 'League of Legends', 'How to Not Throw Your Controller 101']
  },
  {
    id: 'science',
    name: 'Science',
    icon: '🧪',
    subcategories: ['Physics', 'Biology', 'Chemistry', 'Volcanoes: Boom for Beginners', 'Astronomy']
  },
  {
    id: 'fashion',
    name: 'Fashion',
    icon: '👗',
    subcategories: ['Runway', 'DIY', 'Sustainable Fashion', 'Style Tips', 'Makeup Tutorials']
  },
  {
    id: 'medicine',
    name: 'Medicine',
    icon: '🩺',
    subcategories: ['Health Talks', 'Medical Education', 'Nutrition', 'Mental Health', 'First Aid']
  },
  {
    id: 'music',
    name: 'Music',
    icon: '🎵',
    subcategories: ['Pop', 'Classical', 'Jazz', 'Electronic', 'Instrument Tutorials']
  },
  {
    id: 'dance',
    name: 'Dance',
    icon: '💃',
    subcategories: ['Ballet', 'Hip-Hop', 'Contemporary', 'Ballroom', 'Street Dance']
  },
  {
    id: 'art',
    name: 'Art',
    icon: '🎨',
    subcategories: ['Painting', 'Digital', 'Sculpture', 'Illustration', 'Animation']
  },
  {
    id: 'cooking',
    name: 'Cooking',
    icon: '🍳',
    subcategories: ['Baking', 'Mixology', 'Vegan Cuisine', 'Quick Recipes', 'Gourmet']
  }
];

