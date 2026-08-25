import React, { useState, useEffect } from 'react';
import { Minus, Square, X, RefreshCw, Volume2, VolumeX, ShieldCheck } from 'lucide-react';
import { voiceService } from '../services/voice';

interface TopBarProps {
  sessionId: string;
  onMemoryReplay: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ sessionId, onMemoryReplay }) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [voiceOn, setVoiceOn] = useState<boolean>(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleVoice = () => {
    const next = voiceService.toggleVoiceOutput();
    setVoiceOn(next);
  };

  const sessionShort = sessionId ? `#AGP-${sessionId.slice(0, 4).toUpperCase()}` : '#AGP-DEMO';

  return (
    <header className="h-12 bg-[#0c101d] border-b border-[#1f283d] flex items-center justify-between px-4 select-none z-20">
      {/* Brand & Mode */}
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
          <ShieldCheck className="w-4 h-4 text-white" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wider text-sm text-white font-mono">AgentPay</span>
          <span className="text-[11px] font-mono text-[#00ff41] bg-[#00ff41]/10 px-2 py-0.5 rounded border border-[#00ff41]/30">
            v1.0.0 — auto mode on
          </span>
        </div>
      </div>

      {/* Center Status Indicators */}
      <div className="flex items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#131929] border border-[#232f48] text-slate-300">
          <span className="w-2 h-2 rounded-full bg-[#00ff41] animate-pulse" />
          <span className="text-[#a0aec0]">System Online</span>
        </div>

        <div className="px-3 py-1 rounded bg-[#131929] border border-[#232f48] text-slate-300">
          <span>🕒 {timeStr}</span>
        </div>

        <div className="px-3 py-1 rounded bg-[#131929] border border-[#232f48] text-slate-300">
          <span className="text-slate-400">Session: </span>
          <span className="text-indigo-400 font-semibold">{sessionShort}</span>
        </div>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleToggleVoice}
          title={voiceOn ? 'Voice Output ON' : 'Voice Output OFF'}
          className={`p-1.5 rounded text-xs transition border ${
            voiceOn
              ? 'bg-purple-950/60 border-purple-500/50 text-purple-300'
              : 'bg-[#131929] border-[#232f48] text-slate-400'
          }`}
        >
          {voiceOn ? <Volume2 className="w-3.5 h-3.5 text-purple-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
        </button>

        <button
          onClick={onMemoryReplay}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#e8e2d4] hover:bg-[#d6cfbe] text-slate-900 border border-[#b8b09e] text-xs font-mono font-semibold transition shadow-sm"
        >
          <RefreshCw className="w-3 h-3 text-slate-800" />
          <span>Memory Replay</span>
        </button>

        {/* Window controls styling */}
        <div className="flex items-center gap-1.5 ml-2 text-slate-400">
          <button className="p-1 hover:text-white transition"><Minus className="w-3.5 h-3.5" /></button>
          <button className="p-1 hover:text-white transition"><Square className="w-3 h-3" /></button>
          <button className="p-1 hover:text-red-400 transition"><X className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    </header>
  );
};
