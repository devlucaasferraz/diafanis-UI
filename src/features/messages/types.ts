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

export type NotificationPriority = 'fatal' | 'in_progress' | 'hearing';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  processNumber?: string;
  assignedLawyer: string;
  deadline: string;
  priority: NotificationPriority;
  isRead: boolean;
  createdAt: string;
}
