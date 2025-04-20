// Sample user data
export const user = {
  name: 'Alex Johnson',
  nickname: 'Piano Virtuoso',
  username: 'alexj',
  avatar: '/placeholder.svg',
  coverPhoto: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070',
  bio: 'Professional pianist | Music educator | Seeking international performance opportunities',
  location: 'New York, USA',
  website: 'alexjohnson.music',
  joined: 'January 2023',
  birthday: 'May 15',
  education: 'Juilliard School of Music',
  work: 'Piano Instructor at NYC Music Academy',
  hobbies: ['Photography 📸', 'Nature Hiking 🌲', 'Cooking Italian Cuisine 🍝'],
  followers: 1240,
  following: 350,
  mentors: 3,
  status: 'Heading to Carnegie Hall!',
  socialLinks: [
    {
      platform: 'instagram',
      url: 'instagram.com/alexjohnson_piano',
      verified: true,
      lastActivity: {
        type: 'post',
        value: '328 likes'
      }
    },
    {
      platform: 'youtube',
      url: 'youtube.com/c/alexjohnsonpiano',
      verified: true
    }
  ]
};

// Sample posts
export const userPosts = [
  {
    id: '1',
    author: {
      name: user.name,
      avatar: user.avatar
    },
    content: 'Excited to share that I\'ll be performing at Carnegie Hall next month! It\'s been a dream come true.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    likes: 89,
    comments: 24,
    shares: 12
  },
  {
    id: '2',
    author: {
      name: user.name,
      avatar: user.avatar
    },
    content: 'Just finished my latest piano composition. Can\'t wait to share it with all of you soon!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    likes: 65,
    comments: 18,
    shares: 5
  }
];
