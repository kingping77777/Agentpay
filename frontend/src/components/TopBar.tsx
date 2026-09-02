import React, { useState } from 'react';
import { PixelButton } from './pixel/PixelButton';
import { PixelBadge } from './pixel/PixelBadge';
import { Copy, Check, Terminal, History, Cpu } from 'lucide-react';

interface TopBarProps {
  sessionId: string;
  onMemoryReplay: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ sessionId, onMemoryReplay }) => {
  const [copied, setCopied] = useState(false);

  const handleCopySession = () => {
    if (!sessionId) return;
    navigator.clipboard.writeText(sessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="h-14 px-4 bg-[#FFF8E7] border-b-2 border-[#1A1320] flex items-center justify-between select-none shadow-[inset_0_-2px_0_#F4E9C7]">
      {/* 1. Logo & App Title */}
      <div className="flex items-center gap-3">
        {/* Retro Cartridge / Floppy Icon */}
        <div className="w-8 h-8 bg-[#1A1320] border-2 border-[#1A1320] flex items-center justify-center shadow-[inset_1px_1px_0_#6B5878,2px_2px_0_rgba(26,19,32,0.3)]">
          <Terminal className="w-4 h-4 text-[#4ECDC4]" />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-[11px] text-[#1A1320] tracking-tight">
              MUNDER DIFFLIN
            </h1>
            <span className="font-display text-[8px] px-1.5 py-0.5 bg-[#FF6B6B] text-[#FFFDF5] border border-[#1A1320]">
              AGENTPAY
            </span>
          </div>
          <span className="font-pixel text-[12px] text-[#6B5878] leading-none mt-0.5">
            Autonomous Multi-Agent E-Commerce & Payment Harness
          </span>
        </div>
      </div>

      {/* 2. System Status Badges */}
      <div className="hidden md:flex items-center gap-2.5">
        <PixelBadge label="HIVE: ONLINE" status="success" pulse />
        <PixelBadge label="AGENTS: 4 ACTIVE" variant="sky" />
        <PixelBadge label="MEMORY: 1.2ms" variant="lemon" />
      </div>

      {/* 3. Session & Action Controls */}
      <div className="flex items-center gap-2">
        {sessionId ? (
          <div className="flex items-center gap-1.5 bg-[#FFFDF5] px-2 py-1 border-2 border-[#1A1320] shadow-[inset_1px_1px_0_#F4E9C7]">
            <Cpu className="w-3.5 h-3.5 text-[#3D2E4A]" />
            <span className="font-mono text-[11px] text-[#1A1320] max-w-[120px] truncate">
              {sessionId}
            </span>
            <button
              onClick={handleCopySession}
              className="text-[#6B5878] hover:text-[#1A1320] transition-colors p-0.5"
              title="Copy Session ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#6BCF7F]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        ) : (
          <span className="font-display text-[8px] text-[#6B5878]">CONNECTING...</span>
        )}

        {/* Memory Replay Trigger */}
        <PixelButton
          variant="secondary"
          size="sm"
          icon={<History className="w-3 h-3 text-[#3D2E4A]" />}
          onClick={onMemoryReplay}
        >
          AUDIT LOG
        </PixelButton>
      </div>
    </header>
  );
};
