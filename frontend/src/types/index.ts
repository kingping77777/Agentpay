export type AgentRole = 'SALES_AGENT' | 'MERCHANT_AGENT' | 'AUTHORITY_AGENT' | 'SYSTEM_MONITOR' | 'PAYMENT_SERVICE' | 'AUDIT_LOGGER' | 'USER';

export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  currency: string;
  description?: string;
  in_stock: boolean;
  stock: number;
  image_url?: string;
  rating?: number;
  specifications?: Record<string, string>;
}

export interface PolicyCheck {
  rule: string;
  passed: boolean;
  value?: any;
  threshold?: any;
  detail?: string;
}

export interface ValidationResult {
  approved: boolean;
  reason: string;
  checks: PolicyCheck[];
  requires_authorization?: boolean;
}

export interface A2ADialogue {
  from: AgentRole;
  to: AgentRole;
  message: string;
  timestamp?: string;
}

export interface WebResult {
  title: string;
  snippet: string;
  source: string;
}

export interface ChatMessage {
  id: string;
  sender: AgentRole | 'YOU' | 'SYSTEM';
  text: string;
  timestamp: string;
  products?: Product[];
  validation?: ValidationResult;
  policy_checks?: PolicyCheck[];
  a2a_dialogue?: A2ADialogue[];
  web_results?: WebResult[];
  order_id?: string;
  order_total?: number;
}

export interface AgentCardData {
  id: string;
  name: string;
  model: string;
  focus: string;
  status: 'online' | 'active' | 'busy' | 'offline';
  color: 'green' | 'amber' | 'purple' | 'blue';
  avatarEmoji: string;
  tasks: number;
  memoryPct: number;
}

export interface ServiceCardData {
  id: string;
  name: string;
  model: string;
  focus: string;
  status: 'online' | 'active';
  color: 'green' | 'amber' | 'blue';
  avatarEmoji: string;
  metric1: { label: string; val: string | number; pct: number };
  metric2: { label: string; val: string | number; pct: number };
}
