
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
    title: "Programme de Développement des Jeunes Artistes",
    organization: "Fondation Nationale des Arts",
    amount: "5 000 €",
    deadline: "30 juin 2023",
    requirements: "Artistes visuels âgés de 15 à 21 ans avec portfolio",
    description: "Bourse annuelle soutenant les artistes visuels émergents avec mentorat et opportunités d'exposition."
  },
  {
    id: 2,
    title: "Bourse d'Éducation Musicale",
    organization: "Fondation Harmony",
    amount: "3 500 €",
    deadline: "15 juil. 2023",
    requirements: "Étudiants en musique avec vidéo d'audition",
    description: "Soutien aux jeunes musiciens poursuivant une éducation musicale formelle ou des programmes de formation spécialisés."
  },
  {
    id: 3,
    title: "Subvention de Médias Numériques pour Adolescents",
    organization: "Initiative Future Creators",
    amount: "2 000 €",
    deadline: "10 août 2023",
    requirements: "Créateurs âgés de 13 à 19 ans avec proposition de projet",
    description: "Financement pour des projets innovants de médias numériques comprenant l'animation, la conception de jeux et la narration interactive."
  }
];
