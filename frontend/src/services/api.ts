import axios from 'axios';

const API_BASE = ''; // Uses relative URLs with Vite proxy in dev & root serving in prod

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getDemoIds = async () => {
  const res = await api.get('/api/agent/demo-ids');
  return res.data;
};

export const createSession = async (customerId: string, merchantId: string) => {
  const res = await api.post('/api/agent/session', {
    customer_id: customerId,
    merchant_id: merchantId,
    session_type: 'SHOPPING',
  });
  return res.data;
};

export const sendAgentChat = async (sessionId: string, message: string, chatHistory: any[] = []) => {
  const res = await api.post('/api/agent/chat', {
    session_id: sessionId,
    message,
    chat_history: chatHistory.slice(-10),
  });
  return res.data;
};

export const getSystemStatus = async () => {
  const res = await api.get('/api/agent/status');
  return res.data;
};

export const getAuditLogs = async (sessionId: string) => {
  const res = await api.get(`/api/agent/session/${sessionId}/audit`);
  return res.data;
};

export const triggerPayment = async (orderId: string) => {
  const res = await api.post('/api/payments/create', { order_id: orderId });
  return res.data;
};
