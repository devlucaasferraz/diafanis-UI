import * as React from 'react';
import { cn } from '@/shared/cn';

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  intensity?: 'subtle' | 'standard' | 'high';
}

export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ children, className, intensity = 'standard', ...props }, ref) => {
    const intensityClasses = {
      subtle: 'bg-card/70 backdrop-blur-md border-border/50',
      standard: 'bg-card/90 backdrop-blur-xl border-border/70 shadow-sm dark:shadow-md dark:shadow-black/25',
      high: 'bg-card/98 backdrop-blur-2xl border-border/80 shadow-md dark:shadow-lg dark:shadow-black/40',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl border transition-all duration-200',
          intensityClasses[intensity],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassPanel.displayName = 'GlassPanel';
