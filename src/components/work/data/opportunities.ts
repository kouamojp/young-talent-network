
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
    title: "Danseur Junior pour Clip Vidéo",
    company: "Elite Productions",
    location: "Los Angeles, CA",
    type: "Contrat",
    postedDate: "Il y a 2 jours",
    description: "À la recherche de danseurs talentueux âgés de 16 à 25 ans pour un prochain tournage de clip vidéo. Expérience préalable en performance requise.",
    tags: ["Danse", "Performance", "Clip Vidéo"],
    isFeatured: true
  },
  {
    id: 2,
    title: "Doubleur Vocal pour Série d'Animation",
    company: "Creative Media Studios",
    location: "À distance",
    type: "Freelance",
    postedDate: "Il y a 1 semaine",
    description: "Recherche de doubleurs vocaux avec diverses gammes vocales pour une série animée jeunesse. Équipement d'enregistrement requis.",
    tags: ["Doublage", "Animation", "À distance"]
  },
  {
    id: 3,
    title: "Designer Graphique Junior",
    company: "ArtSpace Agency",
    location: "New York, NY",
    type: "Stage",
    postedDate: "Il y a 3 jours",
    description: "Opportunité de stage en design pour les personnes créatives avec un portfolio démontrant des compétences en art numérique.",
    tags: ["Design", "Art Numérique", "Stage"]
  },
  {
    id: 4,
    title: "Jeune Musicien pour Concerts en Restaurant",
    company: "The Grand Restaurant",
    location: "Chicago, IL",
    type: "Temps partiel",
    postedDate: "Il y a 5 jours",
    description: "Performances de weekend pour musiciens talentueux. Piano, violon ou guitare acoustique préférés.",
    tags: ["Musique", "Performance", "Temps partiel"]
  }
];
