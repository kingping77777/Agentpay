import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { OfficeScene } from '../phaser/OfficeScene';
import { PixelBadge } from './pixel/PixelBadge';
import { Maximize2, Minimize2 } from 'lucide-react';

interface PhaserOfficeProps {
  currentAgent: string;
  lastMessage: string;
  isFullFrame?: boolean;
  onToggleFullFrame?: () => void;
}

export const PhaserOffice: React.FC<PhaserOfficeProps> = ({
  currentAgent,
  lastMessage,
  isFullFrame = false,
  onToggleFullFrame,
}) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameContainerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameContainerRef.current,
      width: '100%',
      height: '100%',
      backgroundColor: '#E5C896',
      physics: {
        default: 'arcade',
      },
      scene: [OfficeScene],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  // Trigger speech bubbles & envelope events when messages change
  useEffect(() => {
    if (gameRef.current && lastMessage) {
      gameRef.current.events.emit('agent-speak', {
        agent: currentAgent,
        text: lastMessage,
      });

      if (currentAgent === 'SALES_AGENT' || currentAgent === 'MERCHANT_AGENT') {
        gameRef.current.events.emit('agent-message-flying', {
          from: currentAgent,
          to: currentAgent === 'SALES_AGENT' ? 'MERCHANT_AGENT' : 'SALES_AGENT',
        });
      }
    }
  }, [lastMessage, currentAgent]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#E5C896] border-r-2 border-[#1A1320]">
      {/* Top Left HUD Label */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none">
        <span className="bg-[#FFFDF5] text-[#1A1320] font-display text-[9px] px-2.5 py-1 border-2 border-[#1A1320] shadow-[2px_2px_0_rgba(26,19,32,0.3)]">
          🏢 2D OFFICE FLOOR
        </span>
        <PixelBadge label="60 FPS" status="success" />
      </div>

      {/* Top Right Full-Frame Toggle Button */}
      {onToggleFullFrame && (
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={onToggleFullFrame}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FFFDF5] hover:bg-[#FFF8E7] text-[#1A1320] font-display text-[8px] border-2 border-[#1A1320] shadow-[2px_2px_0_rgba(26,19,32,0.3)] transition-all cursor-pointer active:translate-y-[1px]"
            title={isFullFrame ? 'Restore Split View' : 'Maximize 2D Office'}
          >
            {isFullFrame ? (
              <>
                <Minimize2 className="w-3 h-3 text-[#FF6B6B]" />
                <span>RESTORE SPLIT</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3 h-3 text-[#4ECDC4]" />
                <span>⛶ FULL FRAME</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Phaser Canvas Container */}
      <div ref={gameContainerRef} className="w-full h-full" />
    </div>
  );
};
