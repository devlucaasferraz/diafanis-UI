import * as React from 'react';
import { cn } from '@/shared/cn';
import { BrandMark } from './brand-mark';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  collapsed?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  collapsed = false,
  className,
}) => {
  const sizeMap = {
    sm: { icon: 'h-6 w-6', text: 'text-sm', dot: 'h-1.5 w-1.5' },
    md: { icon: 'h-8 w-8', text: 'text-lg', dot: 'h-2 w-2' },
    lg: { icon: 'h-10 w-10', text: 'text-xl', dot: 'h-2.5 w-2.5' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={cn('flex items-center gap-2.5 select-none', className)}>
      <BrandMark className={cn('shrink-0', currentSize.icon)} />

      {/* Brand Wordmark */}
      {!collapsed && (
        <span
          className={cn(
            'font-headline font-bold tracking-tight text-foreground truncate',
            currentSize.text
          )}
        >
          Diafanís
        </span>
      )}
    </div>
  );
};
