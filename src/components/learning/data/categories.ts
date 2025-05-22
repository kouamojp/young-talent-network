
export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  name: string;
  items: SubcategoryItem[];
}

export interface SubcategoryItem {
  name: string;
  icon: string;
}

export const categories: Category[] = [
  {
    id: 1,
    name: 'Sports & Fitness',
    icon: '🏆',
    color: 'bg-green-100',
    subcategories: [
      {
        name: 'Team Sports',
        items: [
          { name: 'Football (Soccer)', icon: '⚽' },
          { name: 'Basketball', icon: '🏀' },
          { name: 'Volleyball', icon: '🏐' },
          { name: 'Rugby', icon: '🏉' },
          { name: 'Baseball', icon: '⚾' },
          { name: 'Cricket', icon: '🏏' },
          { name: 'Hockey (Field & Ice)', icon: '🏒' },
          { name: 'Handball', icon: '🤾' },
          { name: 'Water Polo', icon: '🤽' },
          { name: 'Ultimate Frisbee', icon: '🥏' }
        ]
      },
      {
        name: 'Individual Sports',
        items: [
          { name: 'Tennis', icon: '🎾' },
          { name: 'Badminton', icon: '🏸' },
          { name: 'Golf', icon: '⛳' },
          { name: 'Swimming', icon: '🏊' },
          { name: 'Athletics (Track & Field)', icon: '🏃' },
          { name: 'Cycling', icon: '🚴' },
          { name: 'Gymnastics', icon: '🤸' },
          { name: 'Figure Skating', icon: '⛸️' },
          { name: 'Archery', icon: '🏹' },
          { name: 'Triathlon', icon: '🏊' }
        ]
      },
      {
        name: 'Martial Arts',
        items: [
          { name: 'Karate', icon: '🥋' },
          { name: 'Judo', icon: '🤼' },
          { name: 'Taekwondo', icon: '🥋' },
          { name: 'Brazilian Jiu-Jitsu', icon: '🤼' },
          { name: 'Boxing', icon: '🥊' },
          { name: 'Muay Thai', icon: '🥋' },
          { name: 'Kung Fu', icon: '🐉' },
          { name: 'Aikido', icon: '🥋' },
          { name: 'Kendo', icon: '⚔️' },
          { name: 'Capoeira', icon: '💃' }
        ]
      },
      {
        name: 'Quidditch for Beginners',
        items: [
          { name: 'Basics of Broom Handling', icon: '🧹' },
          { name: 'Chaser Drills (Score with Quaffle)', icon: '🎯' },
          { name: 'Beater Strategies (Dodge Bludgers)', icon: '⚡' },
          { name: 'Keeper Training (Guard the Hoops)', icon: '🥅' },
          { name: 'Seeker Scrimmages (Snitch Capture)', icon: '✨' }
        ]
      },
      {
        name: 'Yoga & Wellness',
        items: [
          { name: 'Hatha Yoga', icon: '🧘' },
          { name: 'Vinyasa Flow', icon: '🌊' },
          { name: 'Ashtanga Yoga', icon: '🔥' },
          { name: 'Yin Yoga', icon: '🕊️' },
          { name: 'Pilates', icon: '💪' },
          { name: 'Meditation', icon: '☮️' },
          { name: 'Tai Chi', icon: '☯️' },
          { name: 'Aqua Yoga', icon: '💦' },
          { name: 'Hot Yoga (Bikram)', icon: '🧖' },
          { name: 'Restorative Yoga', icon: '😌' }
        ]
      }
    ]
  },
  {
    id: 2,
    name: 'Creative Arts',
    icon: '🎨',
    color: 'bg-blue-100',
    subcategories: [
      {
        name: 'Music',
        items: [
          { name: 'Instruments', icon: '🎹' },
          { name: 'Vocals', icon: '🎤' },
          { name: 'Production', icon: '🎧' },
          { name: 'Genres', icon: '🎼' },
          { name: 'Songwriting', icon: '📝' }
        ]
      },
      {
        name: 'Film & Photography',
        items: [
          { name: 'Filmmaking', icon: '🎬' },
          { name: 'Photography', icon: '📸' },
          { name: 'Equipment', icon: '🎥' },
          { name: 'Genres', icon: '🎞️' },
          { name: 'Post-Production', icon: '💻' }
        ]
      },
      {
        name: 'Art & Design',
        items: [
          { name: 'Fine Arts', icon: '🎨' },
          { name: 'Digital Art', icon: '🖥️' },
          { name: 'Applied Arts', icon: '👗' },
          { name: 'Media', icon: '📺' },
          { name: 'Art History', icon: '🏛️' }
        ]
      },
      {
        name: 'Acting',
        items: [
          { name: 'Theater', icon: '🎭' },
          { name: 'Screen Acting', icon: '🎥' },
          { name: 'Techniques', icon: '🎓' },
          { name: 'Genres', icon: '😂' },
          { name: 'Casting Process', icon: 'ℹ️' }
        ]
      },
      {
        name: 'Dance',
        items: [
          { name: 'Classical', icon: '💃' },
          { name: 'Cultural', icon: '🌍' },
          { name: 'Urban', icon: '🕺' },
          { name: 'Social', icon: '👯' },
          { name: 'Fitness', icon: '💪' }
        ]
      }
    ]
  },
  {
    id: 3,
    name: 'Professional & Academic',
    icon: '💼',
    color: 'bg-purple-100',
    subcategories: [
      {
        name: 'Technology',
        items: [
          { name: 'Programming', icon: '💻' },
          { name: 'AI & Data', icon: '🤖' },
          { name: 'Hardware', icon: '🔌' },
          { name: 'Cybersecurity', icon: '🔒' },
          { name: 'Emerging Tech', icon: '🚀' }
        ]
      },
      {
        name: 'Writing',
        items: [
          { name: 'Fiction', icon: '📖' },
          { name: 'Non-Fiction', icon: '📚' },
          { name: 'Screenwriting', icon: '🎬' },
          { name: 'Business', icon: '💼' },
          { name: 'Blogging', icon: '✍️' }
        ]
      },
      {
        name: 'Business',
        items: [
          { name: 'Entrepreneurship', icon: '🚀' },
          { name: 'Management', icon: '👔' },
          { name: 'Marketing', icon: '📈' },
          { name: 'Finance', icon: '💰' },
          { name: 'Networking', icon: '🤝' }
        ]
      },
      {
        name: 'Competitions',
        items: [
          { name: 'Academic', icon: '🧠' },
          { name: 'Creative', icon: '🎨' },
          { name: 'Sports', icon: '🏅' },
          { name: 'Business', icon: '📊' },
          { name: 'Other', icon: '🍳' }
        ]
      }
    ]
  }
];
