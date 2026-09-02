import React from 'react';

interface PixelPanelProps {
  children: React.ReactNode;
  title?: string;
  badge?: string;
  variant?: 'default' | 'inset' | 'active' | 'terminal' | 'dialog';
  accent?: 'coral' | 'mint' | 'sky' | 'lemon' | 'lilac' | 'peach';
  className?: string;
  headerAction?: React.ReactNode;
}

export const PixelPanel: React.FC<PixelPanelProps> = ({
  children,
  title,
  badge,
  variant = 'default',
  accent,
  className = '',
  headerAction,
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'inset':
        return 'pixel-panel-inset';
      case 'active':
        return 'pixel-panel-active';
      case 'terminal':
        return 'pixel-panel-terminal';
      case 'dialog':
        return 'pixel-panel-dialog';
      default:
        return 'pixel-panel';
    }
  };

  const getAccentColor = () => {
    switch (accent) {
      case 'coral':
        return '#FF6B6B';
      case 'mint':
        return '#6BCF7F';
      case 'sky':
        return '#4ECDC4';
      case 'lemon':
        return '#FFD93D';
      case 'lilac':
        return '#B197FC';
      case 'peach':
        return '#FFA07A';
      default:
        return undefined;
    }
  };

  return (
    <div
      className={`relative flex flex-col ${getVariantClass()} ${className}`}
      style={accent ? { borderTopColor: getAccentColor() } : undefined}
    >
      {title && (
        <div className="flex items-center justify-between px-3 py-2 border-b-2 border-[#1A1320] bg-[#FFFDF5] select-none">
          <div className="flex items-center gap-2">
            {accent && (
              <span
                className="w-2.5 h-2.5 border border-[#1A1320]"
                style={{ backgroundColor: getAccentColor() }}
              />
            )}
            <h3 className="font-display text-[10px] text-[#1A1320] tracking-tight">{title}</h3>
            {badge && (
              <span className="font-display text-[8px] px-1.5 py-0.5 bg-[#F4E9C7] text-[#3D2E4A] border border-[#1A1320]">
                {badge}
              </span>
            )}
          </div>
          {headerAction && <div className="flex items-center gap-1.5">{headerAction}</div>}
        </div>
      )}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
};
