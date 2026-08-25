/**
 * AgentPay Command Center — app.js
 * Handles API communication, clock, character animations, chat, and status cards.
 */

const API = 'http://localhost:8000';

// ─── State ────────────────────────────────────────────────────────────────────
const state = {
  sessionId: null,
  customerId: null,
  merchantId: null,
  chatHistory: [],
  currentAgent: 'SALES_AGENT',
  isLoading: false,
};

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const chatLog        = document.getElementById('chat-log');
const chatInput      = document.getElementById('chat-input');
const btnSend        = document.getElementById('btn-send');
const typingIndicator= document.getElementById('typing-indicator');
const typingLabel    = document.getElementById('typing-agent-label');
const sessionBadge   = document.getElementById('session-badge-id');
const clockEl        = document.getElementById('clock');
const activeAvatar   = document.getElementById('active-agent-avatar');
const activeName     = document.getElementById('active-agent-name');
const activeRole     = document.getElementById('active-agent-role');

// ─── Clock ────────────────────────────────────────────────────────────────────
function updateClock() {
  const now  = new Date();
  let h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  clockEl.textContent = `⏰ ${pad(h)}:${pad(m)}:${pad(s)} ${ampm}`;
}
const pad = n => String(n).padStart(2,'0');
setInterval(updateClock, 1000);
updateClock();

// ─── Tab switching ────────────────────────────────────────────────────────────
document.querySelectorAll('.cc-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.cc-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
  });
});

// ─── Init: load demo IDs + create session ────────────────────────────────────
async function init() {
  try {
    const res  = await fetch(`${API}/api/agent/demo-ids`);
    const data = await res.json();
    if (!data.ready) {
      appendMessage('SYSTEM', 'system',
        '⚠️ Demo data not found. Run: python scripts/seed.py\n\nThen refresh this page.');
      return;
    }
    state.customerId = data.customer_id;
    state.merchantId = data.merchant_id;

    // Create session
    const sRes = await fetch(`${API}/api/agent/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: state.customerId,
        merchant_id: state.merchantId,
        session_type: 'SHOPPING',
      }),
    });
    const session = await sRes.json();
    state.sessionId = session.session_id;

    const short = state.sessionId.slice(0, 8).toUpperCase();
    sessionBadge.textContent = `#AGP-${short}`;

    appendMessage('SALES_AGENT', 'sales',
      `✅ Session created!\nSession: #AGP-${short}\n\nI'm your Sales Agent. What would you like to shop for today?`);

    // Load status cards
    await loadStatusCards();
  } catch (e) {
    appendMessage('SYSTEM', 'system',
      `⚠️ Cannot reach backend at ${API}\n\nStart the server: uvicorn app.main:app --reload`);
  }
}

// ─── Send message ─────────────────────────────────────────────────────────────
async function sendMessage() {
  const msg = chatInput.value.trim();
  if (!msg || state.isLoading || !state.sessionId) return;

  chatInput.value = '';
  state.isLoading = true;
  btnSend.disabled = true;

  // show user message
  appendMessage('You', 'user', msg);
  state.chatHistory.push({ role: 'user', content: msg });

  // show typing
  showTyping('Agents thinking...');

  try {
    const res = await fetch(`${API}/api/agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: state.sessionId,
        message: msg,
        chat_history: state.chatHistory.slice(-10),
      }),
    });
    const data = await res.json();
    hideTyping();

    state.currentAgent = data.agent || 'SALES_AGENT';
    updateActiveAgent(state.currentAgent);
    animateAgent(state.currentAgent, msg, data.message);

    appendMessage(data.agent, agentClass(data.agent), data.message, data.products, data.validation);

    if (data.message) {
      state.chatHistory.push({ role: 'model', content: data.message });
    }

    // if order created, show payment button
    if (data.order_id) {
      appendPaymentAction(data.order_id, data.order_total);
    }

    // refresh status cards
    await loadStatusCards();

  } catch (e) {
    hideTyping();
    appendMessage('SYSTEM', 'system', `❌ Error: ${e.message}`);
  }

  state.isLoading = false;
  btnSend.disabled = false;
  chatInput.focus();
}

// ─── Chat UI helpers ──────────────────────────────────────────────────────────
function agentClass(agent) {
  if (!agent) return 'sales';
  const map = {
    SALES_AGENT: 'sales',
    MERCHANT_AGENT: 'merchant',
    AUTHORITY_AGENT: 'authority',
    SYSTEM: 'sales',
  };
  return map[agent] || 'sales';
}

function appendMessage(agentName, cls, text, products = [], validation = null) {
  const div = document.createElement('div');
  div.className = 'msg';

  const now = new Date().toLocaleTimeString();
  const isUser = cls === 'user';

  div.innerHTML = `
    <div class="msg-header">
      <span class="msg-agent-badge badge-${cls}">${isUser ? 'YOU' : agentName}</span>
      <span>${now}</span>
    </div>
    <div class="msg-body ${isUser ? 'user-msg' : ''}">${escHtml(text)}</div>
  `;

  // product grid
  if (products && products.length > 0) {
    const grid = document.createElement('div');
    grid.className = 'product-grid';
    products.forEach(p => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <div class="product-card-name">${escHtml(p.name)}</div>
        <div class="product-card-brand">${escHtml(p.brand || '')}</div>
        <div class="product-card-price">₹${Number(p.price).toLocaleString('en-IN')}</div>
        <div class="product-card-stock">${p.in_stock ? '✅ In Stock' : '❌ Out of Stock'} (${p.stock})</div>
      `;
      card.addEventListener('click', () => {
        chatInput.value = `Add "${p.name}" to my cart`;
        chatInput.focus();
      });
      grid.appendChild(card);
    });
    div.appendChild(grid);
  }

  // validation checks
  if (validation && validation.checks) {
    const box = document.createElement('div');
    box.className = 'validation-checks';
    box.innerHTML = '<div style="font-family:var(--pixel);font-size:7px;color:var(--dim);margin-bottom:6px">POLICY CHECKS</div>';
    validation.checks.forEach(c => {
      const row = document.createElement('div');
      row.className = `check-item ${c.passed ? 'check-pass' : 'check-fail'}`;
      row.innerHTML = `${c.passed ? '✅' : '❌'} <span>${c.rule}</span>: <span style="color:var(--dim)">${c.detail || ''}</span>`;
      box.appendChild(row);
    });
    div.appendChild(box);
  }

  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function appendPaymentAction(orderId, total) {
  const div = document.createElement('div');
  div.className = 'msg';
  div.innerHTML = `
    <div class="msg-header"><span class="msg-agent-badge badge-authority">PAYMENT</span></div>
    <div class="msg-body">
      <button onclick="triggerPayment('${orderId}', ${total})"
        style="font-family:var(--pixel);font-size:8px;background:var(--green);color:black;border:none;padding:10px 20px;border-radius:4px;cursor:pointer;margin-top:6px">
        💳 PAY ₹${Number(total).toLocaleString('en-IN')} via Razorpay
      </button>
    </div>
  `;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function showTyping(label = 'Agent thinking...') {
  typingLabel.textContent = label;
  typingIndicator.classList.add('visible');
  chatLog.scrollTop = chatLog.scrollHeight;
}

function hideTyping() {
  typingIndicator.classList.remove('visible');
}

function escHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\n/g,'<br>').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
    .replace(/`(.*?)`/g,'<code style="background:var(--panel2);padding:1px 4px;border-radius:3px">$1</code>');
}

// ─── Active agent header update ───────────────────────────────────────────────
const AGENT_META = {
  SALES_AGENT:    { emoji:'🛒', name:'SALES AGENT',     role:'Michael | Customer Discovery' },
  MERCHANT_AGENT: { emoji:'🏪', name:'MERCHANT AGENT',  role:'TechStore | Promotions & Upsell' },
  AUTHORITY_AGENT:{ emoji:'⚖️', name:'AUTHORITY AGENT', role:'Policy Enforcement | Gatekeeper' },
};
function updateActiveAgent(agent) {
  const meta = AGENT_META[agent] || AGENT_META.SALES_AGENT;
  activeAvatar.textContent = meta.emoji;
  activeName.textContent   = meta.name;
  activeRole.textContent   = meta.role;
}

// ─── Character speech bubbles ─────────────────────────────────────────────────
const BUBBLE_MESSAGES = {
  SALES_AGENT: [
    'Searching products...', 'Found some great deals!', 'Let me check the catalog...',
    'Adding to your cart!', 'Great choice!', 'Here are my recommendations...'
  ],
  MERCHANT_AGENT: [
    'Checking promotions...', 'Bundle deals available!', 'Let me check merchant policy...',
    'Upsell opportunity detected!', 'Active offers found!'
  ],
  AUTHORITY_AGENT: [
    'Validating order...', 'Checking budget limit...', 'Running policy checks...',
    'Order APPROVED ✓', 'All constraints verified!'
  ],
};
const CHAR_BUBBLE_MAP = {
  SALES_AGENT:    'bubble-sales',
  MERCHANT_AGENT: 'bubble-merchant-agent',
  AUTHORITY_AGENT:'bubble-authority',
};
function animateAgent(agent, userMsg, agentMsg) {
  const bubbleId = CHAR_BUBBLE_MAP[agent];
  if (!bubbleId) return;
  const bubble = document.getElementById(bubbleId);
  if (!bubble) return;

  const msgs = BUBBLE_MESSAGES[agent] || ['Processing...'];
  bubble.textContent = msgs[Math.floor(Math.random() * msgs.length)];
  bubble.classList.add('visible');

  // customer bubble
  const custBubble = document.getElementById('bubble-customer');
  if (custBubble) {
    custBubble.textContent = userMsg.slice(0,30) + (userMsg.length>30?'...':'');
    custBubble.classList.add('visible');
    setTimeout(() => custBubble.classList.remove('visible'), 3000);
  }

  setTimeout(() => bubble.classList.remove('visible'), 4000);
}

// ─── Status cards ─────────────────────────────────────────────────────────────
async function loadStatusCards() {
  try {
    const res  = await fetch(`${API}/api/agent/status`);
    const data = await res.json();
    renderStatusCards(data);
  } catch (e) {
    renderOfflineCards();
  }
}

function renderStatusCards(data) {
  const bar = document.getElementById('bottom-bar');
  bar.innerHTML = '';

  const agentCards = [
    {
      emoji: '🛒', name: 'SALES AGENT', model: 'Gemini-1.5-Flash',
      focus: 'Customer Needs', status: 'online', color: 'green',
      stat1: { label: 'Tasks', val: data.agents[0]?.tasks || 0, pct: Math.min(100, (data.agents[0]?.tasks||0)*10), barClass: 'bar-green' },
      stat2: { label: 'Memory', val: `${data.agents[0]?.memory||62}%`, pct: data.agents[0]?.memory||62, barClass: 'bar-green' },
    },
    {
      emoji: '🏪', name: 'MERCHANT AGENT', model: 'Gemini-1.5-Flash',
      focus: 'Merchant Policy', status: 'online', color: 'green',
      stat1: { label: 'Tasks', val: data.agents[1]?.tasks || 0, pct: Math.min(100,(data.agents[1]?.tasks||0)*10), barClass: 'bar-amber' },
      stat2: { label: 'Memory', val: `${data.agents[1]?.memory||58}%`, pct: data.agents[1]?.memory||58, barClass: 'bar-green' },
    },
    {
      emoji: '⚖️', name: 'AUTHORITY AGENT', model: 'Gemini-1.5-Flash',
      focus: 'Validation & Policy', status: 'active', color: 'purple',
      stat1: { label: 'Tasks', val: data.agents[2]?.tasks || 0, pct: Math.min(100,(data.agents[2]?.tasks||0)*10), barClass: 'bar-purple' },
      stat2: { label: 'Memory', val: `${data.agents[2]?.memory||71}%`, pct: data.agents[2]?.memory||71, barClass: 'bar-green' },
    },
    {
      emoji: '💳', name: 'PAYMENT SERVICE', model: 'Razorpay API',
      focus: 'Transactions', status: 'online', color: 'green',
      stat1: { label: 'Queue', val: data.services[0]?.queue || 0, pct: Math.min(100,(data.services[0]?.queue||0)*10), barClass: 'bar-amber' },
      stat2: { label: 'Success', val: `${data.services[0]?.success_rate||99}%`, pct: data.services[0]?.success_rate||99, barClass: 'bar-green' },
    },
    {
      emoji: '📋', name: 'AUDIT LOGGER', model: 'System Logger',
      focus: 'Audit Trail', status: 'online', color: 'green',
      stat1: { label: 'Events', val: data.services[1]?.events || 0, pct: Math.min(100,(data.services[1]?.events||0)*2), barClass: 'bar-blue' },
      stat2: { label: 'Storage', val: `${data.services[1]?.storage||74}%`, pct: data.services[1]?.storage||74, barClass: 'bar-green' },
    },
    {
      emoji: '🖥️', name: 'SYSTEM MONITOR', model: 'Health Check',
      focus: 'System Health', status: 'online', color: 'green',
      stat1: { label: 'Uptime', val: `${data.services[2]?.uptime||99.9}%`, pct: data.services[2]?.uptime||99.9, barClass: 'bar-green' },
      stat2: { label: 'Load', val: `${data.services[2]?.load||42}%`, pct: data.services[2]?.load||42, barClass: 'bar-amber' },
    },
  ];

  agentCards.forEach(card => {
    const ledClass = card.color === 'purple' ? 'led-purple' : card.color === 'amber' ? 'led-amber' : 'led-green';
    const statusText = card.status === 'active' ? 'Active' : 'Online';

    const el = document.createElement('div');
    el.className = 'agent-card';
    el.innerHTML = `
      <div class="agent-card-header">
        <div class="agent-avatar" style="background:var(--panel2);border:1px solid var(--border)">${card.emoji}</div>
        <div class="agent-card-info">
          <div class="agent-card-name">${card.name}</div>
          <div class="agent-card-model">${card.model}</div>
          <div class="agent-card-focus">Focus: ${card.focus}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:3px">
          <div class="agent-led ${ledClass}"></div>
          <div class="led-status" style="color:var(--${card.color === 'purple' ? 'purple' : 'green'})">${statusText}</div>
        </div>
      </div>
      <div class="stat-row">
        <span class="stat-label">${card.stat1.label}</span>
        <span class="stat-val">${card.stat1.val}</span>
        <div class="bar-track"><div class="bar-fill ${card.stat1.barClass}" style="width:${card.stat1.pct}%"></div></div>
      </div>
      <div class="stat-row">
        <span class="stat-label">${card.stat2.label}</span>
        <span class="stat-val">${card.stat2.val}</span>
        <div class="bar-track"><div class="bar-fill ${card.stat2.barClass}" style="width:${card.stat2.pct}%"></div></div>
      </div>
    `;
    bar.appendChild(el);
  });
}

function renderOfflineCards() {
  const bar = document.getElementById('bottom-bar');
  bar.innerHTML = `<div style="grid-column:1/-1;display:flex;align-items:center;justify-content:center;color:var(--dim);font-size:11px">⚠️ Backend offline — start uvicorn to see live agent status</div>`;
}

// ─── Payment trigger ──────────────────────────────────────────────────────────
window.triggerPayment = async (orderId, total) => {
  try {
    const res  = await fetch(`${API}/api/payments/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId }),
    });
    const data = await res.json();

    if (data.demo_mode) {
      appendMessage('PAYMENT SERVICE', 'authority',
        `🎉 **Demo Mode Payment**\n\nOrder ₹${Number(total).toLocaleString('en-IN')} processed successfully!\n\nRazorpay Order ID: \`${data.razorpay_order_id}\`\n\n(Add real Razorpay keys in .env for live payments)`);
    } else {
      // Real Razorpay checkout
      const opts = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        order_id: data.razorpay_order_id,
        name: 'AgentPay',
        description: 'AI Commerce Order',
        handler: function(response) {
          appendMessage('PAYMENT SERVICE', 'authority',
            `✅ Payment successful!\n\nPayment ID: \`${response.razorpay_payment_id}\`\nOrder: \`${response.razorpay_order_id}\``);
        },
      };
      if (typeof Razorpay !== 'undefined') {
        new Razorpay(opts).open();
      } else {
        appendMessage('PAYMENT SERVICE', 'authority',
          `💳 Razorpay Order created!\nID: \`${data.razorpay_order_id}\`\nAmount: ₹${Number(total).toLocaleString('en-IN')}`);
      }
    }
  } catch(e) {
    appendMessage('SYSTEM', 'system', `❌ Payment error: ${e.message}`);
  }
};

// ─── Memory Replay ────────────────────────────────────────────────────────────
document.getElementById('memory-replay').addEventListener('click', async () => {
  if (!state.sessionId) return;
  try {
    const res  = await fetch(`${API}/api/agent/session/${state.sessionId}/audit`);
    const data = await res.json();
    const logs = data.audit_logs || [];
    if (!logs.length) {
      appendMessage('SYSTEM', 'system', 'No audit trail yet. Start chatting!');
      return;
    }
    let txt = `📼 **Session Audit Trail**\n\n`;
    logs.forEach(l => {
      const icon = l.decision === 'APPROVED' ? '✅' : l.decision === 'REJECTED' ? '❌' : 'ℹ️';
      txt += `${icon} [${l.actor}] ${l.action}\n`;
      if (l.reason) txt += `   → ${l.reason.slice(0,80)}\n`;
    });
    appendMessage('AUDIT LOGGER', 'authority', txt);
  } catch(e) {
    appendMessage('SYSTEM', 'system', `Audit error: ${e.message}`);
  }
});

// ─── Event listeners ──────────────────────────────────────────────────────────
btnSend.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});

// Periodic status refresh
setInterval(loadStatusCards, 30_000);

// ─── Boot ─────────────────────────────────────────────────────────────────────
init();
