import React from 'react';

interface PixelBadgeProps {
  label: string;
  status?: 'idle' | 'thinking' | 'working' | 'waiting' | 'blocked' | 'success';
  variant?: 'coral' | 'mint' | 'sky' | 'lemon' | 'lilac' | 'peach' | 'neutral';
  pulse?: boolean;
  className?: string;
}

export const PixelBadge: React.FC<PixelBadgeProps> = ({
  label,
  status,
  variant,
  pulse = false,
  className = '',
}) => {
  const getColor = () => {
    if (status) {
      switch (status) {
        case 'thinking':
          return { bg: '#4ECDC4', text: '#1A1320', dot: '#4ECDC4' };
        case 'working':
          return { bg: '#FFD93D', text: '#1A1320', dot: '#FFD93D' };
        case 'blocked':
          return { bg: '#FF6B6B', text: '#FFFDF5', dot: '#FF6B6B' };
        case 'success':
          return { bg: '#6BCF7F', text: '#1A1320', dot: '#6BCF7F' };
        case 'waiting':
          return { bg: '#6C8EF5', text: '#FFFDF5', dot: '#6C8EF5' };
        default:
          return { bg: '#F4E9C7', text: '#3D2E4A', dot: '#A899B5' };
      }
    }

    switch (variant) {
      case 'coral':
        return { bg: '#FFB4B4', text: '#1A1320', dot: '#FF6B6B' };
      case 'mint':
        return { bg: '#B4E5BD', text: '#1A1320', dot: '#6BCF7F' };
      case 'sky':
        return { bg: '#A8E6E0', text: '#1A1320', dot: '#4ECDC4' };
      case 'lemon':
        return { bg: '#FFEC99', text: '#1A1320', dot: '#FFD93D' };
      case 'lilac':
        return { bg: '#D6C5FF', text: '#1A1320', dot: '#B197FC' };
      case 'peach':
        return { bg: '#FFD0B5', text: '#1A1320', dot: '#FFA07A' };
      default:
        return { bg: '#F4E9C7', text: '#1A1320', dot: '#3D2E4A' };
    }
  };

  const style = getColor();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 border border-[#1A1320] font-display text-[8px] uppercase select-none ${className}`}
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-none border border-[#1A1320] ${pulse ? 'animate-ping' : ''}`}
        style={{ backgroundColor: style.dot }}
      />
      {label}
    </span>
  );
};
