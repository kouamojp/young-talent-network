
import React, { useState } from 'react';
import { Search, MessageSquare, Bell, Menu, Sun, Moon, Users, Plus } from 'lucide-react';
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
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-card/95 backdrop-blur border-b border-border z-50">
      <div className="max-w-screen-2xl mx-auto px-4 flex items-center justify-between h-full">
        {/* Logo with Burger Menu */}
        <div className="flex items-center gap-3">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full"
                aria-label="Menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto p-0">
              <div className="h-full">
                <SidebarMain onNavigate={() => setMenuOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
          
          <Link to="/" className="flex items-center gap-2" aria-label="YAT">
            <img 
              src="/lovable-uploads/b56312bb-24e8-4289-a96d-8651af4ddd7f.png" 
              alt="" 
              className="h-8 w-8"
            />
            <span className="hidden sm:inline font-display font-semibold text-[17px] tracking-tight text-foreground">YAT</span>
          </Link>
        </div>

        {/* Center Search */}
        <div className="flex-1 max-w-2xl mx-4 hidden md:block">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder={t('nav.search')}
              className="h-10 w-full bg-background border border-transparent pl-10 pr-4 rounded-full text-sm focus:outline-none focus:border-primary/50 focus:bg-card text-foreground placeholder:text-muted-foreground transition-colors"
            />
          </div>
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-2">
          <Link to="/profile" className="hidden sm:flex items-center gap-2 rounded-full hover:bg-muted py-1 pl-1 pr-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium hidden md:inline text-foreground">{t('nav.yourProfile')}</span>
          </Link>
          
          <div className="flex items-center gap-0.5 sm:gap-1">
            <PostCreationDialog
              trigger={
                <Button
                  size="sm"
                  className="rounded-full gap-1.5 hidden sm:inline-flex mr-1"
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
              className="rounded-full text-muted-foreground hover:text-foreground"
              onClick={toggleTheme}
              aria-label="Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full text-muted-foreground hover:text-foreground"
              asChild
            >
              <Link to="/friends" aria-label="Friends">
                <Users className="h-5 w-5" />
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full text-muted-foreground hover:text-foreground"
              asChild
            >
              <Link to="/messages" aria-label="Messages">
                <MessageSquare className="h-5 w-5" />
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full text-muted-foreground hover:text-foreground"
              asChild
            >
              <Link to="/messages" aria-label="Notifications">
                <Bell className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
