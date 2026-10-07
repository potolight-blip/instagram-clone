import React from 'react';

interface AvatarProps {
  src: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  hasStory?: boolean;
  hasUnseenStory?: boolean;
  className?: string;
  onClick?: () => void;
}

const sizeMap = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-11 h-11',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
  '2xl': 'w-36 h-36',
};

const ringPaddingMap = {
  xs: 'p-[1.5px]',
  sm: 'p-[2px]',
  md: 'p-[2px]',
  lg: 'p-[2.5px]',
  xl: 'p-[3px]',
  '2xl': 'p-[4px]',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'avatar',
  size = 'md',
  hasStory = false,
  hasUnseenStory = true,
  className = '',
  onClick,
}) => {
  const avatarImage = (
    <img
      src={src}
      alt={alt}
      className={`rounded-full object-cover select-none bg-neutral-900 border border-black/40 ${sizeMap[size]}`}
      onError={(e) => {
        // Fallback placeholder if image fails
        (e.target as HTMLImageElement).src =
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
      }}
    />
  );

  if (!hasStory) {
    return (
      <div
        onClick={onClick}
        className={`inline-block flex-shrink-0 cursor-pointer ${className}`}
      >
        {avatarImage}
      </div>
    );
  }

  const ringClass = hasUnseenStory
    ? 'story-ring-unseen'
    : 'story-ring-seen';

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center justify-center cursor-pointer transition-transform duration-150 active:scale-95 ${ringClass} ${ringPaddingMap[size]} ${className}`}
    >
      <div className="rounded-full p-[2px] bg-black">
        {avatarImage}
      </div>
    </div>
  );
};
