
import { LucideIcon } from 'lucide-react';

export interface MenuSectionItem {
  icon: LucideIcon;
  label: string;
  path: string;
  description: string;
  url?: string; // For external links
}
