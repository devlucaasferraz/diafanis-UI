import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/shared/cn';
import './brand-button.css';

export interface BrandButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  fullWidth?: boolean;
  shape?: 'pill' | 'rectangular';
  surface?: 'solid' | 'glass' | 'transparent';
}

export const BrandButton = forwardRef<HTMLButtonElement, BrandButtonProps>(
  ({ asChild = false, fullWidth = false, shape = 'pill', surface = 'solid', className, type = 'button', ...props }, ref) => {
    const Component = asChild ? Slot : 'button';
    return <Component {...props} data-shape={shape} data-surface={surface} {...(!asChild ? { type } : {})} ref={ref} className={cn('brand-button', fullWidth && 'brand-button--full', className)} />;
  }
);
BrandButton.displayName = 'BrandButton';
