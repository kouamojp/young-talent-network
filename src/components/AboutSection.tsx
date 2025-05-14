
import React, { useEffect, useRef } from 'react';
import AnimatedText from './AnimatedText';
import GlassMorphism from './GlassMorphism';

const AboutSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    if (cardsRef.current) {
      observer.observe(cardsRef.current);
    }

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
      if (cardsRef.current) observer.unobserve(cardsRef.current);
    };
  }, []);

  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_left,_#f0f0f0,_transparent_70%)]"></div>
      
      <div className="container px-4 mx-auto">
        <div ref={sectionRef} className="max-w-3xl mx-auto text-center mb-16 stagger-animation">
          <div className="inline-block px-3 py-1 mb-4 bg-black/5 rounded-full">
            <span className="text-xs tracking-wide font-medium">À propos de Y&T</span>
          </div>
          
          <AnimatedText 
            text="La meilleure façon de trouver des personnes talentueuses partout dans le monde" 
            tag="h2" 
            highlight={true}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
          />
          
          <p className="text-lg text-black/70 mb-6">
            Des milliers de jeunes sportifs, musiciens, chanteurs, inventeurs et danseurs talentueux cherchent 
            leur place dans le monde. Les ressources qu'ils trouvent pour leur développement ne sont plus suffisantes.
          </p>
          
          <p className="text-lg text-black/70">
            Il n'y a pas de limites à l'amélioration personnelle, mais il existe des obstacles au développement des talents—ils 
            peuvent dépendre de l'argent, du temps et de la nature humaine. Y&T brise ces barrières.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto bg-white/30 backdrop-blur-sm p-8 rounded-xl mb-16 shadow-sm">
          <h3 className="text-2xl font-semibold mb-4 text-center">À propos du Projet</h3>
          <p className="mb-4">
            YAT (JE SUIS UN TALENT) est une plateforme où vous pouvez trouver toutes les informations sur les jeunes talents. 
            Il y a tellement de talents dans de nombreux pays, régions du monde et partout dans le monde. Certaines personnes talentueuses 
            n'ont aucune chance de se montrer au niveau international, ni même dans leur pays, ville ou quartier.
          </p>
          <p className="mb-4">
            YAT est le développement, l'enfant d'un sportif, d'un showman, d'un coach, d'un programmeur, d'un agent, 
            d'un entrepreneur, d'un entrepreneur de pompes funèbres, qui a parcouru ce chemin sans services globaux et est prêt 
            à vous le donner, amis.
          </p>
          <p>
            YAT est un service pour ces personnes talentueuses qui viennent de commencer leur carrière et pour ceux 
            qui recherchent de nouveaux jeunes talents.
          </p>
        </div>
        
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-animation">
          <GlassMorphism 
            className="p-8 transition-transform duration-500 hover:translate-y-[-8px]"
            intensity="light"
            hover={true}
          >
            <div className="h-12 w-12 bg-black/5 rounded-full flex items-center justify-center mb-6">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-4">Information Complète</h3>
            <p className="text-black/70">
              YAT est toute l'information sur une personne qui veut réussir dans son domaine—un CV, 
              un formulaire de candidature, des photos, des vidéos et des statistiques.
            </p>
          </GlassMorphism>
          
          <GlassMorphism 
            className="p-8 transition-transform duration-500 hover:translate-y-[-8px]"
            intensity="light"
            hover={true}
          >
            <div className="h-12 w-12 bg-black/5 rounded-full flex items-center justify-center mb-6">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-4">Portée Mondiale</h3>
            <p className="text-black/70">
              YAT est une plateforme où des personnes talentueuses de tous les coins du monde peuvent se mettre en valeur, 
              indépendamment des limitations géographiques ou financières.
            </p>
          </GlassMorphism>
          
          <GlassMorphism 
            className="p-8 transition-transform duration-500 hover:translate-y-[-8px]"
            intensity="light"
            hover={true}
          >
            <div className="h-12 w-12 bg-black/5 rounded-full flex items-center justify-center mb-6">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-4">Développement de Carrière</h3>
            <p className="text-black/70">
              YAT comble le fossé entre les talents émergents qui viennent de commencer leur carrière et 
              les professionnels établis qui recherchent de nouveaux talents frais pour collaborer.
            </p>
          </GlassMorphism>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
