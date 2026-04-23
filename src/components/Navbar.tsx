
import React, { useState } from 'react';
import { Search, MessageSquare, Bell, ChevronDown, Menu, Sun, Moon, Users, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import SidebarMain from './sidebar/SidebarMain';
import { useTheme } from '@/hooks/useTheme';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '@/i18n/LanguageContext';
import { PostCreationDialog } from './PostCreationDialog';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-card border-b border-border shadow-sm z-50">
      <div className="max-w-screen-2xl mx-auto px-4 flex items-center justify-between h-full">
        {/* Logo with Burger Menu */}
        <div className="flex items-center gap-3">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full hover:bg-gray-100"
              >
                <Menu className="h-5 w-5 text-foreground" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto p-0">
              <div className="h-full">
                <SidebarMain onNavigate={() => setMenuOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
          
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/b56312bb-24e8-4289-a96d-8651af4ddd7f.png" 
              alt="Logo" 
              className="h-9 w-9"
            />
          </Link>
        </div>

        {/* Center Search */}
        <div className="flex-1 max-w-2xl mx-4 hidden md:block">
          <div className="relative flex items-center bg-muted rounded-full">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder={t('nav.search')}
              className="h-10 w-full bg-muted pl-10 pr-4 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-2">
          <Link to="/profile" className="hidden sm:flex items-center gap-2 rounded-full hover:bg-muted p-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium hidden md:inline text-foreground">Your Profile</span>
          </Link>
          
          <div className="flex items-center space-x-2">
            <PostCreationDialog
              trigger={
                <Button
                  size="sm"
                  className="rounded-full gap-1.5 hidden sm:inline-flex"
                  title={t('create.post')}
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden md:inline">{t('create.post')}</span>
                </Button>
              }
            />
            <LanguageSwitcher />
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full bg-muted hover:bg-muted/80"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-foreground" /> : <Moon className="h-5 w-5 text-foreground" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full bg-muted hover:bg-muted/80"
              asChild
            >
              <Link to="/friends">
                <Users className="h-5 w-5 text-foreground" />
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full bg-muted hover:bg-muted/80"
              asChild
            >
              <Link to="/messages">
                <MessageSquare className="h-5 w-5 text-foreground" />
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full bg-muted hover:bg-muted/80"
            >
              <Bell className="h-5 w-5 text-foreground" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full bg-muted hover:bg-muted/80"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <ChevronDown className="h-5 w-5 text-foreground" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
