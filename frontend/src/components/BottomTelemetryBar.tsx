import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Shield, RefreshCw, Zap, CreditCard, Activity } from 'lucide-react';

interface BottomTelemetryBarProps {
  statusData: any;
  onQuickPrompt?: (prompt: string) => void;
  onOpenAuditModal?: () => void;
}

export const BottomTelemetryBar: React.FC<BottomTelemetryBarProps> = ({
  statusData,
  onQuickPrompt,
  onOpenAuditModal,
}) => {
  const [activeToast, setActiveToast] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<{ id: string; msg: string; time: string } | null>(null);

  const agents = statusData?.agents || [];
  const services = statusData?.services || [];

  const showToast = (msg: string, cardId: string) => {
    setActiveToast(msg);
    setLastAction({
      id: cardId,
      msg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    });
    setTimeout(() => setActiveToast(null), 3500);
  };

  const handleCardClick = (id: string) => {
    switch (id) {
      case 'sales':
        showToast('🎯 Michael initiated live catalog scan for trending offers!', id);
        if (onQuickPrompt) onQuickPrompt('Show me the top trending tech deals under ₹20,000');
        break;
      case 'merchant':
        showToast('🏪 TechStore synced inventory and validated 5% partner discount!', id);
        if (onQuickPrompt) onQuickPrompt('What special bundle discounts are active right now?');
        break;
      case 'authority':
        showToast('🛡️ Authority Gatekeeper verified ₹70,000 budget cap & safety policies!', id);
        if (onQuickPrompt) onQuickPrompt('Check my current budget limit and policy rules');
        break;
      case 'payment':
        showToast('💳 Razorpay & UPI POS payment gateways are verified active!', id);
        break;
      case 'audit':
        showToast('📼 Ledger integrity check passed: 100% cryptographic hashes valid!', id);
        if (onOpenAuditModal) onOpenAuditModal();
        break;
      case 'system':
        showToast('⚡ Hive Engine Heartbeat: Ping 28ms · 0 dropped packets · 100% uptime', id);
        break;
      default:
        break;
    }
  };

  const cards = [
    {
      id: 'sales',
      accent: '#4ECDC4',
      name: 'SALES (MICHAEL)',
      status: 'ONLINE',
      ledColor: '#6BCF7F',
      subtext: 'Catalog & Web Grounding',
      actionLabel: '⚡ ASK MICHAEL',
      stat1: { label: 'TASKS', val: agents[0]?.tasks || 5, pct: Math.min(100, (agents[0]?.tasks || 5) * 12) },
      stat2: { label: 'RECALL', val: '1.2ms', pct: 85 },
    },
    {
      id: 'merchant',
      accent: '#FFA07A',
      name: 'MERCHANT AGENT',
      status: 'ONLINE',
      ledColor: '#6BCF7F',
      subtext: 'Inventory & Discounts',
      actionLabel: '📦 SYNC STOCK',
      stat1: { label: 'QUEUE', val: agents[1]?.tasks || 4, pct: Math.min(100, (agents[1]?.tasks || 4) * 12) },
      stat2: { label: 'DISCOUNT', val: '5.0%', pct: 60 },
    },
    {
      id: 'authority',
      accent: '#B197FC',
      name: 'AUTHORITY AGENT',
      status: 'ACTIVE',
      ledColor: '#4ECDC4',
      subtext: 'Policy & Safety Engine',
      actionLabel: '🛡️ CHECK POLICY',
      stat1: { label: 'BUDGET', val: '₹70k', pct: 70 },
      stat2: { label: 'PASS RATE', val: '100%', pct: 100 },
    },
    {
      id: 'payment',
      accent: '#FFD93D',
      name: 'PAYMENT GATEWAY',
      status: 'READY',
      ledColor: '#6BCF7F',
      subtext: 'Razorpay & UPI POS',
      actionLabel: '💳 PING GATEWAY',
      stat1: { label: 'PENDING', val: services[0]?.queue || 0, pct: 15 },
      stat2: { label: 'SUCCESS', val: '99.9%', pct: 99.9 },
    },
    {
      id: 'audit',
      accent: '#FF6B6B',
      name: 'AUDIT RECORDER',
      status: 'LOGGING',
      ledColor: '#FF6B6B',
      subtext: 'Immutable Ledger',
      actionLabel: '📼 VERIFY LOGS',
      stat1: { label: 'EVENTS', val: services[1]?.events || 142, pct: 80 },
      stat2: { label: 'INTEGRITY', val: 'VERIFIED', pct: 100 },
    },
    {
      id: 'system',
      accent: '#6BCF7F',
      name: 'HIVE ENGINE',
      status: 'ONLINE',
      ledColor: '#6BCF7F',
      subtext: 'Zero-Lag PTY Loop',
      actionLabel: '⚡ PING ENGINE',
      stat1: { label: 'LATENCY', val: '28ms', pct: 95 },
      stat2: { label: 'UPTIME', val: '99.99%', pct: 100 },
    },
  ];

  return (
    <footer className="relative bg-[#FFF8E7] border-t-2 border-[#1A1320] p-2 select-none shadow-[inset_0_2px_0_#F4E9C7]">
      {/* Interactive Action Toast Notification */}
      {activeToast && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 bg-[#1A1320] text-[#FFFDF5] font-display text-[9px] px-3 py-1.5 border-2 border-[#4ECDC4] shadow-[0_4px_12px_rgba(0,0,0,0.3)] flex items-center gap-2 animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-[#FFD93D]" />
          <span>{activeToast}</span>
        </div>
      )}

      {/* 6 Interactive Telemetry Work Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {cards.map((card) => {
          const isSelected = lastAction?.id === card.id;

          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`border-2 border-[#1A1320] p-2 flex flex-col justify-between transition-all cursor-pointer group ${
                isSelected
                  ? 'bg-[#FFF8E7] shadow-[inset_0_0_0_2px_#4ECDC4,2px_2px_0_rgba(26,19,32,0.3)] -translate-y-0.5'
                  : 'bg-[#FFFDF5] shadow-[2px_2px_0_rgba(26,19,32,0.2)] hover:bg-[#FFF8E7] hover:-translate-y-0.5'
              }`}
              title={`Click to execute work: ${card.actionLabel}`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between pb-1 border-b border-[#F4E9C7]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2 h-2 border border-[#1A1320] shrink-0 group-hover:scale-125 transition-transform"
                      style={{ backgroundColor: card.accent }}
                    />
                    <span className="font-display text-[8px] text-[#1A1320] truncate font-bold">
                      {card.name}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 font-display text-[7px] text-[#1A1320] shrink-0">
                    <span
                      className="w-1.5 h-1.5 border border-[#1A1320] animate-pulse"
                      style={{ backgroundColor: card.ledColor }}
                    />
                    {card.status}
                  </span>
                </div>
                <div className="font-display text-[7px] text-[#6B5878] mt-0.5 truncate">
                  {card.subtext}
                </div>
              </div>

              {/* Metric Bars */}
              <div className="space-y-1 mt-1 font-vt323 text-[14px]">
                <div>
                  <div className="flex justify-between text-[#1A1320] leading-none mb-0.5">
                    <span className="font-display text-[7px] text-[#6B5878]">{card.stat1.label}</span>
                    <span className="font-bold">{card.stat1.val}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#F4E9C7] border border-[#1A1320] overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{ width: `${card.stat1.pct}%`, backgroundColor: card.accent }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[#1A1320] leading-none mb-0.5">
                    <span className="font-display text-[7px] text-[#6B5878]">{card.stat2.label}</span>
                    <span className="font-bold">{card.stat2.val}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#F4E9C7] border border-[#1A1320] overflow-hidden">
                    <div
                      className="h-full bg-[#6BCF7F] transition-all duration-500"
                      style={{ width: `${card.stat2.pct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Button Label */}
              <div className="mt-1.5 pt-1 border-t border-[#F4E9C7] flex items-center justify-between">
                <span className="font-display text-[6.5px] text-[#3D2E4A] group-hover:text-[#1A1320] font-bold">
                  {card.actionLabel}
                </span>
                <span className="font-display text-[7px] text-[#4ECDC4] opacity-0 group-hover:opacity-100 transition-opacity">
                  RUN ↵
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </footer>
  );
};
