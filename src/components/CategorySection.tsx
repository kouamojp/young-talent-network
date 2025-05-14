
import React, { useEffect, useRef } from 'react';
import AnimatedText from './AnimatedText';
import GlassMorphism from './GlassMorphism';

interface CategoryCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  delay: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, description, icon, color, delay }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animate-fade-in');
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [delay]);

  return (
    <div
      ref={cardRef}
      className="opacity-0 relative group"
    >
      <GlassMorphism 
        className="p-8 h-full transition-all duration-500 group-hover:translate-y-[-8px]"
        intensity="light"
        hover={true}
      >
        <div className={`h-12 w-12 ${color} rounded-xl flex items-center justify-center mb-6`}>
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <p className="text-black/70">{description}</p>
      </GlassMorphism>
    </div>
  );
};

const CategorySection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

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

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  const categories = [
    {
      title: "Sports",
      description: "Pour les athlètes et les performeurs sportifs cherchant à faire avancer leur carrière et à trouver des opportunités dans le monde entier.",
      icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
      color: "bg-blue-50",
      delay: 100
    },
    {
      title: "Musique",
      description: "Pour les chanteurs, instrumentistes, compositeurs et tous les talents musicaux à la recherche de reconnaissance.",
      icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>,
      color: "bg-purple-50",
      delay: 200
    },
    {
      title: "Danse",
      description: "Pour les danseurs de tous styles cherchant à performer, concourir et collaborer sur de plus grandes scènes.",
      icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      color: "bg-pink-50",
      delay: 300
    },
    {
      title: "Théâtre",
      description: "Pour les artistes cherchant des rôles au théâtre, au cinéma, à la télévision et dans d'autres médias.",
      icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
      color: "bg-orange-50",
      delay: 400
    },
    {
      title: "Innovation",
      description: "Pour les inventeurs, entrepreneurs et esprits créatifs avec des idées révolutionnaires.",
      icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
      color: "bg-yellow-50",
      delay: 500
    },
    {
      title: "Arts Visuels",
      description: "Pour les peintres, sculpteurs, photographes et artistes numériques pour présenter leur portfolio.",
      icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
      color: "bg-green-50",
      delay: 600
    }
  ];

  return (
    <section id="categories" className="py-24 bg-black/[0.01]">
      <div className="container px-4 mx-auto">
        <div ref={sectionRef} className="max-w-3xl mx-auto text-center mb-16 stagger-animation">
          <div className="inline-block px-3 py-1 mb-4 bg-black/5 rounded-full">
            <span className="text-xs tracking-wide font-medium">Explorer les Catégories</span>
          </div>
          
          <AnimatedText 
            text="Découvrez Votre Voie" 
            tag="h2" 
            highlight={true}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
          />
          
          <p className="text-lg text-black/70">
            Y&T soutient les talents dans plusieurs disciplines, vous connectant avec le 
            bon public, des mentors et des opportunités dans votre domaine spécifique.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <CategoryCard
              key={index}
              title={category.title}
              description={category.description}
              icon={category.icon}
              color={category.color}
              delay={category.delay}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
