
export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  subcategories: Subcategory[];
  performanceTracking?: PerformanceTracking;
}

export interface Subcategory {
  name: string;
  items: SubcategoryItem[];
  performanceMetrics?: PerformanceMetric[];
}

export interface SubcategoryItem {
  name: string;
  icon: string;
}

export interface PerformanceTracking {
  title: string;
  description: string;
  features: string[];
}

export interface PerformanceMetric {
  name: string;
  icon: string;
  description: string;
}

export interface AthleteParameter {
  name: string;
  score: number;
  goal: number;
}

export const athleteParameters: AthleteParameter[] = [
  { name: "Endurance", score: 75, goal: 90 },
  { name: "Flexibility", score: 60, goal: 80 },
  { name: "Game IQ", score: 88, goal: 95 },
  { name: "Reaction Time", score: 82, goal: 95 },
  { name: "Balance", score: 70, goal: 85 }
];

export const categories: Category[] = [
  {
    id: 1,
    name: 'Sports & Fitness',
    icon: '🏆',
    color: 'bg-green-100',
    performanceTracking: {
      title: "Athlete Profile Hub",
      description: "Accessible from any sport category!",
      features: [
        "🎮 Unlock achievements (e.g., 'Fast Footwork Frenzy')",
        "🤝 Compare stats with friends (friendly mode!)",
        "📱 Sync with wearables (Apple Watch/Strava)",
        "🍎 Get nutrition tips based on workouts"
      ]
    },
    subcategories: [
      {
        name: 'Team Sports',
        performanceMetrics: [
          { name: "Speed drills", icon: "👟", description: "Track your sprint times and agility" },
          { name: "Passing accuracy", icon: "🎯", description: "Measure passing completion percentage" },
          { name: "Tactical IQ test", icon: "🧠", description: "Test your game awareness and decision making" },
          { name: "Team synergy score", icon: "💛", description: "Rate how well you collaborate with teammates" }
        ],
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
        performanceMetrics: [
          { name: "Serve/swing force", icon: "💪", description: "Measure the power of your shots" },
          { name: "Precision radar", icon: "🎯", description: "Track your accuracy and consistency" },
          { name: "Focus endurance", icon: "🧘", description: "Evaluate your mental concentration over time" },
          { name: "Progress dashboard", icon: "📈", description: "Visualize your improvement over time" }
        ],
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
        performanceMetrics: [
          { name: "Reaction time", icon: "⚡", description: "Test how quickly you respond to stimuli" },
          { name: "Strike impact", icon: "🥊", description: "Measure the force of your strikes" },
          { name: "Defense agility", icon: "🛡️", description: "Evaluate your defensive movements and evasions" },
          { name: "Mental resilience", icon: "❤️", description: "Track your mental toughness under pressure" }
        ],
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
        performanceMetrics: [
          { name: "Broom balance", icon: "🧹", description: "Test your stability while riding a broom" },
          { name: "Snitch spotting", icon: "✨", description: "Measure your ability to spot the golden snitch" },
          { name: "Quaffle accuracy", icon: "🎯", description: "Track your scoring percentage with the quaffle" },
          { name: "Air time tracker", icon: "☁️", description: "Measure time spent airborne during practice" }
        ],
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
        performanceMetrics: [
          { name: "Pose hold time", icon: "🕊️", description: "Track how long you can maintain challenging poses" },
          { name: "Mind/body sync", icon: "☯️", description: "Measure your breath-movement coordination" },
          { name: "Recovery score", icon: "🌿", description: "Evaluate how quickly your body recovers after sessions" },
          { name: "Stress-o-meter", icon: "😌", description: "Monitor your stress levels before and after practice" }
        ],
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
