import React from 'react';
import { cn } from '../../lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
  text?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  className,
  fullScreen = false,
  text,
}) => {
  const loadingComponent = (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div
        className={cn('animate-spin rounded-full border-t-transparent', {
          'h-5 w-5 border-2': size === 'sm',
          'h-8 w-8 border-2': size === 'md',
          'h-12 w-12 border-4': size === 'lg',
        }, 'border-red-600 dark:border-red-500')}
      />
      {text && <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-900/20 dark:bg-slate-900/50 backdrop-blur-sm z-50">
        {loadingComponent}
      </div>
    );
  }

  return loadingComponent;
};