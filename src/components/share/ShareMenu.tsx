import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Facebook, Send, MessageCircle, Link2, Twitter, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  url: string;
  title?: string;
  children: React.ReactNode;
}

const ShareMenu: React.FC<Props> = ({ url, title = '', children }) => {
  const enc = encodeURIComponent;
  const u = enc(url);
  const t = enc(title);

  const links = [
    { name: 'Facebook', icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { name: 'VK', icon: Send, href: `https://vk.com/share.php?url=${u}&title=${t}` },
    { name: 'Telegram', icon: Send, href: `https://t.me/share/url?url=${u}&text=${t}` },
    { name: 'WhatsApp', icon: MessageCircle, href: `https://api.whatsapp.com/send?text=${t}%20${u}` },
    { name: 'Twitter/X', icon: Twitter, href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    { name: 'Email', icon: Mail, href: `mailto:?subject=${t}&body=${u}` },
  ];

  const tryNative = async (e: React.MouseEvent) => {
    if (navigator.share) {
      e.preventDefault();
      try { await navigator.share({ url, title }); } catch {}
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={tryNative}>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-[100]">
        {links.map(l => (
          <DropdownMenuItem key={l.name} asChild>
            <a href={l.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <l.icon className="h-4 w-4" /> {l.name}
            </a>
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(url); toast.success('Lien copié !'); }}>
          <Link2 className="h-4 w-4 mr-2" /> Copier le lien
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareMenu;
