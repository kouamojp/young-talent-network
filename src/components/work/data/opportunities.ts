
export interface Opportunity {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  postedDate: string;
  description: string;
  tags: string[];
  isFeatured?: boolean;
}

export const opportunities = [
  {
    id: 1,
    title: "Junior Dancer for Music Video",
    company: "Elite Productions",
    location: "Los Angeles, CA",
    type: "Contract",
    postedDate: "2 days ago",
    description: "Seeking talented dancers aged 16-25 for an upcoming music video shoot. Previous performance experience required.",
    tags: ["Dance", "Performance", "Music Video"],
    isFeatured: true
  },
  {
    id: 2,
    title: "Voice Actor for Animation Series",
    company: "Creative Media Studios",
    location: "Remote",
    type: "Freelance",
    postedDate: "1 week ago",
    description: "Looking for voice actors with diverse vocal ranges for an animated youth series. Recording equipment required.",
    tags: ["Voice Acting", "Animation", "Remote"]
  },
  {
    id: 3,
    title: "Junior Graphic Designer",
    company: "ArtSpace Agency",
    location: "New York, NY",
    type: "Internship",
    postedDate: "3 days ago",
    description: "Design internship opportunity for creative individuals with portfolio showcasing digital art skills.",
    tags: ["Design", "Digital Art", "Internship"]
  },
  {
    id: 4,
    title: "Young Musician for Restaurant Gigs",
    company: "The Grand Restaurant",
    location: "Chicago, IL",
    type: "Part-time",
    postedDate: "5 days ago",
    description: "Weekend performances for talented musicians. Piano, violin, or acoustic guitar preferred.",
    tags: ["Music", "Performance", "Part-time"]
  }
];
