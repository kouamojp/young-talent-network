
export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  subcategories: string[];
}

export const categories: Category[] = [
  {
    id: 1,
    name: 'Sports',
    icon: '⚽',
    color: 'bg-green-100',
    subcategories: ['Team Sports', 'Individual Sports', 'Martial Arts', 'Quidditch for Beginners', 'Yoga & Wellness']
  },
  {
    id: 2,
    name: 'Technology',
    icon: '💻',
    color: 'bg-blue-100',
    subcategories: ['Coding', 'Web Development', 'Mobile Apps', 'Coding with Emoji', 'Blockchain']
  },
  {
    id: 3,
    name: 'Esports',
    icon: '🎮',
    color: 'bg-purple-100',
    subcategories: ['Strategy Games', 'First-Person Shooters', 'Role-Playing Games', 'How to Not Throw Your Controller 101']
  },
  {
    id: 4,
    name: 'Science',
    icon: '🧪',
    color: 'bg-yellow-100',
    subcategories: ['Physics', 'Chemistry', 'Biology', 'Volcanoes: Boom for Beginners', 'Neuroscience']
  },
  {
    id: 5,
    name: 'Arts',
    icon: '🎨',
    color: 'bg-pink-100',
    subcategories: ['Drawing', 'Painting', 'Sculpture', 'Digital Art', 'Photography']
  },
  {
    id: 6,
    name: 'Music',
    icon: '🎵',
    color: 'bg-indigo-100',
    subcategories: ['Piano', 'Guitar', 'Singing', 'DJ & Electronic', 'Music Production']
  },
  {
    id: 7,
    name: 'Personal Development',
    icon: '🧠',
    color: 'bg-orange-100',
    subcategories: ['Confidence Building', 'Public Speaking', 'Leadership', 'Time Management', 'Mindfulness']
  }
];
