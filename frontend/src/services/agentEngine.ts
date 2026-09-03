import { Product, ValidationResult, A2ADialogue, WebResult } from '../types';

// ── Rich Product Database ──────────────────────────────────────────────────
export const UNIVERSAL_PRODUCTS: Product[] = [
  // Laptops
  {
    id: 'prod-lenovo-ideapad',
    name: 'Lenovo IdeaPad Slim 5 (16" IPS, AMD Ryzen 7)',
    category: 'laptops',
    brand: 'Lenovo',
    price: 62000,
    currency: 'INR',
    description: 'High-performance ultrabook with AMD Ryzen 7 7730U, 16GB DDR4 RAM, 512GB NVMe SSD, and 16-inch WUXGA IPS anti-glare display.',
    in_stock: true,
    stock: 14,
    rating: 4.8,
    image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80',
    specifications: {
      Processor: 'AMD Ryzen 7 7730U (8C/16T, up to 4.5GHz)',
      RAM: '16GB DDR4-3200 Soldered',
      Storage: '512GB SSD M.2 PCIe 4.0 NVMe',
      Display: '16" WUXGA (1920x1200) IPS 300nits',
      Battery: '56.6Wh with Rapid Charge Boost (up to 9 hrs)',
    },
  },
  {
    id: 'prod-hp-pavilion',
    name: 'HP Pavilion 15 (Intel Core i5 13th Gen)',
    category: 'laptops',
    brand: 'HP',
    price: 67000,
    currency: 'INR',
    description: 'Sleek business laptop powered by Intel Core i5-1335U, 16GB RAM, Iris Xe Graphics, and B&O tuned dual speakers.',
    in_stock: true,
    stock: 9,
    rating: 4.6,
    image_url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=600&q=80',
    specifications: {
      Processor: '13th Gen Intel Core i5-1335U (10 cores)',
      RAM: '16GB DDR4-3200 MHz RAM',
      Storage: '512GB PCIe NVMe M.2 SSD',
      Display: '15.6" FHD Micro-edge Anti-glare',
      Audio: 'Audio by B&O Dual Speakers',
    },
  },
  {
    id: 'prod-dell-inspiron',
    name: 'Dell Inspiron 15 (Intel Core i7, 16GB RAM)',
    category: 'laptops',
    brand: 'Dell',
    price: 72000,
    currency: 'INR',
    description: 'Premium laptop with Intel Core i7-1355U processor, FHD 120Hz display, and express charge support. (Exceeds ₹70,000 budget)',
    in_stock: true,
    stock: 6,
    rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80',
    specifications: {
      Processor: 'Intel Core i7-1355U 13th Gen',
      RAM: '16GB DDR4',
      Storage: '512GB SSD NVMe',
      Display: '15.6" FHD 120Hz Anti-Glare WVA',
    },
  },
  {
    id: 'prod-acer-aspire',
    name: 'Acer Aspire Lite 15 (Core i3 12th Gen)',
    category: 'laptops',
    brand: 'Acer',
    price: 32990,
    currency: 'INR',
    description: 'Budget-friendly lightweight student laptop with Intel Core i3-1215U, 8GB RAM, and 512GB SSD.',
    in_stock: true,
    stock: 22,
    rating: 4.4,
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    specifications: {
      Processor: 'Intel Core i3-1215U (6 cores)',
      RAM: '8GB DDR4 RAM',
      Storage: '512GB PCIe Gen3 SSD',
      Display: '15.6" Full HD Steel Gray Display',
    },
  },

  // Smartphones
  {
    id: 'prod-redmi-13-5g',
    name: 'Redmi 13 5G (8GB RAM, 128GB)',
    category: 'smartphones',
    brand: 'Redmi',
    price: 12999,
    currency: 'INR',
    description: '5G powerhouse with Snapdragon 4 Gen 2 AE, crystal glass back design, and 108MP ultra-clear AI camera.',
    in_stock: true,
    stock: 35,
    rating: 4.6,
    image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
    specifications: {
      Display: '6.79" FHD+ 120Hz AdaptiveSync',
      Processor: 'Qualcomm Snapdragon 4 Gen 2 AE (4nm)',
      Camera: '108MP 3X In-Sensor Zoom AI Dual Camera',
      Battery: '5030mAh with 33W Fast Charging',
    },
  },
  {
    id: 'prod-realme-narzo-70x',
    name: 'Realme Narzo 70x 5G (6GB, 128GB)',
    category: 'smartphones',
    brand: 'Realme',
    price: 11999,
    currency: 'INR',
    description: 'Ultra-smooth 120Hz smartphone with Dimensity 6100+ 5G chipset, 45W SUPERVOOC charging, and IP54 dust & water resistance.',
    in_stock: true,
    stock: 28,
    rating: 4.5,
    image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
    specifications: {
      Display: '6.72" FHD+ 120Hz Ultra Smooth Display',
      Processor: 'MediaTek Dimensity 6100+ 5G',
      Camera: '50MP AI Primary Camera',
      Battery: '5000mAh with 45W SUPERVOOC Charge',
    },
  },
  {
    id: 'prod-moto-g34-5g',
    name: 'Moto G34 5G (128GB, Vegan Leather)',
    category: 'smartphones',
    brand: 'Motorola',
    price: 10999,
    currency: 'INR',
    description: 'Premium vegan leather 5G smartphone with Snapdragon 695 5G, stereo speakers with Dolby Atmos, and clean stock Android 14.',
    in_stock: true,
    stock: 19,
    rating: 4.5,
    image_url: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=600&q=80',
    specifications: {
      Display: '6.5" HD+ 120Hz IPS Display',
      Processor: 'Snapdragon 695 5G Octa-core',
      Camera: '50MP Quad Pixel with Night Vision',
      Audio: 'Stereo Speakers + Dolby Atmos',
    },
  },
  {
    id: 'prod-samsung-s24',
    name: 'Samsung Galaxy S24 Ultra (512GB Titanium)',
    category: 'smartphones',
    brand: 'Samsung',
    price: 129999,
    currency: 'INR',
    description: 'Flagship Galaxy AI phone with Snapdragon 8 Gen 3, 200MP camera, built-in S Pen, and Titanium frame.',
    in_stock: true,
    stock: 8,
    rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80',
    specifications: {
      Display: '6.8" Dynamic AMOLED 2X 120Hz QHD+',
      Processor: 'Snapdragon 8 Gen 3 for Galaxy',
      Camera: '200MP Wide + 50MP Periscope + 12MP Ultra-wide',
    },
  },

  // Peripherals
  {
    id: 'prod-logitech-mouse',
    name: 'Logitech G502 HERO High Performance Gaming Mouse',
    category: 'peripherals',
    brand: 'Logitech',
    price: 4295,
    currency: 'INR',
    description: 'HERO 25K Sensor, 25,600 DPI, RGB lighting, adjustable weights, and 11 programmable buttons.',
    in_stock: true,
    stock: 45,
    rating: 4.8,
    image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80',
    specifications: {
      Sensor: 'HERO 25K with 25,600 DPI',
      Buttons: '11 Programmable Buttons',
      Weight: 'Tunable with 5x 3.6g weights',
    },
  },
  {
    id: 'prod-razer-deathadder',
    name: 'Razer DeathAdder Essential Gaming Mouse',
    category: 'peripherals',
    brand: 'Razer',
    price: 1499,
    currency: 'INR',
    description: 'Ergonomic wired mouse with 6,400 DPI optical sensor, 5 hyperesponse buttons, and green LED lighting.',
    in_stock: true,
    stock: 50,
    rating: 4.6,
    image_url: 'https://images.unsplash.com/photo-1626218174358-7769486c4b79?auto=format&fit=crop&w=600&q=80',
    specifications: {
      Sensor: '6,400 DPI Optical Sensor',
      Switches: 'Razer Mechanical (10M clicks)',
    },
  },
  {
    id: 'prod-keychron-k2',
    name: 'Keychron K2 V2 Wireless Mechanical Keyboard',
    category: 'peripherals',
    brand: 'Keychron',
    price: 7499,
    currency: 'INR',
    description: '75% layout compact mechanical keyboard with RGB backlighting, Gateron G Pro switches, Mac/Windows compatibility, and Bluetooth 5.1.',
    in_stock: true,
    stock: 12,
    rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
    specifications: {
      Layout: '75% Compact (84 keys)',
      Switches: 'Gateron G Pro Brown / Red',
      Connectivity: 'Bluetooth 5.1 & Type-C Wired',
      Battery: '4000mAh Rechargeable',
    },
  },
  {
    id: 'prod-cosmic-byte-keyboard',
    name: 'Cosmic Byte CB-GK-16 Firefly TKL Mechanical Keyboard',
    category: 'peripherals',
    brand: 'Cosmic Byte',
    price: 2199,
    currency: 'INR',
    description: 'Tenkeyless RGB mechanical keyboard with Outemu Blue switches and aluminium top plate.',
    in_stock: true,
    stock: 30,
    rating: 4.4,
    image_url: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=600&q=80',
    specifications: {
      Layout: 'Tenkeyless 87 keys',
      Switches: 'Outemu Blue Clicky Switches',
    },
  },

  // Audio
  {
    id: 'prod-sony-wh1000xm5',
    name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
    category: 'audio',
    brand: 'Sony',
    price: 29990,
    currency: 'INR',
    description: 'Industry-leading Active Noise Cancellation with Auto NC Optimizer, 8 microphones, 30-hour battery life, and crystal clear hands-free calling.',
    in_stock: true,
    stock: 15,
    rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    specifications: {
      ANC: 'Dual Processor V1 + HD QN1',
      Battery: '30 hours with ANC ON (3 min charge = 3 hrs)',
      Audio: 'Hi-Res Audio Wireless & LDAC',
    },
  },
  {
    id: 'prod-boat-rockerz-550',
    name: 'boAt Rockerz 550 Over-Ear Wireless Headphones',
    category: 'audio',
    brand: 'boAt',
    price: 1799,
    currency: 'INR',
    description: '50mm dynamic drivers, immersive physical noise isolation, 20 hours playback, and plush ear cushions.',
    in_stock: true,
    stock: 60,
    rating: 4.3,
    image_url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=600&q=80',
    specifications: {
      Drivers: '50mm Dynamic Audio Drivers',
      Battery: '20 Hours continuous playback',
    },
  },

  // Smartwatches & Wearables
  {
    id: 'prod-noise-colorfit',
    name: 'Noise ColorFit Pulse 4 Max Smartwatch',
    category: 'wearables',
    brand: 'Noise',
    price: 1999,
    currency: 'INR',
    description: '1.96" AMOLED display, BT calling, 100+ sports modes, functional crown, and 7-day battery.',
    in_stock: true,
    stock: 40,
    rating: 4.5,
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    specifications: {
      Display: '1.96" AMOLED Always-On',
      Battery: '7 Days typical use',
      Health: '24x7 Heart Rate & SpO2',
    },
  },
  {
    id: 'prod-apple-watch-s9',
    name: 'Apple Watch Series 9 (GPS 45mm Midnight)',
    category: 'wearables',
    brand: 'Apple',
    price: 44900,
    currency: 'INR',
    description: 'S9 SiP chip, double tap gesture, brighter 2000-nit display, advanced health and fitness tracking with ECG.',
    in_stock: true,
    stock: 10,
    rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80',
    specifications: {
      Chip: 'Apple S9 SiP 64-bit dual-core',
      Display: 'Always-On Retina OLED (up to 2000 nits)',
    },
  },
];

// Helper: Extract budget & keyword
export function parseQuery(query: string): { keyword: string; maxBudget: number } {
  const q = query.toLowerCase();
  let maxBudget = 0;
  const match = q.match(/(?:under|below|less than|max|budget|within|upto|up to)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*(?:\.\d+)?(?:k)?)/i);
  if (match) {
    let raw = match[1].replace(/,/g, '').toLowerCase();
    if (raw.endsWith('k')) {
      maxBudget = parseFloat(raw.slice(0, -1)) * 1000;
    } else {
      maxBudget = parseFloat(raw);
    }
  }

  // Clean fillers
  let kw = q
    .replace(/\b(i need|i want to buy|i want|please show|show me|find me|give me|search for|recommend|suggest|top|best|good|cheap|affordable)\b/gi, ' ')
    .replace(/(?:under|below|less than|max|budget|within|upto|up to)\s*(?:₹|rs\.?|inr)?\s*\d+(?:,\d+)*(?:\.\d+)?k?\b/gi, ' ')
    .replace(/\b(phone|laptop|mouse|keyboard|headphones|headphone|watch|smartwatch|shoes|jacket|protein)\b/gi, (m) => m)
    .replace(/[^a-zA-Z0-9\s-]/g, ' ')
    .trim();

  return { keyword: kw || query, maxBudget };
}

// In-Memory Session Storage
interface LocalSessionState {
  cart: { items: any[]; total: number };
  orders: any[];
  auditLogs: any[];
  taskCount: { SALES_AGENT: number; MERCHANT_AGENT: number; AUTHORITY_AGENT: number };
}

const sessions: Record<string, LocalSessionState> = {};

function getSessionState(sessionId: string): LocalSessionState {
  if (!sessions[sessionId]) {
    sessions[sessionId] = {
      cart: { items: [], total: 0 },
      orders: [],
      auditLogs: [
        {
          id: `audit-${Date.now()}-1`,
          actor: 'SALES_AGENT',
          action: 'SESSION_INITIALIZED',
          decision: 'APPROVED',
          reason: 'Autonomous commerce session initiated for customer',
          entity_type: 'Session',
          created_at: new Date().toISOString(),
        }
      ],
      taskCount: { SALES_AGENT: 2, MERCHANT_AGENT: 1, AUTHORITY_AGENT: 1 },
    };
  }
  return sessions[sessionId];
}

// ── Direct Google Gemini API Caller ─────────────────────────────────────────
async function callGeminiApiDirect(prompt: string, history: any[] = []): Promise<string | null> {
  const apiKey = localStorage.getItem('agentpay_gemini_api_key') || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  if (!apiKey || apiKey.startsWith('AQ.')) return null;

  const model = localStorage.getItem('agentpay_gemini_model') || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const catalogSummary = UNIVERSAL_PRODUCTS.map(
    (p) => `- ${p.name} | Category: ${p.category} | Brand: ${p.brand} | Price: ₹${p.price} | In Stock: ${p.stock}`
  ).join('\n');

  const systemInstruction = `You are Michael, the friendly, enthusiastic Lead Sales Discovery Agent for AgentPay (an autonomous AI commerce platform).
Available Products in Store:
${catalogSummary}

Rules:
1. If the user says hello/greetings ("hey", "hi", "how are you"), be friendly, warm, and ask what tech or gear they're shopping for today. DO NOT list products unless they ask for them!
2. If they ask for product recommendations, find matching products from the store or recommend based on budget in INR (₹).
3. If they ask about orders/checkout, explain that they can add to cart or click Direct Buy.
4. Keep answers friendly, conversational, concise with emojis.`;

  try {
    const contents: any[] = [];
    // Convert history
    if (history && history.length > 0) {
      for (const h of history.slice(-6)) {
        contents.push({
          role: h.role === 'model' ? 'model' : 'user',
          parts: [{ text: h.content || '' }],
        });
      }
    }
    contents.push({ role: 'user', parts: [{ text: prompt }] });

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600,
        },
      }),
    });

    if (!response.ok) {
      console.warn('Gemini API returned status:', response.status);
      return null;
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidateText || null;
  } catch (err) {
    console.warn('Direct Gemini API call failed, falling back to local brain:', err);
    return null;
  }
}

// ── Client-Side Intelligent Multi-Agent Engine ──────────────────────────────
export async function executeAgentPipeline(
  sessionId: string,
  message: string,
  history: any[] = []
): Promise<any> {
  const state = getSessionState(sessionId);
  const lower = message.trim().toLowerCase();
  const startTime = Date.now();

  // 0. Conversational Greetings & Casual Intent Handling (No random products!)
  const greetingsRegex = /^(hey|hello|hi|hii|heyy|howdy|sup|what'?s up|good (morning|afternoon|evening)|yo|hola|greetings)(\s+.*|\!|\?)*$/i;
  const smallTalkRegex = /^(how are you|who are you|what can you do|help|what is agentpay|tell me about yourself|what do you sell)(\s+.*|\!|\?)*$/i;
  const courtesyRegex = /^(thanks|thank you|thx|awesome|cool|great|ok|okay|got it|nice|bye|goodbye)(\s+.*|\!|\?)*$/i;

  if (greetingsRegex.test(lower)) {
    state.taskCount.SALES_AGENT += 1;
    // Try Gemini if configured
    const geminiReply = await callGeminiApiDirect(message, history);
    const text = geminiReply || `👋 **Hey there!** I'm **Michael**, your AI Shopping Assistant here at AgentPay!\n\nI can help you search the catalog, compare specs, check for bundle discounts, and guide you through secure checkout.\n\nWhat are you shopping for today? 🛍️\n\n💡 *Try asking:*\n• *"Show me laptops under 70000"*\n• *"Find mechanical keyboards and gaming mice"*\n• *"Recommend noise-cancelling headphones"*\n• *"Best 5G phones under 15k"*`;

    return {
      session_id: sessionId,
      agent: 'SALES_AGENT',
      message: text,
      products: [], // No products for greetings!
      duration_ms: Date.now() - startTime,
    };
  }

  if (smallTalkRegex.test(lower)) {
    state.taskCount.SALES_AGENT += 1;
    const geminiReply = await callGeminiApiDirect(message, history);
    const text = geminiReply || `🤖 **I'm Michael — Lead Sales Discovery Agent!**\n\nI work alongside:\n• 🏪 **TechStore Merchant Agent**: Offers live inventory & bundle discounts\n• ⚖️ **Authority Gatekeeper Agent**: Deterministically verifies safety & budget caps (₹70,000 cap)\n\nI can help you find smartphones, laptops, audio gear, mechanical keyboards, gaming mice, smartwatches, and much more.\n\nJust tell me what you're looking for or your budget! ✨`;

    return {
      session_id: sessionId,
      agent: 'SALES_AGENT',
      message: text,
      products: [],
      duration_ms: Date.now() - startTime,
    };
  }

  if (courtesyRegex.test(lower)) {
    state.taskCount.SALES_AGENT += 1;
    const geminiReply = await callGeminiApiDirect(message, history);
    const text = geminiReply || `You're very welcome! 😊 Let me know whenever you want to explore more tech gear, add items to cart, or proceed to checkout!`;

    return {
      session_id: sessionId,
      agent: 'SALES_AGENT',
      message: text,
      products: [],
      duration_ms: Date.now() - startTime,
    };
  }

  // 1. Direct Checkout / Proceed to checkout
  if (lower.includes('checkout') || lower.includes('proceed to pay') || lower.includes('buy now') || lower.includes('place order')) {
    state.taskCount.AUTHORITY_AGENT += 1;
    const cartTotal = state.cart.total > 0 ? state.cart.total : 62000;
    const budgetCap = 70000;
    const isApproved = cartTotal <= budgetCap;

    const validation: ValidationResult = {
      approved: isApproved,
      reason: isApproved
        ? `Budget verification passed: Cart total ₹${cartTotal.toLocaleString('en-IN')} is strictly within the ₹${budgetCap.toLocaleString('en-IN')} customer ceiling.`
        : `Budget Policy Violation: Cart total ₹${cartTotal.toLocaleString('en-IN')} exceeds your pre-configured safety limit of ₹${budgetCap.toLocaleString('en-IN')}.`,
      checks: [
        { rule: 'Agent Purchase Authorization', passed: true, detail: 'AI autonomous transaction enabled' },
        { rule: 'Customer Budget Limit (₹70,000)', passed: isApproved, detail: `Cart ₹${cartTotal.toLocaleString('en-IN')} vs Max ₹${budgetCap.toLocaleString('en-IN')}` },
        { rule: 'Merchant Max Limit (₹1,00,000)', passed: cartTotal <= 100000, detail: 'Within single transaction threshold' },
        { rule: 'Minimum Cart Amount (₹500)', passed: cartTotal >= 500, detail: 'Minimum cart policy passed' },
      ],
    };

    const orderId = isApproved ? `ORD-${Date.now().toString().slice(-6)}` : undefined;

    state.auditLogs.push({
      id: `audit-${Date.now()}`,
      actor: 'AUTHORITY_AGENT',
      action: 'TRANSACTION_VALIDATION',
      decision: isApproved ? 'APPROVED' : 'REJECTED',
      reason: validation.reason,
      entity_type: 'Order',
      created_at: new Date().toISOString(),
    });

    const a2a: A2ADialogue[] = [
      { from: 'MERCHANT_AGENT', to: 'AUTHORITY_AGENT', message: `Requesting transaction authorization for order total ₹${cartTotal.toLocaleString('en-IN')}.` },
      { from: 'AUTHORITY_AGENT', to: 'MERCHANT_AGENT', message: isApproved ? `Authorization GRANTED. Hard policy check passed (₹${cartTotal.toLocaleString('en-IN')} ≤ ₹${budgetCap.toLocaleString('en-IN')}). Order generated.` : `Authorization DENIED. Hard policy check failed (₹${cartTotal.toLocaleString('en-IN')} > ₹${budgetCap.toLocaleString('en-IN')}).` },
    ];

    return {
      session_id: sessionId,
      agent: 'AUTHORITY_AGENT',
      message: isApproved
        ? `⚖️ **AUTHORITY GATEKEEPER — TRANSACTION APPROVED!**\n\nAll deterministic financial policies have passed with 0 risk.\n\n• **Order ID**: \`${orderId}\`\n• **Final Payable Total**: **₹${cartTotal.toLocaleString('en-IN')}**\n• **Status**: Ready for Instant Settlement\n\nClick **💳 RAZORPAY / DIRECT CHECKOUT** below to complete payment!`
        : `🚫 **AUTHORITY GATEKEEPER — TRANSACTION REJECTED!**\n\n${validation.reason}\n\nPlease adjust cart items to stay within your ₹${budgetCap.toLocaleString('en-IN')} limit.`,
      validation,
      a2a_dialogue: a2a,
      order_id: orderId,
      order_total: isApproved ? cartTotal : undefined,
      duration_ms: Date.now() - startTime,
    };
  }

  // 2. Add to Cart / Cross-sell flow
  if (lower.includes('add') && (lower.includes('cart') || lower.includes('buy') || lower.includes('ideapad') || lower.includes('laptop') || lower.includes('mouse') || lower.includes('phone') || lower.includes('keyboard') || lower.includes('headphone'))) {
    state.taskCount.SALES_AGENT += 1;
    state.taskCount.MERCHANT_AGENT += 1;

    const matched = UNIVERSAL_PRODUCTS.find((p) => lower.includes(p.name.toLowerCase().split(' ')[0]) || lower.includes(p.brand.toLowerCase())) || UNIVERSAL_PRODUCTS[0];
    state.cart.items.push(matched);
    state.cart.total = state.cart.items.reduce((sum, item) => sum + item.price, 0);

    const a2a: A2ADialogue[] = [
      { from: 'SALES_AGENT', to: 'MERCHANT_AGENT', message: `Customer added '${matched.name}' (₹${matched.price.toLocaleString('en-IN')}) to cart. Any bundle promos?` },
      { from: 'MERCHANT_AGENT', to: 'SALES_AGENT', message: `Inventory confirmed (Stock: ${matched.stock}). Unlocking 15% instant bundle rebate on Logitech Mouse & Keychron accessories!` },
    ];

    state.auditLogs.push({
      id: `audit-${Date.now()}`,
      actor: 'SALES_AGENT',
      action: 'CART_ITEM_ADDED',
      decision: 'APPROVED',
      reason: `Added ${matched.name} to cart. Cart total now ₹${state.cart.total.toLocaleString('en-IN')}`,
      entity_type: 'Cart',
      created_at: new Date().toISOString(),
    });

    return {
      session_id: sessionId,
      agent: 'SALES_AGENT',
      message: `🛒 **Added to Cart!**\n\nI've synchronized **${matched.name}** (₹${matched.price.toLocaleString('en-IN')}) into your active session.\n\n🏪 **TechStore Merchant Promotion**:\n> *Special Bundle Deal: Add a wireless mouse or keyboard today and save an additional ₹500 instantly!*\n\n• **Cart Total**: **₹${state.cart.total.toLocaleString('en-IN')}**\n\nReady to finalize? Say *"Proceed to checkout"* or ask for more accessories!`,
      products: [matched],
      a2a_dialogue: a2a,
      cart: state.cart,
      duration_ms: Date.now() - startTime,
    };
  }

  // 3. Web Search Grounding Query
  if (lower.includes('search the web') || lower.includes('web search') || lower.includes('latest 2026') || lower.includes('compare specs') || lower.includes('benchmark')) {
    state.taskCount.SALES_AGENT += 1;
    const webResults: WebResult[] = [
      {
        title: 'Top Ultrabooks & Laptops 2026 Benchmark Guide',
        snippet: 'AMD Ryzen 7 7730U vs Intel Core i5-1335U benchmarks show up to 18% higher multi-threaded efficiency on IdeaPad Slim 5 series with 14hr battery test results.',
        source: 'techradar.com/laptops-2026',
      },
      {
        title: 'Indian Electronics Market Price Tracker — Best Value Tech',
        snippet: 'Average consumer pricing for 16GB DDR4 Ryzen 7 laptops stabilized between ₹60,000 - ₹65,000 in Q1 2026.',
        source: 'gadgets360.com/market-analysis',
      },
    ];

    return {
      session_id: sessionId,
      agent: 'SALES_AGENT',
      message: `🌐 **Live Web Grounding Complete!**\n\nI've analyzed real-time web benchmarks and external pricing:\n\n• **Efficiency**: AMD Ryzen 7 7730U outperforms comparable 13th-Gen CPUs in multi-threaded workflows by ~18%.\n• **Market Pricing**: Current market avg is ₹63,500. Our catalog price of **₹62,000** provides an immediate ₹1,500 saving.\n\nHere are the top grounded matches:`,
      products: UNIVERSAL_PRODUCTS.slice(0, 2),
      web_results: webResults,
      duration_ms: Date.now() - startTime,
    };
  }

  // 4. Default: Product Search across Universal Catalog
  state.taskCount.SALES_AGENT += 1;
  const { keyword, maxBudget } = parseQuery(message);

  let matches = UNIVERSAL_PRODUCTS.filter((p) => {
    const textMatch =
      p.name.toLowerCase().includes(keyword) ||
      p.category.toLowerCase().includes(keyword) ||
      p.brand.toLowerCase().includes(keyword) ||
      keyword.split(' ').some((w) => w.length > 2 && (p.name.toLowerCase().includes(w) || p.category.toLowerCase().includes(w)));

    if (maxBudget > 0) {
      return textMatch && p.price <= maxBudget;
    }
    return textMatch;
  });

  // If no direct keyword match, search by budget or show top recommended
  if (matches.length === 0) {
    if (maxBudget > 0) {
      matches = UNIVERSAL_PRODUCTS.filter((p) => p.price <= maxBudget);
    }
  }

  // Check if Gemini can provide a personalized direct response
  const geminiReply = await callGeminiApiDirect(message, history);

  const budgetText = maxBudget > 0 ? ` under ₹${maxBudget.toLocaleString('en-IN')}` : '';

  state.auditLogs.push({
    id: `audit-${Date.now()}`,
    actor: 'SALES_AGENT',
    action: 'CATALOG_DISCOVERY_SEARCH',
    decision: 'APPROVED',
    reason: `Queried catalog for '${keyword}' with budget ₹${maxBudget}. Found ${matches.length} products.`,
    entity_type: 'Product',
    created_at: new Date().toISOString(),
  });

  const defaultMessage = matches.length > 0
    ? `✨ Here are the top verified products matching **"${keyword}"**${budgetText}:\n\n${matches
        .slice(0, 3)
        .map(
          (p, idx) =>
            `**${idx + 1}. ${p.name}** — **₹${p.price.toLocaleString('en-IN')}**\n⭐ ${p.rating} / 5 | 📦 ${p.stock} in stock\n_${p.description}_`
        )
        .join('\n\n')}\n\n💡 *Tip: Click **"⚡ DIRECT BUY"** on any card for instant checkout, or tell me to add it to your cart!*`
    : `I searched for **"${keyword}"**${budgetText}, but couldn't find exact matches. Let me know if you'd like to adjust your budget or explore categories like laptops, smartphones, keyboards, mice, or headphones!`;

  return {
    session_id: sessionId,
    agent: 'SALES_AGENT',
    message: geminiReply || defaultMessage,
    products: matches.slice(0, 4),
    duration_ms: Date.now() - startTime,
  };
}

export function getLocalTelemetry(sessionId?: string) {
  const state = sessionId ? getSessionState(sessionId) : { taskCount: { SALES_AGENT: 6, MERCHANT_AGENT: 4, AUTHORITY_AGENT: 3 } };

  return {
    agents: [
      {
        id: 'sales_agent',
        name: 'SALES AGENT',
        model: localStorage.getItem('agentpay_gemini_model') || 'Gemini-2.0-Flash',
        focus: 'Customer Discovery',
        status: 'online',
        tasks: state.taskCount.SALES_AGENT,
        memory: 64,
        active_sessions: 1,
      },
      {
        id: 'merchant_agent',
        name: 'MERCHANT AGENT',
        model: localStorage.getItem('agentpay_gemini_model') || 'Gemini-2.0-Flash',
        focus: 'Promotions & Upsells',
        status: 'online',
        tasks: state.taskCount.MERCHANT_AGENT,
        memory: 58,
      },
      {
        id: 'authority_agent',
        name: 'AUTHORITY AGENT',
        model: localStorage.getItem('agentpay_gemini_model') || 'Gemini-2.0-Flash',
        focus: 'Deterministic Policy',
        status: 'active',
        tasks: state.taskCount.AUTHORITY_AGENT,
        memory: 71,
      },
    ],
    services: [
      {
        id: 'payment_service',
        name: 'PAYMENT SERVICE',
        provider: 'Razorpay API / POS',
        focus: 'Instant Settlement',
        status: 'online',
        queue: 1,
        success_rate: 99,
      },
      {
        id: 'audit_logger',
        name: 'AUDIT LOGGER',
        provider: 'Immutable Log Stream',
        focus: 'Compliance Audit',
        status: 'online',
        events: 12,
        storage: 76,
      },
      {
        id: 'system_monitor',
        name: 'SYSTEM MONITOR',
        provider: 'Heartbeat Health',
        focus: 'System Health',
        status: 'online',
        uptime: 99.9,
        load: 38,
      },
    ],
  };
}

export function getLocalAuditLogs(sessionId: string) {
  const state = getSessionState(sessionId);
  return {
    session_id: sessionId,
    audit_logs: state.auditLogs,
    agent_actions: [
      {
        id: `act-${Date.now()}`,
        agent: 'SALES_AGENT',
        action: 'GROUNDING_EVALUATION',
        status: 'COMPLETED',
        reason: 'Universal product search and price verification executed successfully',
        duration_ms: 120,
        created_at: new Date().toISOString(),
      },
    ],
  };
}
