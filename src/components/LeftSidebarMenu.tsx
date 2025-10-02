import React from 'react';
import { Link } from 'react-router-dom';
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
import { mainNavigationItems, contentItems, profileItems, connectItems } from './sidebar/sidebarData';

const LeftSidebarMenu: React.FC = () => {
  const [open, setOpen] = React.useState(false);

  const menuSections = [
    { title: 'Main', items: mainNavigationItems },
    { title: 'Communities & Content', items: contentItems },
    { title: 'Your Talent Profile', items: profileItems },
    { title: 'Connect', items: connectItems },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="rounded-full hover:bg-accent"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0 bg-gray-50">
        <SheetHeader className="p-6 pb-4 border-b border-gray-200">
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
                  {section.items.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-200 transition-colors group"
                      >
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 group-hover:bg-gray-300">
                          <ItemIcon className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">{item.label}</span>
                            {item.badge && (
                              <span className="bg-primary text-background text-xs px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 truncate block">{item.description}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default LeftSidebarMenu;
