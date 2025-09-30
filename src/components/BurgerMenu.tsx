import React from 'react';
import { Link } from 'react-router-dom';
import {
  Home, Compass, MessagesSquare, Bell, MapPin, Users, GraduationCap,
  Radio, Newspaper, Calendar, User, FileText, Building, Briefcase, PanelRight
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const BurgerMenu: React.FC = () => {
  const [open, setOpen] = React.useState(false);

  const menuSections = [
    {
      title: 'Main',
      items: [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Compass, label: 'Discover', path: '/categories' },
        { icon: MessagesSquare, label: 'Messages', path: '/messages' },
        { icon: Bell, label: 'Notifications', path: '/notifications' },
      ],
    },
    {
      title: 'Communities & Content',
      items: [
        { icon: MapPin, label: 'Talents Around Me', path: '/talents-around-me' },
        { icon: Users, label: 'Sports Categories', path: '/sports-categories' },
        { icon: GraduationCap, label: 'Learning Hub', path: '/learning' },
        { icon: Radio, label: 'Live Events', path: '/live' },
        { icon: Newspaper, label: 'News & Updates', path: '/news' },
        { icon: Calendar, label: 'Upcoming Events', path: '/events' },
      ],
    },
    {
      title: 'Your Talent Profile',
      items: [
        { icon: User, label: 'My Profile', path: '/profile' },
        { icon: FileText, label: 'My Resumes', path: '/profile?tab=resumes', badge: 'New' },
        { icon: Building, label: 'Organizations', path: '/organizations' },
        { icon: Users, label: 'Communities', path: '/communities' },
      ],
    },
    {
      title: 'Connect',
      items: [
        { icon: Users, label: 'Talent Community', path: '/participants' },
        { icon: Briefcase, label: 'Work Opportunities', path: '/work', badge: 'New' },
        { icon: PanelRight, label: 'YAT TV', path: '/online-tv' },
      ],
    },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="rounded-full hover:bg-white/10"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="text-xl font-bold">Menu</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-6 space-y-8">
            {menuSections.map((section) => (
              <div key={section.title} className="space-y-3">
                <h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors group"
                    >
                      <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      <span className="text-sm font-medium flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default BurgerMenu;
