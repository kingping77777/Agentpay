import React from 'react';

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'mint' | 'lemon' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const PixelButton: React.FC<PixelButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'secondary':
        return 'pixel-btn-secondary';
      case 'mint':
        return 'pixel-btn-mint';
      case 'lemon':
        return 'pixel-btn-lemon';
      case 'destructive':
        return 'pixel-btn-destructive';
      default:
        return 'pixel-btn-primary';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-[8px]';
      case 'lg':
        return 'px-4 py-3 text-[11px]';
      default:
        return 'px-3 py-2 text-[9px]';
    }
  };

  return (
    <button
      className={`pixel-btn ${getVariantClass()} ${getSizeClass()} ${disabled ? 'opacity-50 cursor-not-allowed transform-none' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="mr-1.5 inline-flex items-center">{icon}</span>}
      {children}
    </button>
  );
};
