
export interface Talent {
  id: number;
  name: string;
  avatar: string;
  skills: string[];
  experience: string;
  location: string;
  availability: string;
  portfolio: string;
  description: string;
}

export const talents = [
  {
    id: 1,
    name: "Emily Chen",
    avatar: "/placeholder.svg",
    skills: ["Piano", "Composition", "Vocals"],
    experience: "5 years",
    location: "New York, NY",
    availability: "Part-time",
    portfolio: "View Portfolio",
    description: "Classically trained pianist with a passion for contemporary composition and vocal arrangements."
  },
  {
    id: 2,
    name: "Jordan Smith",
    avatar: "/placeholder.svg",
    skills: ["Guitar", "Songwriting", "Production"],
    experience: "3 years",
    location: "Los Angeles, CA",
    availability: "Freelance",
    portfolio: "View Portfolio",
    description: "Self-taught guitarist and songwriter with a unique style blending folk and electronic elements."
  },
  {
    id: 3,
    name: "Maya Johnson",
    avatar: "/placeholder.svg",
    skills: ["Dance", "Choreography", "Teaching"],
    experience: "7 years",
    location: "Chicago, IL",
    availability: "Full-time",
    portfolio: "View Portfolio",
    description: "Contemporary dancer with experience in ballet and hip-hop, passionate about teaching youth."
  }
];
