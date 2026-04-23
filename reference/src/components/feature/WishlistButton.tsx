import { useState, useEffect } from 'react';
import { toggleWishlist, isInWishlist, WISHLIST_EVENT } from '../../utils/wishlist';

interface WishlistButtonProps {
  productId: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'icon-border';
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export default function WishlistButton({
  productId,
  size = 'md',
  variant = 'icon-border',
  className = '',
  onClick,
}: WishlistButtonProps) {
  const [inWishlist, setInWishlist] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setInWishlist(isInWishlist(productId));
    const handler = () => setInWishlist(isInWishlist(productId));
    window.addEventListener(WISHLIST_EVENT, handler);
    return () => window.removeEventListener(WISHLIST_EVENT, handler);
  }, [productId]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) onClick(e);
    const added = toggleWishlist(productId);
    setInWishlist(!inWishlist);
    if (added) {
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    }
  };

  const sizeClasses = {
    sm: 'w-7 h-7 text-sm',
    md: 'w-9 h-9 text-base',
    lg: 'w-11 h-11 text-lg',
  };

  const iconSize = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <button
      onClick={handleClick}
      title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
      className={`flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer ${sizeClasses[size]} ${
        variant === 'icon-border'
          ? `border ${inWishlist ? 'bg-red-50 border-red-300 text-red-500' : 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-400 bg-white'}`
          : `${inWishlist ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`
      } ${pulse ? 'scale-125' : 'scale-100'} ${className}`}
    >
      <i className={`${inWishlist ? 'ri-heart-fill' : 'ri-heart-line'} ${iconSize[size]}`}></i>
    </button>
  );
}
