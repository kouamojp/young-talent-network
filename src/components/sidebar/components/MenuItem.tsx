
import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface MenuItemProps {
  icon: LucideIcon;
  label: string;
  description: string;
  path: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon: Icon, label, description, path }) => {
  return (
    <li>
      <Link 
        to={path}
        className="flex flex-col gap-1 p-3 rounded-lg hover:bg-[#F0F2F5] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-[#E4E6EB]">
            <Icon className="h-5 w-5 text-[#65676B]" />
          </div>
          <span className="font-medium text-[#050505]">{label}</span>
        </div>
        {description && (
          <span className="text-xs text-[#65676B] pl-12">{description}</span>
        )}
      </Link>
    </li>
  );
};

export default MenuItem;
