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

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  processNumber?: string;
  assignedLawyer: string;
  deadline: string;
  isFatal?: boolean;
  isRead: boolean;
  createdAt: string;
}

