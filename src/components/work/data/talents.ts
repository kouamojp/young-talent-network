
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
    name: "Émilie Chen",
    avatar: "/placeholder.svg",
    skills: ["Piano", "Composition", "Chant"],
    experience: "5 ans",
    location: "New York, NY",
    availability: "Temps partiel",
    portfolio: "Voir le Portfolio",
    description: "Pianiste formée classiquement avec une passion pour la composition contemporaine et les arrangements vocaux."
  },
  {
    id: 2,
    name: "Jordan Smith",
    avatar: "/placeholder.svg",
    skills: ["Guitare", "Écriture de chansons", "Production"],
    experience: "3 ans",
    location: "Los Angeles, CA",
    availability: "Freelance",
    portfolio: "Voir le Portfolio",
    description: "Guitariste et auteur-compositeur autodidacte avec un style unique mélangeant des éléments folk et électroniques."
  },
  {
    id: 3,
    name: "Maya Johnson",
    avatar: "/placeholder.svg",
    skills: ["Danse", "Chorégraphie", "Enseignement"],
    experience: "7 ans",
    location: "Chicago, IL",
    availability: "Temps plein",
    portfolio: "Voir le Portfolio",
    description: "Danseuse contemporaine avec une expérience en ballet et hip-hop, passionnée par l'enseignement aux jeunes."
  }
];
