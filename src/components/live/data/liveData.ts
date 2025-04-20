
export interface LiveStream {
  id: number;
  title: string;
  streamerName?: string;
  communityName?: string;
  thumbnail: string;
  viewers: number;
  category: string;
  location: string;
  description?: string;
  badges?: ('rising' | 'editor')[];
}

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

// Mock data for live streams
export const liveStreams: LiveStream[] = [
  {
    id: 1,
    title: "Morning Yoga Flow for Beginners",
    streamerName: "Emma Wellness",
    thumbnail: "https://images.unsplash.com/photo-1545205597-3d9d02c29597",
    viewers: 872,
    category: "Sports",
    location: "London",
    description: "Join me for a gentle morning flow to wake up your body!",
    badges: ['rising']
  },
  {
    id: 2,
    title: "Live Piano Performance - Classical Favorites",
    streamerName: "Michael Keys",
    thumbnail: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0",
    viewers: 1245,
    category: "Music",
    location: "Vienna",
    description: "Taking requests for your favorite classical pieces!",
    badges: ['editor']
  },
  {
    id: 3,
    title: "Beginner Portrait Drawing Tutorial",
    streamerName: "Artistic Alicia",
    thumbnail: "https://images.unsplash.com/photo-1513364776144-60967b0f800f",
    viewers: 539,
    category: "Art",
    location: "Barcelona",
    description: "Learn how to draw realistic portraits step by step"
  },
  {
    id: 4,
    title: "Competitive Gaming - Tournament Prep",
    streamerName: "ProGamer Pete",
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e",
    viewers: 2104,
    category: "Esports",
    location: "Seoul",
    description: "Watch me practice for tomorrow's championship!"
  },
  {
    id: 5,
    title: "Live Coding: Building a React App from Scratch",
    streamerName: "Developer Dana",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
    viewers: 756,
    category: "IT",
    location: "San Francisco",
    description: "Coding a portfolio website with React and Tailwind CSS"
  },
  {
    id: 6,
    title: "Contemporary Dance Improvisation",
    streamerName: "Dancing Dani",
    thumbnail: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad",
    viewers: 623,
    category: "Dance",
    location: "Paris",
    description: "Exploring movement through improvisation"
  },
  {
    id: 7,
    title: "Making Authentic Italian Pizza from Scratch",
    streamerName: "Chef Carlo",
    thumbnail: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3",
    viewers: 891,
    category: "Cooking",
    location: "Rome",
    description: "Secret family recipe for perfect Neapolitan pizza"
  },
  {
    id: 8,
    title: "Live Fashion Design Sketching",
    streamerName: "Designer Daphne",
    thumbnail: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03",
    viewers: 435,
    category: "Fashion",
    location: "Milan",
    description: "Designing my new summer collection live!"
  },
  {
    id: 9,
    title: "DIY Science Experiments for Kids",
    streamerName: "Science Sam",
    thumbnail: "https://images.unsplash.com/photo-1532094349884-543bc11b234d",
    viewers: 567,
    category: "Science",
    location: "Boston",
    description: "Fun experiments you can do at home with everyday items"
  },
  {
    id: 10,
    title: "Live Guitar Session - Taking Song Requests",
    streamerName: "Guitarist Gary",
    thumbnail: "https://images.unsplash.com/photo-1525201548942-d8732f6617a0",
    viewers: 782,
    category: "Music",
    location: "Nashville",
    description: "Comment your song requests below!"
  }
];

export const trendingStreams: LiveStream[] = [
  {
    id: 101,
    title: "Live Piano Jam with Mia (14yo prodigy)",
    streamerName: "Mia Mozart",
    thumbnail: "https://images.unsplash.com/photo-1511383791317-e0b754e26f53",
    viewers: 5231,
    category: "Music",
    location: "Moscow",
    description: "Teaching my new composition!",
    badges: ['rising', 'editor']
  },
  {
    id: 102,
    title: "Pro Basketball Drills and Techniques",
    streamerName: "Coach Kevin",
    thumbnail: "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4",
    viewers: 3418,
    category: "Sports",
    location: "Chicago",
    description: "Learn the drills used by the pros",
    badges: ['editor']
  },
  {
    id: 103,
    title: "Building an AI Art Generator Live",
    streamerName: "Tech Tina",
    thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f",
    viewers: 2987,
    category: "IT",
    location: "Berlin",
    description: "Coding an AI model that creates artwork",
    badges: ['rising']
  },
  {
    id: 104,
    title: "Street Dance Battle Showcase",
    streamerName: "Breakdance Bros",
    thumbnail: "https://images.unsplash.com/photo-1547153760-18fc86324498",
    viewers: 4125,
    category: "Dance",
    location: "New York",
    description: "Live street dance battles with audience voting!",
    badges: ['editor']
  }
];

export const followingStreams = [
  {
    id: 201,
    type: 'people',
    title: "Morning Training Session",
    streamerName: "Your Coach",
    thumbnail: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
    viewers: 156,
    category: "Sports",
    location: "Miami",
    description: "Join me for our daily training routine"
  },
  {
    id: 202,
    type: 'people',
    title: "Violin Practice - Preparing for Competition",
    streamerName: "Violin Virtuoso",
    thumbnail: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6",
    viewers: 89,
    category: "Music",
    location: "Vienna",
    description: "Practicing Bach's Partita No. 2"
  },
  {
    id: 203,
    type: 'community',
    title: "Live Hackathon: Building Apps for Good",
    communityName: "Young Coders Club",
    thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
    viewers: 342,
    category: "IT",
    location: "Seattle",
    description: "24-hour coding challenge for charity"
  },
  {
    id: 204,
    type: 'community',
    title: "Weekly Art Critique Session",
    communityName: "Artist's Circle",
    thumbnail: "https://images.unsplash.com/photo-1510935813936-763eb6fbc6f4",
    viewers: 127,
    category: "Art",
    location: "Amsterdam",
    description: "Share your artwork and get feedback from peers"
  }
];
