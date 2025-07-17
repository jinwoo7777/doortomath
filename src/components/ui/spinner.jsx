import React from 'react';
import { cn } from '@/lib/utils';

const Spinner = ({ 
  size = 'md', 
  className, 
  showText = false, 
  text = '로딩 중...',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const variantClasses = {
    default: 'border-primary',
    muted: 'border-muted-foreground',
    white: 'border-white'
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "animate-spin rounded-full border-2 border-transparent",
        sizeClasses[size],
        variantClasses[variant],
        "border-t-current"
      )} />
      {showText && (
        <span className="text-sm text-muted-foreground">{text}</span>
      )}
    </div>
  );
};

const LoadingSpinner = ({ 
  size = 'lg',
  text = '로딩 중...',
  className 
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center py-8", className)}>
      <Spinner size={size} />
      <p className="mt-3 text-sm text-muted-foreground">{text}</p>
    </div>
  );
};

const InlineSpinner = ({ 
  size = 'sm',
  className 
}) => {
  return (
    <Spinner 
      size={size} 
      className={cn("inline-flex", className)}
    />
  );
};

export { Spinner, LoadingSpinner, InlineSpinner };