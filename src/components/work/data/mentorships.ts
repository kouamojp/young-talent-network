
export interface Mentorship {
  id: number;
  title: string;
  mentor: string;
  duration: string;
  commitment: string;
  applicationDeadline: string;
  description: string;
}

export const mentorships = [
  {
    id: 1,
    title: "Fashion Industry Mentorship Program",
    mentor: "Lisa Chen, Fashion Designer",
    duration: "3 months",
    commitment: "4 hours/week",
    applicationDeadline: "Jun 20, 2023",
    description: "Personalized guidance from an established fashion designer to help develop your portfolio and industry connections."
  },
  {
    id: 2,
    title: "Music Production Mentorship",
    mentor: "DJ Maximus, Grammy-nominated Producer",
    duration: "6 months",
    commitment: "2 hours/week",
    applicationDeadline: "Jul 5, 2023",
    description: "Learn music production techniques, studio workflow, and industry insights from an experienced producer."
  },
  {
    id: 3,
    title: "Young Writers Program",
    mentor: "Various Published Authors",
    duration: "4 months",
    commitment: "3 hours/week",
    applicationDeadline: "Jul 25, 2023",
    description: "Develop your writing skills through feedback sessions and personalized guidance from published authors."
  }
];
