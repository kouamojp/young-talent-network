import { LucideIcon } from 'lucide-react';

export interface MenuSectionItem {
  icon: LucideIcon;
  label: string;
  path: string;
  description: string;
  url?: string;
  badge?: string;
  badgeColor?: string;
  iconColor?: string;
}
