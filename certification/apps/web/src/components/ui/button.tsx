import type { ComponentProps } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'app-button inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'app-button-primary bg-brand-navy text-white hover:bg-brand-deep',
        gold: 'border border-brand-gold bg-brand-gold text-brand-deep shadow-md hover:border-[#e4c558] hover:bg-[#e4c558]',
        outline: 'border border-paper-line-strong bg-white text-slate-900 hover:bg-paper-muted',
        ghost: 'text-slate-700 hover:bg-paper-muted',
      },
      size: {
        default: 'min-h-10 px-4 py-2',
        sm: 'min-h-8 px-3 py-1.5 text-xs',
        lg: 'min-h-12 px-6 py-3 text-base',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

type ButtonProps = ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ asChild = false, className, size, variant, ...props }: ButtonProps) {
  const Component = asChild ? Slot : 'button';
  return <Component className={cn(buttonVariants({ className, size, variant }))} {...props} />;
}
