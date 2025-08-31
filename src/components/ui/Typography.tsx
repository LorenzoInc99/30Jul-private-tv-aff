import React from 'react';
import { cn } from '../../lib/utils';

// Heading component with brand typography
interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function Heading({ 
  level = 1, 
  children, 
  className,
  as,
  ...props 
}: HeadingProps) {
  const Component = as || `h${level}`;
  
  const baseClasses = 'font-secondary font-bold text-neutral-900 dark:text-white';
  
  const sizeClasses = {
    1: 'text-4xl md:text-5xl lg:text-6xl font-black tracking-tight',
    2: 'text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight',
    3: 'text-2xl md:text-3xl lg:text-4xl font-bold',
    4: 'text-xl md:text-2xl lg:text-3xl font-semibold',
    5: 'text-lg md:text-xl lg:text-2xl font-semibold',
    6: 'text-base md:text-lg lg:text-xl font-semibold'
  };
  
  return (
    <Component 
      className={cn(baseClasses, sizeClasses[level], className)}
      {...props}
    >
      {children}
    </Component>
  );
}

// Text component with brand typography
interface TextProps {
  variant?: 'body' | 'lead' | 'small' | 'caption' | 'mono';
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function Text({ 
  variant = 'body', 
  children, 
  className,
  as = 'p',
  ...props 
}: TextProps) {
  const Component = as;
  
  const baseClasses = 'font-primary text-neutral-700 dark:text-neutral-300';
  
  const variantClasses = {
    body: 'text-base leading-relaxed',
    lead: 'text-lg leading-relaxed font-medium',
    small: 'text-sm leading-normal',
    caption: 'text-xs leading-normal text-neutral-500 dark:text-neutral-400',
    mono: 'font-mono text-sm leading-normal'
  };
  
  return (
    <Component 
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    >
      {children}
    </Component>
  );
}

// Label component for form elements
interface LabelProps {
  children: React.ReactNode;
  className?: string;
  required?: boolean;
  htmlFor?: string;
}

export function Label({ 
  children, 
  className,
  required = false,
  htmlFor,
  ...props 
}: LabelProps) {
  return (
    <label 
      htmlFor={htmlFor}
      className={cn(
        'font-primary text-sm font-medium text-neutral-700 dark:text-neutral-300',
        'block mb-2',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-error-500 ml-1">*</span>}
    </label>
  );
}

// Brand-specific text utilities
export function BrandText({ 
  variant = 'primary',
  children,
  className,
  ...props 
}: {
  variant?: 'primary' | 'secondary' | 'accent';
  children: React.ReactNode;
  className?: string;
}) {
  const variantClasses = {
    primary: 'text-primary-500 dark:text-primary-400',
    secondary: 'text-secondary-500 dark:text-secondary-400',
    accent: 'text-accent-500 dark:text-accent-400'
  };
  
  return (
    <span 
      className={cn(
        'font-primary font-medium',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// Export all typography components
export const Typography = {
  Heading,
  Text,
  Label,
  BrandText
};
