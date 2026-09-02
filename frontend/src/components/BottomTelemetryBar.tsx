import React from 'react';

interface BottomTelemetryBarProps {
  statusData: any;
}

export const BottomTelemetryBar: React.FC<BottomTelemetryBarProps> = ({ statusData }) => {
  const agents = statusData?.agents || [];
  const services = statusData?.services || [];

  const cards = [
    {
      id: 'sales',
      accent: '#4ECDC4',
      name: 'SALES (MICHAEL)',
      status: 'ONLINE',
      ledColor: '#6BCF7F',
      subtext: 'Gemini / Claude',
      stat1: { label: 'TASKS', val: agents[0]?.tasks || 5, pct: Math.min(100, (agents[0]?.tasks || 5) * 12) },
      stat2: { label: 'MEM RECALL', val: '1.2ms', pct: 85 },
    },
    {
      id: 'merchant',
      accent: '#FFA07A',
      name: 'MERCHANT AGENT',
      status: 'ONLINE',
      ledColor: '#6BCF7F',
      subtext: 'TechStore Engine',
      stat1: { label: 'STOCK QUEUE', val: agents[1]?.tasks || 4, pct: Math.min(100, (agents[1]?.tasks || 4) * 12) },
      stat2: { label: 'DISCOUNTS', val: '5.0%', pct: 60 },
    },
    {
      id: 'authority',
      accent: '#B197FC',
      name: 'AUTHORITY AGENT',
      status: 'ACTIVE',
      ledColor: '#4ECDC4',
      subtext: 'Policy & Safety',
      stat1: { label: 'BUDGET CAP', val: '₹70k', pct: 70 },
      stat2: { label: 'CHECKS PASS', val: '100%', pct: 100 },
    },
    {
      id: 'payment',
      accent: '#FFD93D',
      name: 'PAYMENT GATEWAY',
      status: 'READY',
      ledColor: '#6BCF7F',
      subtext: 'Razorpay Service',
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
      stat1: { label: 'LATENCY', val: '38ms', pct: 90 },
      stat2: { label: 'HEARTBEAT', val: '100%', pct: 100 },
    },
  ];

  return (
    <footer className="h-32 bg-[#FFF8E7] border-t-2 border-[#1A1320] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 p-2 select-none overflow-x-auto shadow-[inset_0_2px_0_#F4E9C7]">
      {cards.map((card) => (
        <div
          key={card.id}
          className="bg-[#FFFDF5] border-2 border-[#1A1320] p-2 flex flex-col justify-between shadow-[2px_2px_0_rgba(26,19,32,0.2)] hover:bg-[#FFF8E7] transition-all"
        >
          {/* Card Header */}
          <div>
            <div className="flex items-center justify-between pb-1 border-b border-[#F4E9C7]">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="w-2 h-2 border border-[#1A1320] shrink-0"
                  style={{ backgroundColor: card.accent }}
                />
                <span className="font-display text-[8px] text-[#1A1320] truncate font-bold">
                  {card.name}
                </span>
              </div>
              <span className="flex items-center gap-1 font-display text-[7px] text-[#1A1320] shrink-0">
                <span
                  className="w-1.5 h-1.5 border border-[#1A1320]"
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
            {/* Metric 1 */}
            <div>
              <div className="flex justify-between text-[#1A1320] leading-none mb-0.5">
                <span className="font-display text-[7px] text-[#6B5878]">{card.stat1.label}</span>
                <span className="font-bold">{card.stat1.val}</span>
              </div>
              <div className="w-full h-1.5 bg-[#F4E9C7] border border-[#1A1320] overflow-hidden">
                <div
                  className="h-full"
                  style={{ width: `${card.stat1.pct}%`, backgroundColor: card.accent }}
                />
              </div>
            </div>

            {/* Metric 2 */}
            <div>
              <div className="flex justify-between text-[#1A1320] leading-none mb-0.5">
                <span className="font-display text-[7px] text-[#6B5878]">{card.stat2.label}</span>
                <span className="font-bold">{card.stat2.val}</span>
              </div>
              <div className="w-full h-1.5 bg-[#F4E9C7] border border-[#1A1320] overflow-hidden">
                <div
                  className="h-full bg-[#6BCF7F]"
                  style={{ width: `${card.stat2.pct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </footer>
  );
};
