
export interface Scholarship {
  id: number;
  title: string;
  organization: string;
  amount: string;
  deadline: string;
  requirements: string;
  description: string;
}

export const scholarships = [
  {
    id: 1,
    title: "Young Artist Development Program",
    organization: "National Arts Foundation",
    amount: "$5,000",
    deadline: "Jun 30, 2023",
    requirements: "Visual artists aged 15-21 with portfolio",
    description: "Annual scholarship supporting emerging visual artists with mentorship and exhibition opportunities."
  },
  {
    id: 2,
    title: "Music Education Scholarship",
    organization: "Harmony Foundation",
    amount: "$3,500",
    deadline: "Jul 15, 2023",
    requirements: "Music students with audition video",
    description: "Supporting young musicians pursuing formal music education or specialized training programs."
  },
  {
    id: 3,
    title: "Digital Media Grant for Teens",
    organization: "Future Creators Initiative",
    amount: "$2,000",
    deadline: "Aug 10, 2023",
    requirements: "Creators aged 13-19 with project proposal",
    description: "Funding for innovative digital media projects including animation, game design, and interactive storytelling."
  }
];
