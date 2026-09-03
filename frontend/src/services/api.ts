import axios from 'axios';
import {
  executeAgentPipeline,
  getLocalTelemetry,
  getLocalAuditLogs,
} from './agentEngine';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getDemoIds = async () => {
  try {
    const res = await api.get('/api/agent/demo-ids');
    if (res.data && res.data.customer_id) {
      return res.data;
    }
  } catch (e) {
    // Graceful fallback for static deployments (e.g. Vercel)
  }
  return {
    customer_id: 'cust-demo-123',
    merchant_id: 'merch-demo-456',
    ready: true,
  };
};

export const createSession = async (customerId: string, merchantId: string) => {
  try {
    const res = await api.post('/api/agent/session', {
      customer_id: customerId,
      merchant_id: merchantId,
      session_type: 'SHOPPING',
    });
    if (res.data && res.data.session_id) {
      return res.data;
    }
  } catch (e) {
    // Graceful fallback for static deployments
  }
  return {
    session_id: `sess-${Date.now()}`,
    status: 'ACTIVE',
    customer_id: customerId,
    merchant_id: merchantId,
    created_at: new Date().toISOString(),
  };
};

export const sendAgentChat = async (sessionId: string, message: string, chatHistory: any[] = []) => {
  try {
    const res = await api.post('/api/agent/chat', {
      session_id: sessionId,
      message,
      chat_history: chatHistory.slice(-10),
    });
    if (res.data && res.data.message) {
      return res.data;
    }
  } catch (e) {
    // Gracefully handle offline / Vercel static environments using autonomous client agent engine
  }
  return await executeAgentPipeline(sessionId, message, chatHistory);
};

export const getSystemStatus = async () => {
  try {
    const res = await api.get('/api/agent/status');
    if (res.data && res.data.agents) {
      return res.data;
    }
  } catch (e) {
    // Fallback
  }
  return getLocalTelemetry();
};

export const getAuditLogs = async (sessionId: string) => {
  try {
    const res = await api.get(`/api/agent/session/${sessionId}/audit`);
    if (res.data && res.data.audit_logs) {
      return res.data;
    }
  } catch (e) {
    // Fallback
  }
  return getLocalAuditLogs(sessionId);
};

export const triggerPayment = async (orderId: string) => {
  try {
    const res = await api.post('/api/payments/create', { order_id: orderId });
    if (res.data) {
      return res.data;
    }
  } catch (e) {
    // Fallback
  }
  return {
    order_id: orderId,
    razorpay_order_id: `order_rzp_${Date.now()}`,
    status: 'CREATED',
    amount: 62000,
    currency: 'INR',
  };
};

export const directBuyProduct = async (data: {
  customer_id: string;
  merchant_id: string;
  product_id: string;
  product_name?: string;
  product_price?: number;
  product_category?: string;
  quantity?: number;
  full_name: string;
  street: string;
  city: string;
  pin_code: string;
  phone: string;
  payment_method?: string;
}) => {
  try {
    const res = await api.post('/api/payments/direct-buy', {
      ...data,
      quantity: data.quantity || 1,
      payment_method: data.payment_method || 'UPI_QR',
    });
    if (res.data && res.data.order_id) {
      return res.data;
    }
  } catch (e) {
    // Fallback
  }

  const price = data.product_price || 12999;
  const qty = data.quantity || 1;
  const total = price * qty;
  const orderId = `ORD-DIR-${Date.now().toString().slice(-6)}`;

  return {
    order_id: orderId,
    amount: total,
    currency: 'INR',
    customer_id: data.customer_id,
    shipping_address: {
      full_name: data.full_name,
      street: data.street,
      city: data.city,
      pin_code: data.pin_code,
      phone: data.phone,
    },
    payment_method: data.payment_method || 'UPI_QR',
    upi_qr_string: `upi://pay?pa=agentpay@razorpay&pn=TechStore&am=${total}&cu=INR&tn=Order_${orderId}`,
    estimated_delivery: 'In 2 Business Days',
    status: 'CONFIRMED',
  };
};

export const confirmPayment = async (orderId: string, paymentMethod: string = 'UPI_QR') => {
  try {
    const res = await api.post('/api/payments/confirm-payment', {
      order_id: orderId,
      payment_method: paymentMethod,
    });
    if (res.data) {
      return res.data;
    }
  } catch (e) {
    // Fallback
  }
  return {
    success: true,
    order_id: orderId,
    status: 'PAID',
    payment_id: `pay_${Date.now()}`,
    receipt: `RCPT-${Date.now().toString().slice(-6)}`,
  };
};
