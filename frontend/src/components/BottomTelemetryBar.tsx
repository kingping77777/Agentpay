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
      emoji: '👨‍💼',
      name: 'SALES AGENT',
      status: 'Online',
      statusColor: 'text-[#2e7d32]',
      ledColor: 'bg-[#2e7d32]',
      model: 'Claude-3.5-Sonnet / Gemini',
      focus: 'Customer Needs',
      stat1: { label: 'Tasks', val: agents[0]?.tasks || 5, pct: Math.min(100, (agents[0]?.tasks || 5) * 12), color: 'bg-[#5c6bc0]' },
      stat2: { label: 'Memory', val: `${agents[0]?.memory || 62}%`, pct: agents[0]?.memory || 62, color: 'bg-[#43a047]' },
    },
    {
      id: 'merchant',
      emoji: '👨‍💼',
      name: 'MERCHANT AGENT',
      status: 'Online',
      statusColor: 'text-[#2e7d32]',
      ledColor: 'bg-[#2e7d32]',
      model: 'Claude-3.5-Sonnet / Gemini',
      focus: 'Merchant Policy',
      stat1: { label: 'Tasks', val: agents[1]?.tasks || 4, pct: Math.min(100, (agents[1]?.tasks || 4) * 12), color: 'bg-[#42a5f5]' },
      stat2: { label: 'Memory', val: `${agents[1]?.memory || 58}%`, pct: agents[1]?.memory || 58, color: 'bg-[#43a047]' },
    },
    {
      id: 'authority',
      emoji: '👤',
      name: 'AUTHORITY AGENT',
      status: 'Active',
      statusColor: 'text-[#2e7d32]',
      ledColor: 'bg-[#2e7d32]',
      model: 'Claude-3.5-Sonnet / Gemini',
      focus: 'Validation & Policy',
      stat1: { label: 'Tasks', val: agents[2]?.tasks || 6, pct: Math.min(100, (agents[2]?.tasks || 6) * 12), color: 'bg-[#7e57c2]' },
      stat2: { label: 'Memory', val: `${agents[2]?.memory || 71}%`, pct: agents[2]?.memory || 71, color: 'bg-[#43a047]' },
    },
    {
      id: 'payment',
      emoji: '👨‍🦳',
      name: 'PAYMENT SERVICE',
      status: 'Online',
      statusColor: 'text-[#2e7d32]',
      ledColor: 'bg-[#2e7d32]',
      model: 'Razorpay API',
      focus: 'Transactions',
      stat1: { label: 'Queue', val: services[0]?.queue || 1, pct: 25, color: 'bg-[#ff9800]' },
      stat2: { label: 'Success', val: `${services[0]?.success_rate || 99}%`, pct: 99, color: 'bg-[#43a047]' },
    },
    {
      id: 'audit',
      emoji: '👩‍💼',
      name: 'AUDIT LOGGER',
      status: 'Online',
      statusColor: 'text-[#2e7d32]',
      ledColor: 'bg-[#2e7d32]',
      model: 'System Logger',
      focus: 'Audit Trail',
      stat1: { label: 'Events', val: services[1]?.events || 128, pct: 75, color: 'bg-[#1e88e5]' },
      stat2: { label: 'Storage', val: `${services[1]?.storage || 74}%`, pct: 74, color: 'bg-[#43a047]' },
    },
    {
      id: 'system',
      emoji: '🤖',
      name: 'SYSTEM MONITOR',
      status: 'Online',
      statusColor: 'text-[#2e7d32]',
      ledColor: 'bg-[#2e7d32]',
      model: 'Health Check',
      focus: 'System Health',
      stat1: { label: 'Uptime', val: `${services[2]?.uptime || 99.9}%`, pct: 99.9, color: 'bg-[#1e88e5]' },
      stat2: { label: 'Load', val: `${services[2]?.load || 42}%`, pct: 42, color: 'bg-[#43a047]' },
    },
  ];

  return (
    <div className="h-36 bg-[#e8e2d4] border-t-2 border-[#b8b09e] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 p-2 select-none overflow-x-auto">
      {cards.map((card) => (
        <div
          key={card.id}
          className="bg-[#f4efe4] rounded border border-[#cfc7b4] shadow-sm p-2 flex flex-col justify-between"
        >
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#e2dac9] border border-[#c4baa3] flex items-center justify-center text-lg flex-shrink-0">
              {card.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-800 font-mono truncate">{card.name}</span>
                <span className="flex items-center gap-1 text-[8px] font-mono font-bold text-[#2e7d32]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32]" />
                  {card.status}
                </span>
              </div>
              <div className="text-[8px] text-slate-500 font-mono truncate">{card.model}</div>
              <div className="text-[8px] text-slate-600 font-mono truncate">Focus: {card.focus}</div>
            </div>
          </div>

          {/* Metrics */}
          <div className="space-y-1.5 mt-1 text-[9px] font-mono">
            {/* Metric 1 */}
            <div>
              <div className="flex justify-between text-slate-700 font-semibold mb-0.5">
                <span>{card.stat1.label}</span>
                <span>{card.stat1.val}</span>
              </div>
              <div className="w-full h-1.5 bg-[#dcd4c0] rounded-sm overflow-hidden">
                <div className={`h-full ${card.stat1.color} rounded-sm`} style={{ width: `${card.stat1.pct}%` }} />
              </div>
            </div>

            {/* Metric 2 */}
            <div>
              <div className="flex justify-between text-slate-700 font-semibold mb-0.5">
                <span>{card.stat2.label}</span>
                <span>{card.stat2.val}</span>
              </div>
              <div className="w-full h-1.5 bg-[#dcd4c0] rounded-sm overflow-hidden">
                <div className={`h-full ${card.stat2.color} rounded-sm`} style={{ width: `${card.stat2.pct}%` }} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
