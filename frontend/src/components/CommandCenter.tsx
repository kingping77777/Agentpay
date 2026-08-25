import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
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
} from 'lucide-react';
import { ChatMessage, Product, PolicyCheck, A2ADialogue, WebResult } from '../types';
import { voiceService } from '../services/voice';

interface CommandCenterProps {
  messages: ChatMessage[];
  currentAgent: string;
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onAddToCart: (productName: string) => void;
  onProceedToCheckout: () => void;
  onTriggerPayment: (orderId: string, total: number) => void;
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
  auditLogs,
}) => {
  const [activeTab, setActiveTab] = useState<string>('General');
  const [inputText, setInputText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [copiedPlan, setCopiedPlan] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const tabs = ['General', 'Prompt', 'Usage', 'Memory', 'Graph', 'Actions (4)', 'Config'];

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

  const handleToggleMic = () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      voiceService.startListening(
        (transcript) => {
          setInputText(transcript);
          setIsListening(false);
          onSendMessage(transcript);
        },
        () => setIsListening(false),
        (err) => {
          console.warn('Voice error:', err);
          setIsListening(false);
        }
      );
    }
  };

  const planText = `* We have our team of three specialized agents — making autonomous commerce seamless.
Context: Sales Discovery Agent (Michael), Merchant Promotion Agent (TechStore), and Authority Gatekeeper Agent.
Goal: Provide real-time product discovery, live web grounding, inter-agent negotiation, and deterministic budget/policy enforcement.
Rules:
- Hard budget verification (₹70,000 max customer limit)
- Merchant policy cap (₹100,000 max transaction)
- Zero LLM hallucination in payment authorization`;

  const copyPlan = () => {
    navigator.clipboard.writeText(planText);
    setCopiedPlan(true);
    setTimeout(() => setCopiedPlan(false), 2000);
  };

  return (
    <div className="w-full h-full bg-[#0d121f] flex flex-col border-l border-[#1f283d] select-none">
      {/* Header */}
      <div className="p-3.5 bg-[#121829] border-b border-[#1f283d] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-600 to-indigo-600 p-0.5 shadow-md">
            <div className="w-full h-full bg-[#182035] rounded-md flex items-center justify-center text-xl">
              👨‍💼
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">COMMAND CENTER</h2>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                All Systems Active
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Michael | Authority Control</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-3 pt-2 bg-[#0d121f] border-b border-[#1f283d] overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs font-mono rounded-t-md transition border-t border-x ${
              activeTab === tab
                ? 'bg-[#182035] text-amber-300 border-[#2f3d5c] font-semibold'
                : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            {tab === 'General' && '📁 '}
            {tab === 'Prompt' && '⚡ '}
            {tab === 'Usage' && '📊 '}
            {tab === 'Memory' && '🧠 '}
            {tab === 'Graph' && '🕸️ '}
            {tab === 'Actions (4)' && '⚙️ '}
            {tab === 'Config' && '🔧 '}
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#0a0e1a]">
        {/* Tab 1: General (Main Chat & Collaboration) */}
        {activeTab === 'General' && (
          <>
            {/* Plan / Context Card */}
            <div className="p-3 rounded-lg bg-[#141b2d] border border-[#222e49] text-xs font-mono text-slate-300 relative group">
              <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-[#222e49]">
                <span className="text-amber-400 font-semibold">&gt; new_plan: Multi-Agent Collaborative Commerce</span>
                <button
                  onClick={copyPlan}
                  className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-[#1e2942] hover:bg-[#283757] text-slate-300 transition"
                >
                  {copiedPlan ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedPlan ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-slate-300 font-sans">
                {planText}
              </pre>
            </div>

            {/* Message Stream */}
            <div className="space-y-3 pt-1">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-2">
                  {/* Message Bubble */}
                  <div
                    className={`p-3 rounded-lg border text-xs ${
                      msg.sender === 'YOU'
                        ? 'bg-[#1b233a] border-indigo-500/40 ml-8 text-white'
                        : msg.sender === 'AUTHORITY_AGENT'
                        ? 'bg-[#1a1429] border-purple-500/40 text-purple-100'
                        : msg.sender === 'MERCHANT_AGENT'
                        ? 'bg-[#1c1810] border-amber-500/40 text-amber-100'
                        : 'bg-[#131929] border-[#222e49] text-slate-200'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1.5 text-[11px] font-mono opacity-80">
                      <span className="font-semibold text-indigo-400">
                        {msg.sender === 'YOU' ? '👤 YOU' : msg.sender === 'SALES_AGENT' ? '🛒 SALES AGENT (Michael)' : msg.sender === 'MERCHANT_AGENT' ? '🏪 MERCHANT AGENT (TechStore)' : msg.sender === 'AUTHORITY_AGENT' ? '⚖️ AUTHORITY GATEKEEPER' : msg.sender}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>

                    {/* Body Text */}
                    <p className="whitespace-pre-wrap leading-relaxed font-sans text-[13px]">{msg.text}</p>

                    {/* Inter-Agent Collaboration (A2A) Dialogue Box */}
                    {msg.a2a_dialogue && msg.a2a_dialogue.length > 0 && (
                      <div className="mt-3 p-2.5 rounded bg-[#0b0f19] border border-indigo-900/50 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-indigo-300 font-bold uppercase tracking-wider">
                          <Sparkles className="w-3 h-3 text-indigo-400" />
                          <span>Inter-Agent Live Dialogue (A2A Network)</span>
                        </div>
                        {msg.a2a_dialogue.map((d, i) => (
                          <div key={i} className="text-[11px] font-mono flex items-start gap-1 text-slate-300">
                            <span className="text-amber-400 font-semibold">[{d.from.replace('_AGENT', '')} ➔ {d.to.replace('_AGENT', '')}]:</span>
                            <span className="text-slate-300">{d.message}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Live Web Grounding Results */}
                    {msg.web_results && msg.web_results.length > 0 && (
                      <div className="mt-3 p-2.5 rounded bg-[#0d1627] border border-cyan-800/40 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
                          <Globe className="w-3 h-3 text-cyan-400" />
                          <span>Live Web Grounding Sources</span>
                        </div>
                        {msg.web_results.map((w, idx) => (
                          <div key={idx} className="p-1.5 rounded bg-[#131d33] text-[11px]">
                            <div className="font-semibold text-cyan-300">{w.title}</div>
                            <div className="text-slate-400 text-[10px]">{w.snippet}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Products Grid */}
                    {msg.products && msg.products.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                        {msg.products.map((p) => (
                          <div
                            key={p.id}
                            className="p-2.5 rounded-lg bg-[#182035] border border-[#273554] hover:border-indigo-400 transition cursor-pointer flex flex-col justify-between group"
                            onClick={() => onAddToCart(p.name)}
                          >
                            <div>
                              <div className="font-semibold text-white text-xs group-hover:text-indigo-300 transition">
                                {p.name}
                              </div>
                              <div className="text-[10px] font-mono text-slate-400">{p.brand.toUpperCase()}</div>
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#273554]">
                              <span className="text-sm font-bold text-emerald-400 font-mono">
                                ₹{p.price.toLocaleString('en-IN')}
                              </span>
                              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${p.in_stock ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                {p.in_stock ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Validation Checks */}
                    {msg.validation && (
                      <div className="mt-3 p-2.5 rounded bg-[#101424] border border-[#24304f] space-y-1.5">
                        <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                          Deterministic Safety Checks
                        </div>
                        {msg.validation.checks.map((c, i) => (
                          <div
                            key={i}
                            className={`flex items-center justify-between text-[11px] font-mono p-1 rounded ${
                              c.passed ? 'bg-emerald-950/20 text-emerald-300' : 'bg-red-950/30 text-red-300'
                            }`}
                          >
                            <span>{c.passed ? '✅' : '❌'} {c.rule}</span>
                            <span className="text-[10px] text-slate-400">{c.detail || ''}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Payment Trigger Button */}
                    {msg.order_id && (
                      <div className="mt-3">
                        <button
                          onClick={() => onTriggerPayment(msg.order_id!, msg.order_total || 0)}
                          className="w-full py-2.5 px-4 rounded bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold font-mono text-xs flex items-center justify-center gap-2 shadow-lg transition"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>PAY ₹{Number(msg.order_total).toLocaleString('en-IN')} VIA RAZORPAY</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="p-3 rounded-lg bg-[#141b2d] border border-[#222e49] text-xs font-mono text-indigo-300 flex items-center gap-2 animate-pulse">
                  <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
                  <span>Agents collaborating and executing workflow...</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </>
        )}

        {/* Tab 2: Prompt */}
        {activeTab === 'Prompt' && (
          <div className="space-y-2 text-xs font-mono text-slate-300">
            <div className="p-2.5 rounded bg-[#131929] border border-[#222e49]">
              <div className="text-amber-400 font-semibold mb-1">Active Model</div>
              <div>Google Gemini 1.5 Flash (API Key Active)</div>
            </div>
            <div className="p-2.5 rounded bg-[#131929] border border-[#222e49]">
              <div className="text-indigo-400 font-semibold mb-1">System Instructions</div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                You are Michael, the Sales Agent for AgentPay. Coordinate with Merchant Agent for upsells and Authority Agent for deterministic policy/budget enforcement.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Usage */}
        {activeTab === 'Usage' && (
          <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
            <div className="p-3 rounded bg-[#131929] border border-[#222e49]">
              <div className="text-slate-400 text-[10px]">Session Latency</div>
              <div className="text-lg font-bold text-emerald-400">42 ms</div>
            </div>
            <div className="p-3 rounded bg-[#131929] border border-[#222e49]">
              <div className="text-slate-400 text-[10px]">Tokens Processed</div>
              <div className="text-lg font-bold text-indigo-400">1,842</div>
            </div>
          </div>
        )}

        {/* Tab 4: Memory */}
        {activeTab === 'Memory' && (
          <div className="space-y-1.5 text-xs font-mono text-slate-300">
            {auditLogs.length === 0 ? (
              <div className="text-center py-6 text-slate-500">No audit logs recorded yet.</div>
            ) : (
              auditLogs.map((log: any, i: number) => (
                <div key={i} className="p-2 rounded bg-[#131929] border border-[#222e49] flex items-center justify-between text-[11px]">
                  <span>{log.decision === 'APPROVED' ? '✅' : log.decision === 'REJECTED' ? '❌' : 'ℹ️'} [{log.actor}] {log.action}</span>
                  <span className="text-[10px] text-slate-500">{log.created_at?.slice(11, 19)}</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 5: Graph */}
        {activeTab === 'Graph' && (
          <div className="p-3 rounded bg-[#131929] border border-[#222e49] text-xs font-mono text-center space-y-3">
            <div className="text-indigo-300 font-bold">A2A Multi-Agent Communication Graph</div>
            <div className="flex items-center justify-center gap-2 text-[11px]">
              <span className="px-2 py-1 bg-indigo-950/80 border border-indigo-500/50 rounded">Sales Agent</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <span className="px-2 py-1 bg-amber-950/80 border border-amber-500/50 rounded">Merchant Agent</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <span className="px-2 py-1 bg-purple-950/80 border border-purple-500/50 rounded">Authority Agent</span>
            </div>
          </div>
        )}

        {/* Tab 6: Actions */}
        {activeTab === 'Actions (4)' && (
          <div className="space-y-2 text-xs font-mono text-slate-300">
            {['1. SEARCH_PRODUCTS (Catalog & Live Web)', '2. CHECK_INVENTORY (Realtime Stock Engine)', '3. EVALUATE_POLICY (Hard Budget & Safety)', '4. AUTHORIZE_ORDER (Razorpay Payment Gateway)'].map((act, idx) => (
              <div key={idx} className="p-2 rounded bg-[#131929] border border-[#222e49] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{act}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tab 7: Config */}
        {activeTab === 'Config' && (
          <div className="p-3 rounded bg-[#131929] border border-[#222e49] space-y-2 text-xs font-mono text-slate-300">
            <div className="flex justify-between">
              <span>Customer Budget Cap:</span>
              <span className="text-emerald-400 font-bold">₹70,000</span>
            </div>
            <div className="flex justify-between">
              <span>Merchant Max Transaction:</span>
              <span className="text-indigo-400 font-bold">₹100,000</span>
            </div>
            <div className="flex justify-between">
              <span>Max Discount:</span>
              <span className="text-amber-400 font-bold">5.0%</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-[#0d121f] border-t border-[#1f283d]">
        <div className="flex items-center gap-2">
          {/* Voice Input Button */}
          <button
            onClick={handleToggleMic}
            title="Speech-to-Text Voice Recognition"
            className={`p-2.5 rounded-lg border transition flex items-center justify-center ${
              isListening
                ? 'bg-red-500 text-white border-red-400 animate-pulse shadow-lg shadow-red-500/50'
                : 'bg-[#182035] border-[#293754] text-slate-300 hover:text-white hover:border-indigo-400'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Listening to your voice...' : 'Message Michael (e.g. show laptops under 70k)...'}
            className="flex-1 px-3.5 py-2.5 rounded-lg bg-[#141b2d] border border-[#24314c] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition font-sans"
          />

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={isLoading || !inputText.trim()}
            className="px-3.5 py-2.5 rounded-lg bg-[#e8a32a] hover:bg-[#d9941e] disabled:opacity-50 text-slate-950 font-bold font-mono text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <span>&gt;_ Semi-Auto</span>
          </button>
        </div>
      </div>
    </div>
  );
};
