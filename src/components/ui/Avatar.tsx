import React from 'react';
interface AvatarProps {
  src?: string;
  alt?: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  status?: 'online' | 'offline' | 'busy';
}
export function Avatar({
  src,
  alt,
  fallback,
  size = 'md',
  className = '',
  status
}: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-xl'
  };
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-500',
    busy: 'bg-red-500'
  };
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <div
        className={`${className.includes('w-') ? 'w-full h-full' : sizes[size]} rounded-full overflow-hidden bg-theme-subtle border border-[#D4AF37]/20 flex items-center justify-center`}>

        {src ?
          <img
            src={src}
            alt={alt || fallback}
            className="w-full h-full object-cover" /> :
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Islamic 8-pointed star placeholder background */}
            <svg viewBox="0 0 100 100" fill="currentColor" className="absolute inset-0 w-full h-full text-[#D4AF37] opacity-20 p-1">
              <path d="M50 0 L61.8 38.2 L100 50 L61.8 61.8 L50 100 L38.2 61.8 L0 50 L38.2 38.2 Z" />
              <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span className="font-medium text-[#D4AF37] leading-none text-center relative z-10">
              {fallback}
            </span>
          </div>
        }
      </div>
      {status &&
        <span
          className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ${statusColors[status]}`}
          style={{ borderColor: 'var(--theme-bg)' }} />

      }
    </div>);

}