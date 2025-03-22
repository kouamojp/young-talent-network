
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import GlassMorphism from './GlassMorphism';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsScrolled(offset > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled 
          ? 'py-4' 
          : 'py-6'
      )}
    >
      <GlassMorphism 
        className={cn(
          'mx-auto container max-w-7xl px-4 sm:px-6 transition-all duration-500',
          isScrolled 
            ? 'rounded-full' 
            : 'rounded-3xl'
        )} 
        intensity={isScrolled ? 'medium' : 'light'}
      >
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight">Y&T</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#about" className="text-sm font-medium hover:opacity-70 transition-opacity">
              About
            </a>
            <a href="#talents" className="text-sm font-medium hover:opacity-70 transition-opacity">
              Talents
            </a>
            <a href="#categories" className="text-sm font-medium hover:opacity-70 transition-opacity">
              Categories
            </a>
            <a 
              href="#contact" 
              className="text-sm font-medium bg-black text-white px-4 py-2 rounded-full hover:bg-black/80 transition-colors"
            >
              Join Now
            </a>
          </nav>

          {/* Mobile Navigation Toggle */}
          <button 
            className="md:hidden flex items-center" 
            onClick={toggleMenu}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </GlassMorphism>

      {/* Mobile Menu */}
      <div 
        className={cn(
          'fixed inset-0 bg-white z-40 transform transition-transform duration-300 ease-apple pt-24',
          isMenuOpen ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        <nav className="container flex flex-col items-center space-y-8 px-4 pt-10">
          <a 
            href="#about" 
            className="text-xl font-medium" 
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </a>
          <a 
            href="#talents" 
            className="text-xl font-medium" 
            onClick={() => setIsMenuOpen(false)}
          >
            Talents
          </a>
          <a 
            href="#categories" 
            className="text-xl font-medium" 
            onClick={() => setIsMenuOpen(false)}
          >
            Categories
          </a>
          <a 
            href="#contact" 
            className="text-xl font-medium bg-black text-white px-6 py-3 rounded-full"
            onClick={() => setIsMenuOpen(false)}
          >
            Join Now
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
