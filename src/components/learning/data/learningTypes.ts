
export interface LearningType {
  id: number;
  type: 'training' | 'seminar' | 'masterclass' | 'lecture';
  title: string;
  instructor: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all-levels';
  location: {
    type: 'remote' | 'in-person' | 'hybrid';
    address?: string;
  };
  category: string;
  subcategory: string;
  description: string;
  price: string;
  startDate: string;
  maxParticipants: number;
  currentParticipants: number;
  imageUrl: string;
}

export const learningTypes: LearningType[] = [
  {
    id: 1,
    type: 'training',
    title: 'From Shy to Shining: 3-Day Confidence Bootcamp',
    instructor: 'Olivia Richards',
    duration: '3 days (6 hours/day)',
    level: 'all-levels',
    location: {
      type: 'in-person',
      address: '123 Creative Center, New York, NY'
    },
    category: 'Personal Development',
    subcategory: 'Confidence Building',
    description: 'Transform your communication skills and self-confidence in just three days. This intensive bootcamp combines practical exercises, feedback, and personalized coaching.',
    price: '$299',
    startDate: 'May 15, 2025',
    maxParticipants: 12,
    currentParticipants: 5,
    imageUrl: '/placeholder.svg'
  },
  {
    id: 2,
    type: 'seminar',
    title: 'Blockchain for Baby Geniuses',
    instructor: 'Dr. Terence Wong',
    duration: '2 hours',
    level: 'beginner',
    location: {
      type: 'remote'
    },
    category: 'Technology',
    subcategory: 'Blockchain',
    description: 'An approachable introduction to blockchain technology. Learn the fundamentals in a fun, accessible format without needing any prior technical knowledge.',
    price: '$49',
    startDate: 'May 20, 2025',
    maxParticipants: 100,
    currentParticipants: 37,
    imageUrl: '/placeholder.svg'
  },
  {
    id: 3,
    type: 'masterclass',
    title: 'Piano Tricks Even Mozart Would Tweet About',
    instructor: 'Maestro Julia Sanchez',
    duration: '4 hours',
    level: 'intermediate',
    location: {
      type: 'hybrid',
      address: 'Grand Music Hall, Nashville, TN'
    },
    category: 'Music',
    subcategory: 'Piano',
    description: 'Elevate your piano skills with advanced techniques and creative approaches to playing your favorite pieces. Includes personalized feedback and practice strategies.',
    price: '$179',
    startDate: 'June 5, 2025',
    maxParticipants: 20,
    currentParticipants: 12,
    imageUrl: '/placeholder.svg'
  },
  {
    id: 4,
    type: 'lecture',
    title: 'Why Your Brain Loves Dance (Science Explained!)',
    instructor: 'Prof. Michael Chen, PhD',
    duration: '90 minutes',
    level: 'all-levels',
    location: {
      type: 'remote'
    },
    category: 'Science',
    subcategory: 'Neuroscience',
    description: 'Explore the fascinating neuroscience behind movement and dance. Learn how dance affects brain chemistry, cognitive function, and emotional wellbeing.',
    price: '$15',
    startDate: 'May 25, 2025',
    maxParticipants: 200,
    currentParticipants: 65,
    imageUrl: '/placeholder.svg'
  }
];
