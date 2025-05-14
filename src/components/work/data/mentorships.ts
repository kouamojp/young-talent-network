
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
    title: "Programme de Mentorat dans l'Industrie de la Mode",
    mentor: "Lisa Chen, Designer de Mode",
    duration: "3 mois",
    commitment: "4 heures/semaine",
    applicationDeadline: "20 juin 2023",
    description: "Guidance personnalisée d'un designer de mode établi pour vous aider à développer votre portfolio et vos connexions dans l'industrie."
  },
  {
    id: 2,
    title: "Mentorat en Production Musicale",
    mentor: "DJ Maximus, Producteur nominé aux Grammy",
    duration: "6 mois",
    commitment: "2 heures/semaine",
    applicationDeadline: "5 juil. 2023",
    description: "Apprenez les techniques de production musicale, le flux de travail en studio et les perspectives de l'industrie auprès d'un producteur expérimenté."
  },
  {
    id: 3,
    title: "Programme des Jeunes Écrivains",
    mentor: "Divers Auteurs Publiés",
    duration: "4 mois",
    commitment: "3 heures/semaine",
    applicationDeadline: "25 juil. 2023",
    description: "Développez vos compétences d'écriture grâce à des sessions de feedback et des conseils personnalisés d'auteurs publiés."
  }
];
