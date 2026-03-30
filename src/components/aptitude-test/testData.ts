export type Option = {
  id: string;
  text: string;
};

export type Question = {
  id: number;
  question: string;
  options: Option[];
  category: string;
};

export type TalentArea = {
  area: string;
  score: number;
  description: string;
};

export type TestCategory = {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
};

export const testCategories: TestCategory[] = [
  { id: 'sports', name: 'Sports', icon: '⚽', description: 'Test your athletic aptitudes and physical abilities', color: 'from-green-500 to-emerald-600' },
  { id: 'arts', name: 'Arts & Creativity', icon: '🎨', description: 'Discover your creative and artistic talents', color: 'from-pink-500 to-rose-600' },
  { id: 'music', name: 'Music', icon: '🎵', description: 'Evaluate your musical ear and rhythm abilities', color: 'from-purple-500 to-violet-600' },
  { id: 'technology', name: 'Technology', icon: '💻', description: 'Assess your tech skills and logical thinking', color: 'from-blue-500 to-cyan-600' },
  { id: 'business', name: 'Business & Leadership', icon: '📊', description: 'Measure your entrepreneurial and leadership skills', color: 'from-amber-500 to-orange-600' },
  { id: 'science', name: 'Science & Research', icon: '🔬', description: 'Test your analytical and scientific reasoning', color: 'from-teal-500 to-cyan-600' },
];

export const questionsByCategory: Record<string, Question[]> = {
  sports: [
    { id: 1, category: 'sports', question: "How do you react under competitive pressure?", options: [
      { id: "a", text: "I thrive and perform better under pressure" },
      { id: "b", text: "I stay calm and maintain my routine" },
      { id: "c", text: "I sometimes feel anxious but push through" },
      { id: "d", text: "I prefer low-pressure environments" },
    ]},
    { id: 2, category: 'sports', question: "What type of physical activity do you enjoy most?", options: [
      { id: "a", text: "Team sports (football, basketball, volleyball)" },
      { id: "b", text: "Individual sports (swimming, athletics, tennis)" },
      { id: "c", text: "Combat sports (boxing, judo, karate)" },
      { id: "d", text: "Artistic sports (dance, gymnastics, figure skating)" },
    ]},
    { id: 3, category: 'sports', question: "How important is strategy vs. raw physical ability?", options: [
      { id: "a", text: "Strategy is everything - I'm a tactical thinker" },
      { id: "b", text: "Physical ability matters most - strength and speed" },
      { id: "c", text: "Balance of both is ideal" },
      { id: "d", text: "Flexibility and coordination matter more" },
    ]},
    { id: 4, category: 'sports', question: "How do you handle training routines?", options: [
      { id: "a", text: "I love structured, intense training schedules" },
      { id: "b", text: "I prefer varied and fun training sessions" },
      { id: "c", text: "I train best alone with self-discipline" },
      { id: "d", text: "I need a coach or group to stay motivated" },
    ]},
    { id: 5, category: 'sports', question: "What motivates you most in sports?", options: [
      { id: "a", text: "Winning competitions and trophies" },
      { id: "b", text: "Personal improvement and breaking records" },
      { id: "c", text: "Team spirit and camaraderie" },
      { id: "d", text: "Health, wellness and self-expression" },
    ]},
  ],
  arts: [
    { id: 1, category: 'arts', question: "When you see a blank canvas, you think:", options: [
      { id: "a", text: "Endless possibilities - I want to paint immediately" },
      { id: "b", text: "I'd rather sculpt or work with materials" },
      { id: "c", text: "I think of photography or digital art" },
      { id: "d", text: "I'd prefer to write or tell a story" },
    ]},
    { id: 2, category: 'arts', question: "How do you express your emotions?", options: [
      { id: "a", text: "Through visual art (drawing, painting)" },
      { id: "b", text: "Through performance (acting, dance)" },
      { id: "c", text: "Through writing (poetry, stories)" },
      { id: "d", text: "Through design (fashion, architecture)" },
    ]},
    { id: 3, category: 'arts', question: "Your approach to creativity is:", options: [
      { id: "a", text: "Spontaneous - I follow inspiration" },
      { id: "b", text: "Methodical - I plan and sketch first" },
      { id: "c", text: "Collaborative - I work best with others" },
      { id: "d", text: "Technical - I master tools and techniques" },
    ]},
    { id: 4, category: 'arts', question: "Which artistic environment appeals to you?", options: [
      { id: "a", text: "A quiet studio with natural light" },
      { id: "b", text: "A bustling stage or gallery" },
      { id: "c", text: "A digital workspace with screens" },
      { id: "d", text: "The outdoors and nature" },
    ]},
    { id: 5, category: 'arts', question: "What do you value most in art?", options: [
      { id: "a", text: "Emotional impact and storytelling" },
      { id: "b", text: "Technical mastery and skill" },
      { id: "c", text: "Innovation and pushing boundaries" },
      { id: "d", text: "Cultural significance and tradition" },
    ]},
  ],
  music: [
    { id: 1, category: 'music', question: "How do you relate to music?", options: [
      { id: "a", text: "I play one or more instruments" },
      { id: "b", text: "I love singing and vocal performance" },
      { id: "c", text: "I'm into production and mixing" },
      { id: "d", text: "I compose and write songs" },
    ]},
    { id: 2, category: 'music', question: "What genre speaks to you most?", options: [
      { id: "a", text: "Classical / Jazz - complex harmonies" },
      { id: "b", text: "Pop / R&B - melody and vocals" },
      { id: "c", text: "Hip-hop / Electronic - beats and production" },
      { id: "d", text: "Rock / Folk - raw emotion and storytelling" },
    ]},
    { id: 3, category: 'music', question: "How do you learn music best?", options: [
      { id: "a", text: "Reading sheet music and theory" },
      { id: "b", text: "By ear - listening and reproducing" },
      { id: "c", text: "Through digital tools and software" },
      { id: "d", text: "Jamming with other musicians" },
    ]},
    { id: 4, category: 'music', question: "Your ideal music career would be:", options: [
      { id: "a", text: "Solo performer / Virtuoso" },
      { id: "b", text: "Band member / Orchestra player" },
      { id: "c", text: "Producer / Sound engineer" },
      { id: "d", text: "Music teacher / Mentor" },
    ]},
    { id: 5, category: 'music', question: "What's your strongest musical skill?", options: [
      { id: "a", text: "Rhythm and timing" },
      { id: "b", text: "Melody and pitch recognition" },
      { id: "c", text: "Improvisation and creativity" },
      { id: "d", text: "Stage presence and performance" },
    ]},
  ],
  technology: [
    { id: 1, category: 'technology', question: "How do you approach problem-solving?", options: [
      { id: "a", text: "Break it down into logical steps" },
      { id: "b", text: "Look for creative/unconventional solutions" },
      { id: "c", text: "Research existing solutions first" },
      { id: "d", text: "Prototype quickly and iterate" },
    ]},
    { id: 2, category: 'technology', question: "Which tech area interests you most?", options: [
      { id: "a", text: "Software development and coding" },
      { id: "b", text: "AI and machine learning" },
      { id: "c", text: "Cybersecurity and networking" },
      { id: "d", text: "Design and user experience" },
    ]},
    { id: 3, category: 'technology', question: "How do you learn new technologies?", options: [
      { id: "a", text: "Online courses and documentation" },
      { id: "b", text: "Building projects from scratch" },
      { id: "c", text: "Contributing to open-source" },
      { id: "d", text: "Attending workshops and hackathons" },
    ]},
    { id: 4, category: 'technology', question: "What motivates you in tech?", options: [
      { id: "a", text: "Solving complex problems" },
      { id: "b", text: "Building products people use" },
      { id: "c", text: "Pushing technological boundaries" },
      { id: "d", text: "Making money and career growth" },
    ]},
    { id: 5, category: 'technology', question: "Your ideal tech role is:", options: [
      { id: "a", text: "Full-stack developer" },
      { id: "b", text: "Data scientist / AI engineer" },
      { id: "c", text: "Tech lead / Architect" },
      { id: "d", text: "Product manager / Designer" },
    ]},
  ],
  business: [
    { id: 1, category: 'business', question: "How do you handle decision-making?", options: [
      { id: "a", text: "Data-driven - I analyze numbers first" },
      { id: "b", text: "Intuitive - I trust my gut feeling" },
      { id: "c", text: "Collaborative - I consult my team" },
      { id: "d", text: "Strategic - I think long-term impact" },
    ]},
    { id: 2, category: 'business', question: "What's your leadership style?", options: [
      { id: "a", text: "Visionary - I inspire with big ideas" },
      { id: "b", text: "Servant leader - I empower my team" },
      { id: "c", text: "Results-driven - I focus on outcomes" },
      { id: "d", text: "Adaptive - I change approach as needed" },
    ]},
    { id: 3, category: 'business', question: "Which business area excites you?", options: [
      { id: "a", text: "Marketing and branding" },
      { id: "b", text: "Finance and investment" },
      { id: "c", text: "Operations and management" },
      { id: "d", text: "Entrepreneurship and startups" },
    ]},
    { id: 4, category: 'business', question: "How do you handle risk?", options: [
      { id: "a", text: "I take calculated risks with research" },
      { id: "b", text: "I'm a natural risk-taker" },
      { id: "c", text: "I prefer safe, proven strategies" },
      { id: "d", text: "I balance risk and safety" },
    ]},
    { id: 5, category: 'business', question: "What's most important in business?", options: [
      { id: "a", text: "Innovation and disruption" },
      { id: "b", text: "Customer satisfaction" },
      { id: "c", text: "Profit and growth" },
      { id: "d", text: "Social impact and sustainability" },
    ]},
  ],
  science: [
    { id: 1, category: 'science', question: "What's your approach to research?", options: [
      { id: "a", text: "Hypothesis-driven experimentation" },
      { id: "b", text: "Data analysis and pattern recognition" },
      { id: "c", text: "Literature review and synthesis" },
      { id: "d", text: "Fieldwork and observation" },
    ]},
    { id: 2, category: 'science', question: "Which scientific field fascinates you?", options: [
      { id: "a", text: "Physics and mathematics" },
      { id: "b", text: "Biology and life sciences" },
      { id: "c", text: "Chemistry and materials" },
      { id: "d", text: "Environmental and earth sciences" },
    ]},
    { id: 3, category: 'science', question: "How do you process complex information?", options: [
      { id: "a", text: "Visual models and diagrams" },
      { id: "b", text: "Mathematical formulas" },
      { id: "c", text: "Written explanations" },
      { id: "d", text: "Hands-on experiments" },
    ]},
    { id: 4, category: 'science', question: "What drives your curiosity?", options: [
      { id: "a", text: "Understanding how things work" },
      { id: "b", text: "Discovering something new" },
      { id: "c", text: "Solving real-world problems" },
      { id: "d", text: "Teaching and sharing knowledge" },
    ]},
    { id: 5, category: 'science', question: "Your ideal science career:", options: [
      { id: "a", text: "Academic researcher / Professor" },
      { id: "b", text: "Industry R&D scientist" },
      { id: "c", text: "Science communicator / Writer" },
      { id: "d", text: "Medical / Healthcare professional" },
    ]},
  ],
};

// Keep legacy export for backward compatibility
export const questions = questionsByCategory.arts;

export const getResultsByCategory = (category: string, answers: Record<number, string>): TalentArea[] => {
  const resultMaps: Record<string, TalentArea[]> = {
    sports: [
      { area: "Team Sports", score: 0, description: "Strong aptitude for collaborative team-based sports" },
      { area: "Individual Performance", score: 0, description: "Excel in solo competitive disciplines" },
      { area: "Combat & Martial Arts", score: 0, description: "Natural fit for combat sports and martial arts" },
      { area: "Artistic Sports", score: 0, description: "Talent for dance, gymnastics and expressive movement" },
    ],
    arts: [
      { area: "Visual Arts", score: 0, description: "Strong aptitude for painting, drawing and visual expression" },
      { area: "Performing Arts", score: 0, description: "Natural talent for stage, acting and live performance" },
      { area: "Digital Arts", score: 0, description: "Skills in digital creation, photography and design" },
      { area: "Literary Arts", score: 0, description: "Gift for writing, storytelling and narrative" },
    ],
    music: [
      { area: "Instrumental Performance", score: 0, description: "Technical mastery of musical instruments" },
      { area: "Vocal Performance", score: 0, description: "Singing ability and vocal control" },
      { area: "Music Production", score: 0, description: "Skills in recording, mixing and sound design" },
      { area: "Composition", score: 0, description: "Talent for creating original music and songwriting" },
    ],
    technology: [
      { area: "Software Development", score: 0, description: "Coding and application building skills" },
      { area: "AI & Data Science", score: 0, description: "Machine learning and data analysis aptitude" },
      { area: "System Architecture", score: 0, description: "Design of complex technical systems" },
      { area: "UX/Product Design", score: 0, description: "User experience and product thinking" },
    ],
    business: [
      { area: "Marketing & Brand", score: 0, description: "Marketing strategy and brand building" },
      { area: "Finance & Investment", score: 0, description: "Financial analysis and investment skills" },
      { area: "Leadership & Management", score: 0, description: "People management and organizational leadership" },
      { area: "Entrepreneurship", score: 0, description: "Startup mindset and business creation" },
    ],
    science: [
      { area: "Pure Research", score: 0, description: "Theoretical and experimental research aptitude" },
      { area: "Applied Science", score: 0, description: "Practical application of scientific knowledge" },
      { area: "Data Analysis", score: 0, description: "Statistical analysis and pattern recognition" },
      { area: "Science Communication", score: 0, description: "Ability to explain and teach complex concepts" },
    ],
  };

  const areas = resultMaps[category] || resultMaps.arts;
  
  // Generate scores based on answers
  const answerValues = Object.values(answers);
  const scoreMap: Record<string, number[]> = { a: [85, 60, 45, 70], b: [65, 80, 55, 72], c: [50, 70, 85, 60], d: [70, 55, 68, 82] };
  
  return areas.map((area, index) => {
    let totalScore = 0;
    answerValues.forEach((answer) => {
      const scores = scoreMap[answer] || [60, 60, 60, 60];
      totalScore += scores[index % 4];
    });
    const avgScore = Math.min(Math.round(totalScore / Math.max(answerValues.length, 1)), 100);
    return { ...area, score: avgScore || Math.floor(Math.random() * 30) + 55 };
  }).sort((a, b) => b.score - a.score);
};

// Legacy export
export const getTalentAreas = (): TalentArea[] => {
  return getResultsByCategory('arts', {});
};
