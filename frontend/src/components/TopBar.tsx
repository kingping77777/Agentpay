import React, { useState, useEffect } from 'react';
import { PixelButton } from './pixel/PixelButton';
import { PixelBadge } from './pixel/PixelBadge';
import { ApiKeyModal } from './ApiKeyModal';
import { Terminal, History, Sparkles } from 'lucide-react';

interface TopBarProps {
  sessionId: string;
  onMemoryReplay: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ sessionId, onMemoryReplay }) => {
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [activeModel, setActiveModel] = useState('2.0 Flash');

  useEffect(() => {
    const key = localStorage.getItem('agentpay_gemini_api_key');
    const model = localStorage.getItem('agentpay_gemini_model') || 'gemini-2.0-flash';
    setHasApiKey(!!key);
    setActiveModel(model.includes('2.0') ? '2.0 Flash' : model.includes('pro') ? '1.5 Pro' : '1.5 Flash');
  }, [isKeyModalOpen]);

  return (
    <>
      <header className="h-14 px-4 bg-[#FFF8E7] border-b-2 border-[#1A1320] flex items-center justify-between select-none shadow-[inset_0_-2px_0_#F4E9C7]">
        {/* 1. Logo & App Title */}
        <div className="flex items-center gap-3">
          {/* Retro Cartridge / Floppy Icon */}
          <div className="w-8 h-8 bg-[#1A1320] border-2 border-[#1A1320] flex items-center justify-center shadow-[inset_1px_1px_0_#6B5878,2px_2px_0_rgba(26,19,32,0.3)]">
            <Terminal className="w-4 h-4 text-[#4ECDC4]" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-[13px] text-[#1A1320] tracking-tight font-bold">
                AGENTPAY
              </h1>
              <span className="font-display text-[7px] px-1.5 py-0.5 bg-[#4ECDC4] text-[#FFFDF5] border border-[#1A1320]">
                AI COMMERCE
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
          <PixelBadge label={`BRAIN: ${activeModel}`} variant="lemon" />
          <PixelBadge label="AGENTS: 4 ACTIVE" variant="sky" />
        </div>

        {/* 3. Action Controls */}
        <div className="flex items-center gap-2">
          {/* Upgrade API Key / Brain Button */}
          <PixelButton
            variant={hasApiKey ? 'primary' : 'lemon'}
            size="sm"
            icon={<Sparkles className="w-3 h-3" />}
            onClick={() => setIsKeyModalOpen(true)}
          >
            {hasApiKey ? `⚡ ${activeModel}` : 'UPGRADE AI KEY'}
          </PixelButton>

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

      {/* API Key Modal */}
      <ApiKeyModal isOpen={isKeyModalOpen} onClose={() => setIsKeyModalOpen(false)} />
    </>
  );
};
