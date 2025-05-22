
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MenuSectionItem } from '@/components/sidebar/types';
import { LucideIcon } from 'lucide-react';

interface SidebarMenuLinkProps {
  item?: MenuSectionItem;
  icon?: LucideIcon;
  label?: string;
  path?: string;
  description?: string;
  url?: string;
  badge?: string;
  badgeColor?: string;
  isCollapsed?: boolean;
  className?: string;
}

const SidebarMenuLink: React.FC<SidebarMenuLinkProps> = ({
  item,
  icon: IconProp,
  label,
  path,
  description,
  url,
  badge,
  badgeColor,
  isCollapsed = false,
  className,
}) => {
  // Use either the item properties or the direct props
  const Icon = item?.icon || IconProp;
  const linkLabel = item?.label || label || '';
  const linkPath = item?.path || path || '/';
  const linkUrl = item?.url || url;
  const linkBadge = item?.badge || badge;
  const linkBadgeColor = item?.badgeColor || badgeColor || "bg-blue-100 text-blue-800";

  // If we don't have an icon, return null to prevent the error
  if (!Icon) {
    console.error('Icon is required for SidebarMenuLink');
    return null;
  }

  const linkContent = (
    <div className="flex items-center">
      <Icon className="h-5 w-5 shrink-0" />
      {!isCollapsed && (
        <span className="ml-2 truncate">
          {linkLabel}
          {linkBadge && (
            <span 
              className={cn(
                "ml-2 rounded-full px-1.5 text-xs font-medium", 
                linkBadgeColor
              )}
            >
              {linkBadge}
            </span>
          )}
        </span>
      )}
    </div>
  );

  if (linkUrl) {
    return (
      <a
        href={linkUrl}
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
            <TooltipContent side="right">{linkLabel}</TooltipContent>
          </Tooltip>
        ) : (
          linkContent
        )}
      </a>
    );
  }

  return (
    <Link
      to={linkPath}
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
          <TooltipContent side="right">{linkLabel}</TooltipContent>
        </Tooltip>
      ) : (
        linkContent
      )}
    </Link>
  );
};

export default SidebarMenuLink;
