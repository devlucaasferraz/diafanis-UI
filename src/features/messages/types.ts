import type { LucideIcon } from 'lucide-react';

export type MessageTabId = 'notifications' | 'messages' | 'templates';

export interface TabOption {
  id: MessageTabId;
  label: string;
  shortLabel?: string;
  icon?: LucideIcon;
  description?: string;
  hasUrgency?: boolean;
  urgentCount?: number;
}
