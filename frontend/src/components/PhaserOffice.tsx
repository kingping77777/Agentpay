import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { OfficeScene } from '../phaser/OfficeScene';

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
      width: gameContainerRef.current.clientWidth || 520,
      height: gameContainerRef.current.clientHeight || 480,
      backgroundColor: '#769b8b',
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

  // Trigger speech bubbles when messages change
  useEffect(() => {
    if (gameRef.current && lastMessage) {
      gameRef.current.events.emit('agent-speak', {
        agent: currentAgent,
        text: lastMessage,
      });
    }
  }, [lastMessage, currentAgent]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#769b8b]">
      <div ref={gameContainerRef} className="w-full h-full" />
    </div>
  );
};
