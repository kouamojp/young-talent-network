
import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface SidebarMenuLinkProps {
  icon: LucideIcon;
  label: string;
  description: string;
  path: string;
  url?: string; // For external links
}

const SidebarMenuLink: React.FC<SidebarMenuLinkProps> = ({ 
  icon: Icon, 
  label, 
  description, 
  path, 
  url 
}) => {
  // Check if this is an external link (like social media)
  const isExternal = !!url;
  
  const content = (
    <>
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200">
          <Icon className="h-4 w-4 text-gray-600" />
        </div>
        <div className="flex flex-col">
          <span className="font-medium">{label}</span>
          <span className="text-xs text-gray-500">{description}</span>
        </div>
      </div>
    </>
  );
  
  if (isExternal) {
    return (
      <a 
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center p-2 rounded-lg hover:bg-gray-200 transition-colors w-full"
      >
        {content}
      </a>
    );
  }
  
  return (
    <Link to={path} className="flex items-center p-2 rounded-lg hover:bg-gray-200 transition-colors w-full">
      {content}
    </Link>
  );
};

export default SidebarMenuLink;
