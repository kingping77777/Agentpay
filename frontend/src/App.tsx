import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { PhaserOffice } from './components/PhaserOffice';
import { CommandCenter } from './components/CommandCenter';
import { BottomTelemetryBar } from './components/BottomTelemetryBar';
import { ChatMessage } from './types';
import { getDemoIds, createSession, sendAgentChat, getSystemStatus, getAuditLogs, triggerPayment } from './services/api';
import { voiceService } from './services/voice';

export const App: React.FC = () => {
  const [sessionId, setSessionId] = useState<string>('');
  const [customerId, setCustomerId] = useState<string>('');
  const [merchantId, setMerchantId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentAgent, setCurrentAgent] = useState<string>('SALES_AGENT');
  const [lastMessage, setLastMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusData, setStatusData] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // 1. Initial Session Setup
  useEffect(() => {
    const initApp = async () => {
      try {
        const demo = await getDemoIds();
        if (demo.ready) {
          setCustomerId(demo.customer_id);
          setMerchantId(demo.merchant_id);

          const session = await createSession(demo.customer_id, demo.merchant_id);
          setSessionId(session.session_id);

          const welcomeMsg: ChatMessage = {
            id: 'init-1',
            sender: 'SALES_AGENT',
            text: `👋 Hello! I am Michael, your Sales Discovery Agent.\n\nI can help you search tech products across our catalog and the live web, check inventory, coordinate bundle discounts with TechStore, and verify budget limits. What are you looking for today?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages([welcomeMsg]);
          setLastMessage("Hello! What are you shopping for today?");

          // Load system telemetry
          const status = await getSystemStatus();
          setStatusData(status);
        }
      } catch (e) {
        console.error('Failed to initialize session:', e);
      }
    };
    initApp();
  }, []);

  // Periodic Telemetry Refresh
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const status = await getSystemStatus();
        setStatusData(status);
        if (sessionId) {
          const audit = await getAuditLogs(sessionId);
          setAuditLogs(audit.audit_logs || []);
        }
      } catch (e) {
        // ignore
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [sessionId]);

  // Handle Send Message
  const handleSendMessage = async (text: string) => {
    if (!text || !sessionId || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'YOU',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setLastMessage(text);
    setCurrentAgent('SALES_AGENT');

    try {
      const history = messages.map((m) => ({
        role: m.sender === 'YOU' ? 'user' : 'model',
        content: m.text,
      }));

      const res = await sendAgentChat(sessionId, text, history);

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: res.agent || 'SALES_AGENT',
        text: res.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        products: res.products || [],
        validation: res.validation,
        a2a_dialogue: res.a2a_dialogue || [],
        web_results: res.web_results || [],
        order_id: res.order_id,
        order_total: res.order_total,
      };

      setMessages((prev) => [...prev, agentMsg]);
      setCurrentAgent(res.agent || 'SALES_AGENT');
      setLastMessage(res.message);

      // Speak response using voice engine
      voiceService.speak(res.message);

      // Refresh audit logs
      const audit = await getAuditLogs(sessionId);
      setAuditLogs(audit.audit_logs || []);

      // Refresh telemetry
      const status = await getSystemStatus();
      setStatusData(status);
    } catch (e: any) {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'SYSTEM',
        text: `❌ Error communicating with agent: ${e.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (productName: string) => {
    handleSendMessage(`Add ${productName} to my cart`);
  };

  const handleProceedToCheckout = () => {
    handleSendMessage('Proceed to checkout');
  };

  const handleTriggerPayment = async (orderId: string, total: number) => {
    try {
      const res = await triggerPayment(orderId);
      const payMsg: ChatMessage = {
        id: `pay-${Date.now()}`,
        sender: 'PAYMENT_SERVICE',
        text: `🎉 **Razorpay Payment Authorized!**\n\nOrder of ₹${Number(total).toLocaleString('en-IN')} processed successfully!\nPayment ID: \`${res.razorpay_order_id || 'RZP_DEMO_9823'}\``,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, payMsg]);
      voiceService.speak(`Payment of ₹${total} authorized successfully.`);
    } catch (e: any) {
      alert(`Payment error: ${e.message}`);
    }
  };

  const handleMemoryReplay = async () => {
    if (!sessionId) return;
    try {
      const audit = await getAuditLogs(sessionId);
      const logs = audit.audit_logs || [];
      const auditMsg: ChatMessage = {
        id: `audit-${Date.now()}`,
        sender: 'AUDIT_LOGGER',
        text: `📼 **Session Audit Trail (${logs.length} events logged)**\n\n` +
          logs.map((l: any) => `${l.decision === 'APPROVED' ? '✅' : l.decision === 'REJECTED' ? '❌' : 'ℹ️'} [${l.actor}] ${l.action} → ${l.reason || ''}`).join('\n'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, auditMsg]);
    } catch (e: any) {
      alert(`Audit error: ${e.message}`);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-[#0a0e1a] text-slate-100 overflow-hidden font-sans">
      {/* 1. Top Header Bar */}
      <TopBar sessionId={sessionId} onMemoryReplay={handleMemoryReplay} />

      {/* 2. Main Middle Workspace (Split: Left Phaser 2D Office | Right React Command Center) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: 2D Pixel Office Canvas */}
        <div className="w-full lg:w-[54%] h-1/2 lg:h-full border-r border-[#1f283d] relative">
          <PhaserOffice currentAgent={currentAgent} lastMessage={lastMessage} />
        </div>

        {/* Right: Command Center Terminal & Chat Stream */}
        <div className="w-full lg:w-[46%] h-1/2 lg:h-full">
          <CommandCenter
            messages={messages}
            currentAgent={currentAgent}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onAddToCart={handleAddToCart}
            onProceedToCheckout={handleProceedToCheckout}
            onTriggerPayment={handleTriggerPayment}
            auditLogs={auditLogs}
          />
        </div>
      </div>

      {/* 3. Bottom Telemetry Bar (6 Retro-Cream Cards) */}
      <BottomTelemetryBar statusData={statusData} />
    </div>
  );
};
