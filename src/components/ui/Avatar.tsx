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
    <div className={`relative inline-block ${className}`}>
      <div
        className={`${sizes[size]} rounded-full overflow-hidden bg-[#1a1a4a] border border-[#D4AF37]/20 flex items-center justify-center`}>

        {src ?
        <img
          src={src}
          alt={alt || fallback}
          className="w-full h-full object-cover" /> :


        <span className="font-medium text-[#D4AF37]">{fallback}</span>
        }
      </div>
      {status &&
      <span
        className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-[#0A1A3A] ${statusColors[status]}`} />

      }
    </div>);

}