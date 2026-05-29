import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Users, Search, Plus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link } from 'react-router-dom';

// Sample data
const contacts = [
  { id: '1', name: 'Sarah Johnson', avatar: '/placeholder.svg', status: 'online' },
  { id: '2', name: 'Mike Peterson', avatar: '/placeholder.svg', status: 'online' },
  { id: '3', name: 'Emma Williams', avatar: '/placeholder.svg', status: 'offline' },
  { id: '4', name: 'David Lee', avatar: '/placeholder.svg', status: 'online' },
  { id: '5', name: 'Lisa Brown', avatar: '/placeholder.svg', status: 'online' },
  { id: '6', name: 'Alex Richards', avatar: '/placeholder.svg', status: 'offline' },
];

const birthdays = [
  { id: '1', name: 'James Wilson', date: 'Today' },
];

const RightSidebarMenu: React.FC = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="rounded-full hover:bg-accent"
        >
          <Users className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 p-0 bg-background">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="text-xl font-bold">Contacts</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-6 space-y-6">
            {/* Sponsored */}
            <div>
              <h3 className="font-medium text-muted-foreground mb-3 text-sm">Sponsored</h3>
              <div className="rounded-lg overflow-hidden border">
                <img 
                  src="/placeholder.svg" 
                  alt="Advertisement" 
                  className="w-full h-32 object-cover"
                />
                <div className="p-3">
                  <h4 className="text-sm font-medium">Music lessons for beginners</h4>
                  <p className="text-xs text-muted-foreground">musiclessons.com</p>
                </div>
              </div>
            </div>
            
            {/* Birthdays */}
            <div>
              <h3 className="font-medium text-muted-foreground mb-3 text-sm">Birthdays</h3>
              {birthdays.map(person => (
                <div key={person.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-accent transition-colors">
                  <div className="flex-shrink-0 text-2xl">🎂</div>
                  <p className="text-sm">
                    <span className="font-medium">{person.name}</span>
                    <span className="text-muted-foreground">'s birthday is {person.date}</span>
                  </p>
                </div>
              ))}
            </div>
            
            {/* Contacts */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-muted-foreground text-sm">Contacts</h3>
                <div className="flex gap-1">
                  <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setOpen(false)}>
                    <Link to="/friends" aria-label="Rechercher des amis">
                      <Search className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setOpen(false)}>
                    <Link to="/friends?tab=requests" aria-label="Ajouter un ami">
                      <Plus className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                {contacts.map(contact => (
                  <Link
                    key={contact.id}
                    to={`/messages?to=${contact.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                  >
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={contact.avatar} alt={contact.name} />
                        <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span 
                        className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ${
                          contact.status === 'online' ? 'bg-green-500' : 'bg-gray-300'
                        } border-2 border-background`}
                      />
                    </div>
                    <span className="text-sm font-medium">{contact.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default RightSidebarMenu;
