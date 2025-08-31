import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'brand';
  children: React.ReactNode;
}

export function Card({ 
  variant = 'default', 
  className, 
  children, 
  ...props 
}: CardProps) {
  const baseClasses = 'rounded-xl border transition-all duration-200';
  
  const variantClasses = {
    default: 'bg-white border-neutral-200 shadow-sm dark:bg-neutral-900 dark:border-neutral-700',
    elevated: 'bg-white border-transparent shadow-lg hover:shadow-xl dark:bg-neutral-900',
    outlined: 'bg-transparent border-neutral-300 dark:border-neutral-600',
    brand: 'bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200 shadow-md dark:from-primary-950 dark:to-secondary-950 dark:border-primary-800'
  };
  
  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export function CardTitle({ className, children, ...props }: CardTitleProps) {
  return (
    <h3
      className={cn('font-secondary text-2xl font-semibold leading-none tracking-tight text-neutral-900 dark:text-white', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function CardDescription({ className, children, ...props }: CardDescriptionProps) {
  return (
    <p
      className={cn('font-primary text-sm text-neutral-600 dark:text-neutral-400', className)}
      {...props}
    >
      {children}
    </p>
  );
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div className={cn('p-6 pt-0', className)} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  );
}

// Export all card components
export const CardComponents = {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
}; 