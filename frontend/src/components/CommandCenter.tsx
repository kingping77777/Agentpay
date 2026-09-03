import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Copy,
  Check,
  Globe,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Layers,
  FileCode,
  Sliders,
  History,
  Activity,
  ArrowRight,
  Package,
} from 'lucide-react';
import { ChatMessage, Product, PolicyCheck, A2ADialogue, WebResult } from '../types';
import { PixelButton } from './pixel/PixelButton';
import { PixelBadge } from './pixel/PixelBadge';

interface CommandCenterProps {
  messages: ChatMessage[];
  currentAgent: string;
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onAddToCart: (productName: string) => void;
  onProceedToCheckout: () => void;
  onTriggerPayment: (orderId: string, total: number) => void;
  onDirectBuy?: (product: Product) => void;
  auditLogs: any[];
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  messages,
  currentAgent,
  isLoading,
  onSendMessage,
  onAddToCart,
  onProceedToCheckout,
  onTriggerPayment,
  onDirectBuy,
  auditLogs,
}) => {
  const [activeTab, setActiveTab] = useState<string>('Dialogue');
  const [inputText, setInputText] = useState<string>('');
  const [copiedPlan, setCopiedPlan] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const tabs = ['Dialogue', 'Prompt', 'Telemetry', 'Memory', 'A2A Graph', 'Actions', 'Config'];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const planText = `* Objective: Multi-Agent Autonomous Commerce Harness
- Michael (Sales Discovery): Catalog search, web grounding & bundle negotiation
- TechStore (Merchant Agent): Live stock, pricing discounts & invoice generation
- Authority Gatekeeper: Deterministic policy, budget limits & zero-hallucination payment`;

  const copyPlan = () => {
    navigator.clipboard.writeText(planText);
    setCopiedPlan(true);
    setTimeout(() => setCopiedPlan(false), 2000);
  };

  return (
    <div className="w-full h-full bg-[#FFF8E7] flex flex-col select-none overflow-hidden font-pixel">
      {/* 1. SNES Menu Header */}
      <div className="p-3 bg-[#FFFDF5] border-b-2 border-[#1A1320] flex items-center justify-between shadow-[inset_0_-2px_0_#F4E9C7]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#1A1320] border-2 border-[#1A1320] flex items-center justify-center text-lg shadow-[inset_1px_1px_0_#6B5878]">
            👨‍💼
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-[10px] text-[#1A1320] tracking-tight">
                COMMAND CENTER
              </h2>
              <PixelBadge label="LIVE HARNESS" status="working" />
            </div>
            <p className="font-display text-[8px] text-[#6B5878] mt-0.5">
              Michael (Sales) · TechStore · Authority Gatekeeper
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5">
          <span className="font-display text-[8px] text-[#3D2E4A] bg-[#F4E9C7] px-2 py-1 border border-[#1A1320]">
            MODE: AUTONOMOUS
          </span>
        </div>
      </div>

      {/* 2. SNES Cartridge Style Tabs */}
      <div className="flex items-center gap-1 px-3 pt-2 bg-[#F4E9C7] border-b-2 border-[#1A1320] overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 font-display text-[8px] uppercase tracking-tight transition-all border-t-2 border-x-2 ${
              activeTab === tab
                ? 'bg-[#FFF8E7] text-[#1A1320] border-[#1A1320] shadow-[inset_0_2px_0_#4ECDC4] translate-y-[2px] font-bold'
                : 'bg-[#E8D9A0] text-[#6B5878] border-[#A899B5] hover:bg-[#FFFDF5] hover:text-[#1A1320]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3. Tab Body Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#FCFAF0]">
        {/* Tab 1: Dialogue Stream */}
        {activeTab === 'Dialogue' && (
          <>
            {/* System Objective Banner */}
            <div className="p-3 bg-[#FFF8E7] border-2 border-[#1A1320] shadow-[inset_0_0_0_2px_#F4E9C7,2px_2px_0_rgba(26,19,32,0.15)] text-[#1A1320] relative">
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b-2 border-[#1A1320]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-[#FFD93D] border border-[#1A1320]" />
                  <span className="font-display text-[9px] text-[#1A1320]">
                    &gt; active_plan: Collaborative Commerce
                  </span>
                </div>
                <PixelButton variant="secondary" size="sm" onClick={copyPlan}>
                  {copiedPlan ? 'COPIED' : 'COPY'}
                </PixelButton>
              </div>
              <pre className="whitespace-pre-wrap font-vt323 text-[16px] leading-relaxed text-[#3D2E4A]">
                {planText}
              </pre>
            </div>

            {/* Messages Feed */}
            <div className="space-y-3 pt-1">
              {messages.map((msg) => {
                const isUser = msg.sender === 'YOU';
                const isAuthority = msg.sender === 'AUTHORITY_AGENT';
                const isMerchant = msg.sender === 'MERCHANT_AGENT';
                const isSystem = msg.sender === 'SYSTEM' || msg.sender === 'AUDIT_LOGGER';

                return (
                  <div key={msg.id} className="space-y-2">
                    {/* Retro Dialogue Box */}
                    <div
                      className={`p-3.5 border-2 border-[#1A1320] shadow-[2px_2px_0_rgba(26,19,32,0.25)] ${
                        isUser
                          ? 'bg-[#FFFDF5] ml-8 border-[#3D2E4A] shadow-[inset_0_0_0_2px_#D6C5FF]'
                          : isAuthority
                          ? 'bg-[#FFFDF5] border-[#1A1320] shadow-[inset_0_0_0_2px_#D6C5FF]'
                          : isMerchant
                          ? 'bg-[#FFFDF5] border-[#1A1320] shadow-[inset_0_0_0_2px_#FFD0B5]'
                          : 'bg-[#FFF8E7] border-[#1A1320] shadow-[inset_0_0_0_2px_#A8E6E0]'
                      }`}
                    >
                      {/* Nameplate & Timestamp Header */}
                      <div className="flex items-center justify-between mb-2 pb-1 border-b border-[#D9CFE0]">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 border border-[#1A1320]"
                            style={{
                              backgroundColor: isUser
                                ? '#4ECDC4'
                                : isAuthority
                                ? '#B197FC'
                                : isMerchant
                                ? '#FFA07A'
                                : '#6BCF7F',
                            }}
                          />
                          <span className="font-display text-[9px] text-[#1A1320] font-bold">
                            {msg.sender === 'YOU'
                              ? 'YOU'
                              : msg.sender === 'SALES_AGENT'
                              ? 'MICHAEL (Sales)'
                              : msg.sender === 'MERCHANT_AGENT'
                              ? 'TECHSTORE (Merchant)'
                              : msg.sender === 'AUTHORITY_AGENT'
                              ? 'AUTHORITY GATEKEEPER'
                              : msg.sender}
                          </span>
                        </div>
                        <span className="font-display text-[8px] text-[#6B5878]">{msg.timestamp}</span>
                      </div>

                      {/* Dialogue Body */}
                      <p className="whitespace-pre-wrap font-pixel text-[15px] text-[#1A1320] leading-relaxed">
                        {msg.text}
                      </p>

                      {/* Inter-Agent Collaboration Dialogue (A2A) */}
                      {msg.a2a_dialogue && msg.a2a_dialogue.length > 0 && (
                        <div className="mt-3 p-2.5 bg-[#FFFDF5] border-2 border-[#1A1320] shadow-[inset_0_0_0_1px_#F4E9C7] space-y-2">
                          <div className="flex items-center gap-1.5 font-display text-[8px] text-[#1A1320]">
                            <Sparkles className="w-3 h-3 text-[#B197FC]" />
                            <span>INTER-AGENT DIALOGUE (A2A NETWORK)</span>
                          </div>
                          {msg.a2a_dialogue.map((d, i) => (
                            <div
                              key={i}
                              className="font-vt323 text-[15px] flex items-start gap-1.5 text-[#3D2E4A] bg-[#F4E9C7] p-1.5 border border-[#1A1320]"
                            >
                              <span className="text-[#FF6B6B] font-bold">
                                [{d.from.replace('_AGENT', '')} ➔ {d.to.replace('_AGENT', '')}]:
                              </span>
                              <span>{d.message}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Live Web Grounding */}
                      {msg.web_results && msg.web_results.length > 0 && (
                        <div className="mt-3 p-2.5 bg-[#FCFAF0] border-2 border-[#1A1320] space-y-1.5">
                          <div className="flex items-center gap-1.5 font-display text-[8px] text-[#1A1320]">
                            <Globe className="w-3 h-3 text-[#4ECDC4]" />
                            <span>GROUNDING SOURCES</span>
                          </div>
                          {msg.web_results.map((w, idx) => (
                            <div
                              key={idx}
                              className="p-2 bg-[#FFFDF5] border border-[#1A1320] text-[#3D2E4A]"
                            >
                              <div className="font-pixel font-bold text-[13px] text-[#1A1320]">{w.title}</div>
                              <div className="font-pixel text-[12px] text-[#6B5878] mt-0.5">{w.snippet}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Product Catalog Items Grid */}
                      {msg.products && msg.products.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
                          {msg.products.map((p) => (
                            <div
                              key={p.id}
                              className="p-3 bg-[#FFFDF5] border-2 border-[#1A1320] shadow-[2px_2px_0_rgba(26,19,32,0.2)] flex flex-col justify-between hover:bg-[#FFF8E7] transition-all"
                            >
                              <div>
                                <div className="flex items-start justify-between gap-1">
                                  <div className="font-pixel font-bold text-[14px] text-[#1A1320] line-clamp-2">
                                    {p.name}
                                  </div>
                                  <Package className="w-4 h-4 text-[#4ECDC4] shrink-0" />
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="font-display text-[8px] text-[#6B5878]">
                                    {p.brand.toUpperCase()} • {p.category.toUpperCase()}
                                  </span>
                                  {p.rating && (
                                    <span className="font-display text-[8px] text-[#FFD93D]">
                                      {'★'.repeat(Math.floor(p.rating))} {p.rating}
                                    </span>
                                  )}
                                  {p.in_stock && (
                                    <span className="font-display text-[7px] text-[#6BCF7F] bg-[#E8F8EA] px-1 border border-[#6BCF7F]">
                                      IN STOCK
                                    </span>
                                  )}
                                </div>
                                {p.description && (
                                  <p className="font-pixel text-[12px] text-[#6B5878] line-clamp-2 mt-1">
                                    {p.description}
                                  </p>
                                )}
                                {/* Key Specs Pills */}
                                {p.specifications && (
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {Object.entries(p.specifications).slice(0, 3).map(([key, val]) => (
                                      <span key={key} className="font-display text-[7px] text-[#3D2E4A] bg-[#F4E9C7] px-1.5 py-0.5 border border-[#D9CFE0]">
                                        {String(val).slice(0, 40)}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="mt-3 pt-2 border-t-2 border-[#1A1320] flex items-center justify-between gap-1.5 flex-wrap">
                                <span className="font-display text-[12px] text-[#008844] font-bold">
                                  ₹{p.price.toLocaleString('en-IN')}
                                </span>
                                <div className="flex items-center gap-1">
                                  <PixelButton
                                    variant="mint"
                                    size="sm"
                                    onClick={() => onAddToCart(p.name)}
                                    title="Add this product to your ongoing shopping cart"
                                  >
                                    🛒 ADD
                                  </PixelButton>
                                  {onDirectBuy && (
                                    <PixelButton
                                      variant="lemon"
                                      size="sm"
                                      onClick={() => onDirectBuy(p)}
                                      title="Direct 1-click checkout with Delivery Address & UPI QR code"
                                    >
                                      ⚡ BUY DIRECT
                                    </PixelButton>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Deterministic Policy Check Badges */}
                      {msg.policy_checks && msg.policy_checks.length > 0 && (
                        <div className="mt-3 p-2 bg-[#FFFDF5] border-2 border-[#1A1320] space-y-1.5">
                          <div className="flex items-center gap-1.5 font-display text-[8px] text-[#1A1320]">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#51CF66]" />
                            <span>DETERMINISTIC COMPLIANCE AUDIT</span>
                          </div>
                          {msg.policy_checks.map((c, i) => (
                            <div
                              key={i}
                              className={`flex items-center justify-between p-1.5 border font-display text-[8px] ${
                                c.passed
                                  ? 'bg-[#B4E5BD] text-[#1A1320] border-[#6BCF7F]'
                                  : 'bg-[#FFB4B4] text-[#1A1320] border-[#FF6B6B]'
                              }`}
                            >
                              <span>{c.passed ? '✅' : '❌'} {c.rule}</span>
                              <span className="text-[7px] text-[#3D2E4A]">{c.detail || ''}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Payment Authorization Trigger Button */}
                      {msg.order_id && (
                        <div className="mt-3">
                          <PixelButton
                            variant="lemon"
                            size="lg"
                            className="w-full text-center"
                            onClick={() => onTriggerPayment(msg.order_id!, msg.order_total || 0)}
                          >
                            💳 PAY ₹{Number(msg.order_total).toLocaleString('en-IN')} VIA RAZORPAY
                          </PixelButton>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="p-3 bg-[#FFF8E7] border-2 border-[#1A1320] shadow-[2px_2px_0_rgba(26,19,32,0.2)] space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-[#FFD93D] border border-[#1A1320] animate-spin" />
                    <span className="font-display text-[9px] text-[#1A1320] font-bold">
                      AGENTS WORKING
                    </span>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className="font-pixel text-[12px] text-[#4ECDC4]">🔍 Michael searching...</span>
                    <span className="font-pixel text-[12px] text-[#FFA07A]">📦 TechStore checking stock...</span>
                    <span className="font-pixel text-[12px] text-[#B197FC]">🛡️ Authority validating...</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </>
        )}

        {/* Tab 2: Prompt */}
        {activeTab === 'Prompt' && (
          <div className="space-y-3 font-vt323 text-[17px] text-[#1A1320]">
            <div className="p-3 bg-[#FFFDF5] border-2 border-[#1A1320] shadow-[inset_0_0_0_2px_#F4E9C7]">
              <div className="flex items-center gap-1.5 font-display text-[9px] text-[#1A1320] mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#FFD93D]" />
                <span>WHAT IS THE PROMPT FEATURE?</span>
              </div>
              <p className="text-[15px] leading-snug text-[#3D2E4A]">
                The <strong>Prompt</strong> tab inspects the underlying AI reasoning instructions that guide our multi-agent network. In autonomous commerce, system prompts establish persona boundaries, ensure deterministic safety compliance (e.g. strict budget adherence and zero-hallucination policies), and coordinate inter-agent negotiation protocols between Sales, Merchant, and Authority gatekeepers.
              </p>
            </div>

            <div className="p-3 bg-[#FFFDF5] border-2 border-[#1A1320] shadow-[inset_0_0_0_2px_#F4E9C7]">
              <div className="font-display text-[9px] text-[#1A1320] mb-1">ACTIVE MULTI-AGENT INSTRUCTIONS</div>
              <div className="space-y-2 text-[14px]">
                <div className="p-2 bg-[#FCFAF0] border border-[#1A1320]">
                  <strong className="text-[#FF6B6B]">🎯 Michael (Sales Discovery):</strong> Universal query parsing, multi-category feature synthesis (phones, shoes, clothes, tech), and authentic INR pricing within customer budget.
                </div>
                <div className="p-2 bg-[#FCFAF0] border border-[#1A1320]">
                  <strong className="text-[#4ECDC4]">🏪 TechStore (Merchant Agent):</strong> Real-time stock verification, invoice calculation, and automated bundle discounts (up to 5%).
                </div>
                <div className="p-2 bg-[#FCFAF0] border border-[#1A1320]">
                  <strong className="text-[#51CF66]">🛡️ Authority Gatekeeper:</strong> 5-step deterministic compliance audit (₹100k cap, budget validation, MFA, and discount ceiling).
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Telemetry */}
        {activeTab === 'Telemetry' && (
          <div className="grid grid-cols-2 gap-3 font-vt323 text-[#1A1320]">
            <div className="p-3 bg-[#FFFDF5] border-2 border-[#1A1320] shadow-[2px_2px_0_rgba(26,19,32,0.2)]">
              <div className="font-display text-[8px] text-[#6B5878]">SESSION LATENCY</div>
              <div className="text-2xl font-bold text-[#1A1320]">38 ms</div>
            </div>
            <div className="p-3 bg-[#FFFDF5] border-2 border-[#1A1320] shadow-[2px_2px_0_rgba(26,19,32,0.2)]">
              <div className="font-display text-[8px] text-[#6B5878]">TOKENS PROCESSED</div>
              <div className="text-2xl font-bold text-[#1A1320]">2,190</div>
            </div>
          </div>
        )}

        {/* Tab 4: Memory / Audit Logs */}
        {activeTab === 'Memory' && (
          <div className="space-y-3">
            {/* Header */}
            <div className="p-2.5 bg-[#FFF8E7] border-2 border-[#1A1320] shadow-[inset_0_0_0_2px_#F4E9C7]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <History className="w-4 h-4 text-[#FF6B6B]" />
                  <span className="font-display text-[10px] text-[#1A1320] font-bold">
                    AGENTPAY AUDIT TRAIL
                  </span>
                </div>
                <span className="font-display text-[8px] text-[#6B5878] bg-[#F4E9C7] px-2 py-0.5 border border-[#1A1320]">
                  {auditLogs.length} EVENTS
                </span>
              </div>
              <p className="font-pixel text-[12px] text-[#6B5878] mt-1">
                Immutable record of every agent action, policy check, and payment authorization.
              </p>
            </div>

            {/* Log Entries */}
            {auditLogs.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Activity className="w-8 h-8 text-[#A899B5] mx-auto" />
                <p className="font-display text-[9px] text-[#6B5878]">
                  No audit events recorded yet. Start chatting to generate activity.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {auditLogs.map((log: any, i: number) => {
                  const isApproved = log.decision === 'APPROVED';
                  const isRejected = log.decision === 'REJECTED';
                  const icon = isApproved ? '✅' : isRejected ? '❌' : 'ℹ️';
                  const bgColor = isApproved
                    ? 'bg-[#E8F8EA] border-[#6BCF7F]'
                    : isRejected
                    ? 'bg-[#FFE8E8] border-[#FF6B6B]'
                    : 'bg-[#FFFDF5] border-[#1A1320]';

                  const actorLabel = (log.actor || 'SYSTEM')
                    .replace('_AGENT', '')
                    .replace('SALES', 'MICHAEL')
                    .replace('MERCHANT', 'TECHSTORE')
                    .replace('AUTHORITY', 'GATEKEEPER');

                  return (
                    <div
                      key={i}
                      className={`p-2.5 border-2 ${bgColor} shadow-[1px_1px_0_rgba(26,19,32,0.1)]`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[13px]">{icon}</span>
                          <span className="font-display text-[9px] text-[#1A1320] font-bold">
                            {actorLabel}
                          </span>
                          <span className="font-display text-[7px] text-[#6B5878] bg-[#F4E9C7] px-1.5 py-0.5 border border-[#D9CFE0]">
                            {(log.action || 'ACTION').replace(/_/g, ' ')}
                          </span>
                        </div>
                        <span className="font-mono text-[8px] text-[#A899B5]">
                          {log.created_at?.slice(11, 19) || '--:--:--'}
                        </span>
                      </div>
                      {log.reason && (
                        <p className="font-pixel text-[12px] text-[#3D2E4A] line-clamp-2 pl-5">
                          {log.reason}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: A2A Graph */}
        {activeTab === 'A2A Graph' && (
          <div className="p-4 bg-[#FFFDF5] border-2 border-[#1A1320] text-center space-y-4">
            <div className="font-display text-[10px] text-[#1A1320]">A2A MULTI-AGENT TOPOLOGY</div>
            <div className="flex flex-wrap items-center justify-center gap-2 font-display text-[8px]">
              <span className="px-2.5 py-1.5 bg-[#A8E6E0] border-2 border-[#1A1320]">
                Michael (Sales)
              </span>
              <ArrowRight className="w-4 h-4 text-[#1A1320]" />
              <span className="px-2.5 py-1.5 bg-[#FFD0B5] border-2 border-[#1A1320]">
                TechStore (Merchant)
              </span>
              <ArrowRight className="w-4 h-4 text-[#1A1320]" />
              <span className="px-2.5 py-1.5 bg-[#D6C5FF] border-2 border-[#1A1320]">
                Authority Gatekeeper
              </span>
            </div>
          </div>
        )}

        {/* Tab 6: Actions */}
        {activeTab === 'Actions' && (
          <div className="space-y-2 font-display text-[8px] text-[#1A1320]">
            {[
              '1. SEARCH_PRODUCTS (Catalog & Live Web)',
              '2. CHECK_INVENTORY (Realtime Stock Engine)',
              '3. EVALUATE_POLICY (Hard Budget & Safety)',
              '4. AUTHORIZE_ORDER (Razorpay Payment Gateway)',
            ].map((act, idx) => (
              <div key={idx} className="p-2.5 bg-[#FFFDF5] border-2 border-[#1A1320] flex items-center gap-2">
                <span className="w-2 h-2 bg-[#6BCF7F] border border-[#1A1320]" />
                <span>{act}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tab 7: Config */}
        {activeTab === 'Config' && (
          <div className="p-3 bg-[#FFFDF5] border-2 border-[#1A1320] space-y-2 font-pixel text-[14px] text-[#1A1320]">
            <div className="flex justify-between pb-1 border-b border-[#F4E9C7]">
              <span>Customer Budget Cap:</span>
              <span className="font-display text-[10px] text-[#1A1320] font-bold">₹70,000</span>
            </div>
            <div className="flex justify-between pb-1 border-b border-[#F4E9C7]">
              <span>Merchant Max Transaction:</span>
              <span className="font-display text-[10px] text-[#1A1320] font-bold">₹100,000</span>
            </div>
            <div className="flex justify-between">
              <span>Max Negotiated Discount:</span>
              <span className="font-display text-[10px] text-[#1A1320] font-bold">5.0%</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. SNES Dialogue Prompt Input Area */}
      <div className="p-3 bg-[#FFF8E7] border-t-2 border-[#1A1320] shadow-[inset_0_2px_0_#F4E9C7] space-y-2">
        {/* Quick Suggestion Chips */}
        {messages.length <= 2 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-display text-[7px] text-[#6B5878] mr-1">QUICK:</span>
            {[
              '📱 Phone under 14k',
              '💻 Laptop under 45k',
              '🎧 Headphones',
              '⌚ Smartwatch',
              '👟 Running shoes',
              '🎒 Backpack',
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => {
                  const query = chip.replace(/^[^\s]+\s/, '');
                  onSendMessage(query);
                }}
                className="px-2 py-0.5 bg-[#FFFDF5] border border-[#A899B5] font-pixel text-[11px] text-[#3D2E4A] hover:bg-[#4ECDC4] hover:text-[#FFFDF5] hover:border-[#1A1320] transition-all cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Prompt Text Input */}
          <div className="flex-1 relative flex items-center bg-[#FFFDF5] border-2 border-[#1A1320] shadow-[inset_1px_1px_0_#F4E9C7]">
            <span className="font-display text-[10px] text-[#6B5878] pl-2.5 select-none">&gt;</span>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Try: phone under 14k, laptop, headphones, shoes, smartwatch, backpack..."
              className="w-full px-2.5 py-2 bg-transparent text-[#1A1320] font-pixel text-[15px] placeholder:text-[#A899B5] focus:outline-none"
            />
          </div>

          {/* Send Button */}
          <PixelButton
            variant="primary"
            size="md"
            onClick={handleSend}
            disabled={isLoading || !inputText.trim()}
          >
            SEND ↵
          </PixelButton>
        </div>

        {/* Powered By Footer */}
        <div className="flex items-center justify-center gap-1.5">
          <span className="font-display text-[7px] text-[#A899B5]">
            POWERED BY AGENTPAY — AI MULTI-AGENT COMMERCE ENGINE
          </span>
        </div>
      </div>
    </div>
  );
};
