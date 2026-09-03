import React, { useState, useEffect } from 'react';
import { PixelButton } from './pixel/PixelButton';
import { Sparkles, Key, Check, X, ShieldAlert, Cpu } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-2.0-flash');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const existing = localStorage.getItem('agentpay_gemini_api_key') || '';
      const existingModel = localStorage.getItem('agentpay_gemini_model') || 'gemini-2.0-flash';
      setApiKey(existing);
      setModel(existingModel);
      setSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('agentpay_gemini_api_key', apiKey.trim());
    } else {
      localStorage.removeItem('agentpay_gemini_api_key');
    }
    localStorage.setItem('agentpay_gemini_model', model);
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleClear = () => {
    localStorage.removeItem('agentpay_gemini_api_key');
    setApiKey('');
    setSaved(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1320]/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-[#FFFDF5] border-4 border-[#1A1320] shadow-[8px_8px_0_#1A1320] p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#1A1320] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FF6B6B]" />
            <h2 className="font-display text-[12px] text-[#1A1320] font-bold">
              UPGRADE AI BRAIN (GEMINI)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 border-2 border-[#1A1320] bg-[#FFF8E7] flex items-center justify-center hover:bg-[#FF6B6B] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-3 text-[#3D2E4A]">
          <p className="font-pixel text-[13px] leading-relaxed">
            Upgrade Michael & the Agent team with Google's latest <strong>Gemini 2.0 Flash</strong> or <strong>Gemini 1.5 Pro</strong> neural brain for hyper-realistic conversation and shopping advice.
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="font-display text-[8px] text-[#1A1320] font-bold">
              GOOGLE GEMINI API KEY:
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-[#FFF8E7] border-2 border-[#1A1320] px-3 py-2 text-[13px] font-mono focus:outline-none focus:bg-[#FFFDF5] focus:border-[#4ECDC4]"
              />
              <Key className="w-4 h-4 text-[#6B5878] absolute right-3 top-2.5" />
            </div>
            <span className="font-pixel text-[11px] text-[#6B5878]">
              Get your free API key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[#4ECDC4] underline font-bold">aistudio.google.com</a>
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-display text-[8px] text-[#1A1320] font-bold">
              SELECT GEMINI MODEL:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'gemini-2.0-flash', label: '2.0 Flash ⚡', desc: 'Fastest & Smartest' },
                { id: 'gemini-1.5-pro', label: '1.5 Pro 🧠', desc: 'Deep Reasoning' },
                { id: 'gemini-1.5-flash', label: '1.5 Flash 🚀', desc: 'Standard' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setModel(m.id)}
                  className={`border-2 border-[#1A1320] p-2 text-left cursor-pointer transition-all ${
                    model === m.id
                      ? 'bg-[#4ECDC4] text-[#FFFDF5] shadow-[2px_2px_0_#1A1320]'
                      : 'bg-[#FFF8E7] text-[#1A1320] hover:bg-[#F4E9C7]'
                  }`}
                >
                  <div className="font-display text-[8px] font-bold">{m.label}</div>
                  <div className="font-pixel text-[10px] opacity-80">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#FFF8E7] border border-[#E6DBBD] p-2.5 flex items-start gap-2">
            <Cpu className="w-4 h-4 text-[#4ECDC4] shrink-0 mt-0.5" />
            <span className="font-pixel text-[11px] text-[#6B5878]">
              Keys are stored securely in your local browser storage and never sent to third-party servers.
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t-2 border-[#1A1320] pt-3">
          <button
            onClick={handleClear}
            className="text-[12px] font-pixel text-[#FF6B6B] hover:underline cursor-pointer"
          >
            Clear / Reset Key
          </button>

          <div className="flex gap-2">
            <PixelButton variant="secondary" size="sm" onClick={onClose}>
              CANCEL
            </PixelButton>
            <PixelButton variant="primary" size="sm" onClick={handleSave}>
              {saved ? 'SAVED ✓' : 'SAVE & UPGRADE'}
            </PixelButton>
          </div>
        </div>
      </div>
    </div>
  );
};
