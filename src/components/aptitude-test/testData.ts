
export type Question = {
  id: number;
  question: string;
  options: Option[];
};

export type Option = {
  id: string;
  text: string;
};

export type TalentArea = {
  area: string;
  score: number;
  description: string;
};

// Mock questions
export const questions: Question[] = [
  {
    id: 1,
    question: 'When faced with a creative challenge, you prefer to:',
    options: [
      { id: 'a', text: 'Think through multiple possibilities before deciding' },
      { id: 'b', text: 'Trust your instincts and go with what feels right' },
      { id: 'c', text: 'Research what others have done in similar situations' },
      { id: 'd', text: 'Collaborate with others to find the best solution' },
    ]
  },
  {
    id: 2,
    question: 'In a group setting, you typically find yourself:',
    options: [
      { id: 'a', text: 'Leading the discussion and making decisions' },
      { id: 'b', text: 'Contributing ideas but letting others lead' },
      { id: 'c', text: 'Observing first, then sharing well-thought-out perspectives' },
      { id: 'd', text: 'Mediating between different viewpoints' },
    ]
  },
  {
    id: 3,
    question: 'When learning something new, you prefer to:',
    options: [
      { id: 'a', text: 'Read detailed instructions or theory first' },
      { id: 'b', text: 'Watch someone else demonstrate it' },
      { id: 'c', text: 'Jump in and learn through trial and error' },
      { id: 'd', text: 'Discuss the concept with an expert' },
    ]
  },
  {
    id: 4,
    question: 'When receiving feedback, you value most:',
    options: [
      { id: 'a', text: 'Specific, actionable suggestions for improvement' },
      { id: 'b', text: 'Recognition of your strengths and achievements' },
      { id: 'c', text: "Honest critique, even if it's difficult to hear" },
      { id: 'd', text: 'A balanced perspective that considers context' },
    ]
  },
  {
    id: 5,
    question: 'When working on a project, you typically:',
    options: [
      { id: 'a', text: 'Plan everything in detail before starting' },
      { id: 'b', text: 'Start quickly and adjust as you go' },
      { id: 'c', text: 'Focus on one aspect at a time, perfecting each part' },
      { id: 'd', text: 'Think about the big picture and overall impact' },
    ]
  },
];

// Mock results based on answers
export const getTalentAreas = (): TalentArea[] => {
  return [
    { area: 'Visual Arts', score: 85, description: 'You show strong aptitude for visual expression and design thinking.' },
    { area: 'Performance', score: 72, description: 'You have good potential for performing arts and public presentation.' },
    { area: 'Writing', score: 68, description: 'You demonstrate solid verbal communication and storytelling abilities.' },
    { area: 'Technical/Production', score: 60, description: 'You have moderate aptitude for behind-the-scenes production work.' },
  ];
};
