
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MenuSectionItem } from '@/components/sidebar/types';

interface SidebarMenuLinkProps {
  item: MenuSectionItem;
  isCollapsed?: boolean;
  className?: string;
}

const SidebarMenuLink: React.FC<SidebarMenuLinkProps> = ({
  item,
  isCollapsed = false,
  className,
}) => {
  const Icon = item.icon;

  const linkContent = (
    <div className="flex items-center">
      {Icon && <Icon className="h-5 w-5 shrink-0" />}
      {!isCollapsed && (
        <span className="ml-2 truncate">
          {item.label}
          {item.badge && (
            <span 
              className={cn(
                "ml-2 rounded-full px-1.5 text-xs font-medium", 
                item.badgeColor || "bg-blue-100 text-blue-800"
              )}
            >
              {item.badge}
            </span>
          )}
        </span>
      )}
    </div>
  );

  if (item.url) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex h-9 items-center rounded-md px-3 text-sm font-medium hover:bg-gray-100",
          className
        )}
      >
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div>{linkContent}</div>
            </TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        ) : (
          linkContent
        )}
      </a>
    );
  }

  return (
    <Link
      to={item.path}
      className={cn(
        "flex h-9 items-center rounded-md px-3 text-sm font-medium hover:bg-gray-100",
        className
      )}
    >
      {isCollapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div>{linkContent}</div>
          </TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      ) : (
        linkContent
      )}
    </Link>
  );
};

export default SidebarMenuLink;
