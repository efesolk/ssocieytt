import React from 'react';
import { cn } from '../../lib/utils';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  className,
  onClick,
}) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800',
        {
          'h-6 w-6': size === 'xs',
          'h-8 w-8': size === 'sm',
          'h-10 w-10': size === 'md',
          'h-12 w-12': size === 'lg',
          'h-16 w-16': size === 'xl',
        },
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <img
        src={src || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
        alt={alt}
        className="h-full w-full object-cover"
        onError={(e) => {
          // Fallback to default avatar if image fails to load
          (e.target as HTMLImageElement).src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
        }}
      />
    </div>
  );
};