import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { OfficeScene } from '../phaser/OfficeScene';
import { PixelBadge } from './pixel/PixelBadge';

interface PhaserOfficeProps {
  currentAgent: string;
  lastMessage: string;
}

export const PhaserOffice: React.FC<PhaserOfficeProps> = ({ currentAgent, lastMessage }) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameContainerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameContainerRef.current,
      width: 540,
      height: 480,
      backgroundColor: '#E5C896',
      physics: {
        default: 'arcade',
      },
      scene: [OfficeScene],
      scale: {
        mode: Phaser.Scale.FIT,
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

      {/* Phaser Canvas */}
      <div ref={gameContainerRef} className="w-full h-full" />
    </div>
  );
};
