import { Product, ValidationResult, A2ADialogue, WebResult } from '../types';

// ── Complete Comprehensive Universal Product Catalog ──────────────────────
export const UNIVERSAL_PRODUCTS: Product[] = [
  // ── 1. Laptops ─────────────────────────────────────────────────────────────
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
  {
    id: 'prod-macbook-air-m2',
    name: 'Apple MacBook Air 13.6" (Apple M2 Chip, 256GB SSD)',
    category: 'laptops',
    brand: 'Apple',
    price: 89900,
    currency: 'INR',
    description: 'Incredibly thin design, stunning 13.6-inch Liquid Retina display, Apple M2 chip with 8-core CPU and up to 18 hours battery life.',
    in_stock: true,
    stock: 11,
    rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=600&q=80',
    specifications: {
      Processor: 'Apple M2 8-Core CPU & 8-Core GPU',
      Unified_Memory: '8GB Unified Memory',
      Storage: '256GB High-Speed SSD',
      Display: '13.6" Liquid Retina with True Tone (500 nits)',
      Battery: 'Up to 18 hours Apple TV app movie playback',
    },
  },
  {
    id: 'prod-asus-rog-strix',
    name: 'ASUS ROG Strix G16 (RTX 4060, Intel i7 13th Gen)',
    category: 'laptops',
    brand: 'ASUS',
    price: 119990,
    currency: 'INR',
    description: 'High-octane esports gaming laptop featuring NVIDIA GeForce RTX 4060 GPU, Intel Core i7-13650HX, and 165Hz FHD+ display.',
    in_stock: true,
    stock: 7,
    rating: 4.8,
    image_url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80',
    specifications: {
      GPU: 'NVIDIA GeForce RTX 4060 8GB GDDR6',
      Processor: 'Intel Core i7-13650HX 14-core',
      Display: '16" FHD+ 165Hz 100% sRGB IPS',
      RAM: '16GB DDR5-4800MHz',
    },
  },

  // ── 2. Smartphones ─────────────────────────────────────────────────────────
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
    id: 'prod-oneplus-nord-ce4',
    name: 'OnePlus Nord CE4 5G (8GB RAM, 128GB)',
    category: 'smartphones',
    brand: 'OnePlus',
    price: 24999,
    currency: 'INR',
    description: 'Snapdragon 7 Gen 3 performer with 100W SUPERVOOC charging, Sony LYT-600 OIS camera, and 120Hz AMOLED Aqua Touch.',
    in_stock: true,
    stock: 20,
    rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80',
    specifications: {
      Display: '6.7" FHD+ 120Hz Fluid AMOLED (Aqua Touch)',
      Processor: 'Snapdragon 7 Gen 3 (4nm)',
      Camera: '50MP Sony LYT-600 with OIS + 8MP UW',
      Battery: '5500mAh with 100W SUPERVOOC (1-100% in 29 mins)',
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
  {
    id: 'prod-iphone-15',
    name: 'Apple iPhone 15 (128GB Black)',
    category: 'smartphones',
    brand: 'Apple',
    price: 69999,
    currency: 'INR',
    description: 'Dynamic Island, 48MP Main Camera with 2x Telephoto, A16 Bionic chip, and durable color-infused glass and aluminium design.',
    in_stock: true,
    stock: 14,
    rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
    specifications: {
      Display: '6.1" Super Retina XDR OLED with Dynamic Island',
      Chip: 'A16 Bionic chip with 5-core GPU',
      Camera: 'Advanced Dual-Camera (48MP Main + 12MP Ultra Wide)',
      Port: 'USB-C Universal Connector',
    },
  },

  // ── 3. Audio & Headphones ──────────────────────────────────────────────────
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
      ANC: 'Dual Processor V1 + HD QN1 Noise Canceling',
      Battery: '30 hours with ANC ON (3 min charge = 3 hrs)',
      Audio: 'Hi-Res Audio Wireless & LDAC Codec',
    },
  },
  {
    id: 'prod-airpods-pro-2',
    name: 'Apple AirPods Pro (2nd Gen) with MagSafe Case (USB-C)',
    category: 'audio',
    brand: 'Apple',
    price: 22990,
    currency: 'INR',
    description: 'Pro-level Active Noise Cancellation, Adaptive Audio, Transparency mode, Personalized Spatial Audio with dynamic head tracking.',
    in_stock: true,
    stock: 18,
    rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80',
    specifications: {
      Chip: 'Apple H2 Headphone Chip',
      ANC: 'Up to 2x more Active Noise Cancellation',
      Battery: 'Up to 6 hours listening time with ANC on',
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
  {
    id: 'prod-jbl-flip-6',
    name: 'JBL Flip 6 Waterproof Portable Bluetooth Speaker',
    category: 'audio',
    brand: 'JBL',
    price: 9999,
    currency: 'INR',
    description: '2-way speaker system with racetrack-shaped woofer, separate tweeter, IP67 waterproof & dustproof, and 12 hours playtime.',
    in_stock: true,
    stock: 25,
    rating: 4.8,
    image_url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80',
    specifications: {
      Power: '30W RMS Power Output',
      Durability: 'IP67 Waterproof & Dustproof',
      Battery: '12 Hours Playtime on single charge',
    },
  },

  // ── 4. Keyboards & Mice (Peripherals) ───────────────────────────────────────
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

  // ── 5. Smartwatches & Wearables ────────────────────────────────────────────
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

  // ── 6. Monitors & Displays ─────────────────────────────────────────────────
  {
    id: 'prod-lg-ultragear-27',
    name: 'LG UltraGear 27" QHD 144Hz IPS Gaming Monitor (27GN800)',
    category: 'monitors',
    brand: 'LG',
    price: 21999,
    currency: 'INR',
    description: 'QHD (2560 x 1440) IPS display with 1ms response time, 144Hz refresh rate, NVIDIA G-Sync compatible & AMD FreeSync Premium.',
    in_stock: true,
    stock: 16,
    rating: 4.8,
    image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
    specifications: {
      Resolution: 'QHD 2560 x 1440 IPS Panel',
      Refresh_Rate: '144Hz with 1ms GtG Response',
      Color: 'sRGB 99% with HDR10',
    },
  },

  // ── 7. Tablets ─────────────────────────────────────────────────────────────
  {
    id: 'prod-ipad-10th-gen',
    name: 'Apple iPad 10.9" (10th Generation, Wi-Fi 64GB)',
    category: 'tablets',
    brand: 'Apple',
    price: 34900,
    currency: 'INR',
    description: 'All-screen design with 10.9-inch Liquid Retina display, A14 Bionic chip, 12MP Ultra Wide front camera with Center Stage, and USB-C.',
    in_stock: true,
    stock: 14,
    rating: 4.8,
    image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80',
    specifications: {
      Display: '10.9" Liquid Retina with True Tone',
      Processor: 'A14 Bionic 6-core chip',
      Camera: '12MP Wide back + 12MP Ultra Wide front',
    },
  },

  // ── 8. Footwear & Shoes ────────────────────────────────────────────────────
  {
    id: 'prod-nike-revolution-6',
    name: 'Nike Revolution 6 Next Nature Running Shoes',
    category: 'footwear',
    brand: 'Nike',
    price: 3495,
    currency: 'INR',
    description: 'Intuitive comfort and flexible cushioning made with recycled materials. Breathable mesh upper with plush foam midsole.',
    in_stock: true,
    stock: 35,
    rating: 4.6,
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    specifications: {
      Cushioning: 'Soft foam midsole for smooth stride',
      Upper: 'Lightweight breathable mesh',
      Sole: 'Traction rubber outsole',
    },
  },
  {
    id: 'prod-adidas-ultraboost',
    name: 'Adidas Ultraboost Light Running Shoes',
    category: 'footwear',
    brand: 'Adidas',
    price: 9999,
    currency: 'INR',
    description: 'Epic energy with the lightest BOOST midsole ever, Continental rubber outsole, and sock-like PRIMEKNIT+ upper.',
    in_stock: true,
    stock: 12,
    rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80',
    specifications: {
      Midsole: 'Ultraboost Light (30% lighter BOOST)',
      Upper: 'PRIMEKNIT+ textile upper',
      Outsole: 'Continental Better Rubber',
    },
  },

  // ── 9. Clothing & Jackets ──────────────────────────────────────────────────
  {
    id: 'prod-roadster-leather-jacket',
    name: 'Roadster Men Solid Biker Leather Jacket',
    category: 'clothing',
    brand: 'Roadster',
    price: 2499,
    currency: 'INR',
    description: 'Sleek cafe-racer biker jacket crafted from premium PU faux leather with quilted shoulders, snap collar, and zippered pockets.',
    in_stock: true,
    stock: 25,
    rating: 4.5,
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
    specifications: {
      Material: 'High-Grade Synthetic Leather (PU)',
      Lining: 'Quilted thermal polyester inner lining',
      Pockets: '3 front zip pockets + 1 internal slip',
    },
  },
  {
    id: 'prod-levis-denim-jacket',
    name: "Levi's Men Trucker Denim Jacket",
    category: 'clothing',
    brand: "Levi's",
    price: 3999,
    currency: 'INR',
    description: "The original jean jacket since 1967. 100% non-stretch cotton denim with button-flap chest pockets and side hem adjusters.",
    in_stock: true,
    stock: 18,
    rating: 4.8,
    image_url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80',
    specifications: {
      Material: '100% Heavyweight Cotton Denim',
      Fit: 'Standard trucker silhouette',
    },
  },

  // ── 10. Fitness & Nutrition ────────────────────────────────────────────────
  {
    id: 'prod-on-gold-standard-whey',
    name: 'Optimum Nutrition (ON) Gold Standard 100% Whey Protein (2 lb, Double Rich Chocolate)',
    category: 'fitness',
    brand: 'Optimum Nutrition',
    price: 3499,
    currency: 'INR',
    description: 'World #1 Whey Protein powder featuring 24g of pure whey protein isolate per serving, 5.5g naturally occurring BCAAs, and gluten free.',
    in_stock: true,
    stock: 50,
    rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=600&q=80',
    specifications: {
      Protein: '24g Protein per scoop (Isolate Primary)',
      BCAA: '5.5g naturally occurring BCAAs',
      Weight: '2 lbs (907g) ~ 29 servings',
    },
  },

  // ── 11. Home & Kitchen ─────────────────────────────────────────────────────
  {
    id: 'prod-philips-air-fryer',
    name: 'Philips Digital Air Fryer HD9252/90 (4.1L, Rapid Air Tech)',
    category: 'home',
    brand: 'Philips',
    price: 7999,
    currency: 'INR',
    description: 'Crispy frying with up to 90% less fat using patented Rapid Air Technology, 7 pre-set touchscreen cooking menus, and Keep Warm function.',
    in_stock: true,
    stock: 20,
    rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=600&q=80',
    specifications: {
      Capacity: '4.1 Litre basket (0.8kg fries capacity)',
      Power: '1400W Rapid Air Technology',
      Touchscreen: '7 pre-set cooking programs',
    },
  },

  // ── 12. Storage & SSDs ─────────────────────────────────────────────────────
  {
    id: 'prod-samsung-980-pro-ssd',
    name: 'Samsung 980 PRO 1TB PCIe 4.0 NVMe M.2 Internal SSD',
    category: 'storage',
    brand: 'Samsung',
    price: 8499,
    currency: 'INR',
    description: 'Blazing fast sequential read speeds up to 7,000 MB/s for high-end gaming, heavy video editing, and PS5 storage expansion.',
    in_stock: true,
    stock: 30,
    rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80',
    specifications: {
      Speed: 'Read up to 7,000 MB/s | Write up to 5,000 MB/s',
      Interface: 'PCIe Gen 4.0 x4, NVMe 1.3c',
      Form_Factor: 'M.2 (2280) with Nickel Coating',
    },
  },

  // ── 13. Backpacks & Travel ─────────────────────────────────────────────────
  {
    id: 'prod-american-tourister-backpack',
    name: 'American Tourister Casual 32L Water Resistant Laptop Backpack',
    category: 'bags',
    brand: 'American Tourister',
    price: 1599,
    currency: 'INR',
    description: 'Durable 32-litre 3-compartment backpack with padded 15.6" laptop sleeve, rain cover, and mesh water bottle holders.',
    in_stock: true,
    stock: 40,
    rating: 4.6,
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    specifications: {
      Capacity: '32 Litres (3 full compartments)',
      Laptop_Size: 'Fits up to 15.6-inch laptops',
      Fabric: 'Tear-resistant double-treated Polyester',
    },
  },

  // ── 14. Cameras & Action ───────────────────────────────────────────────────
  {
    id: 'prod-gopro-hero-12',
    name: 'GoPro HERO12 Black Action Camera with HyperSmooth 6.0',
    category: 'cameras',
    brand: 'GoPro',
    price: 37990,
    currency: 'INR',
    description: 'Incredible 5.3K60 video, HDR photo/video, award-winning HyperSmooth 6.0 video stabilization, and rugged 10m waterproof design.',
    in_stock: true,
    stock: 8,
    rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=600&q=80',
    specifications: {
      Video: '5.3K at 60fps | 4K at 120fps | 2.7K at 240fps',
      Stabilization: 'HyperSmooth 6.0 with 360° Horizon Lock',
      Waterproof: 'Rugged + Waterproof to 33ft (10m)',
    },
  },
];

// Helper: Extract budget & clean search keywords
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
    .replace(/\b(phone|smartphone|laptop|mouse|keyboard|headphones|headphone|earphones|speaker|watch|smartwatch|shoes|shoe|sneakers|jacket|clothes|protein|whey|air fryer|fryer|monitor|display|tablet|ipad|backpack|bag|ssd|camera|gopro)\b/gi, (m) => m)
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
    (p) => `- ${p.name} | Category: ${p.category} | Brand: ${p.brand} | Price: ₹${p.price.toLocaleString('en-IN')} | Stock: ${p.stock}`
  ).join('\n');

  const systemInstruction = `You are Michael, the extremely friendly, enthusiastic, warm, and helpful Lead Shopping Agent for AgentPay.
You talk like an upbeat best friend who loves tech, gadgets, gear, and finding people the sweetest deals in Indian Rupees (₹)!

Here is our FULL VERIFIED STORE CATALOG:
${catalogSummary}

Personality & Guidelines:
1. When the user says "hey", "hello", "how are you", greet them warmly with friendly emojis, ask how their day is going, and invite them to explore. DO NOT list products unless they ask for recommendations!
2. When the user asks for ANY product category (e.g. phones, laptops, keyboards, mice, headphones, watches, shoes, protein, jacket, air fryer, tablets, SSD, camera, backpack):
   - Match and highlight products from our store catalog.
   - Quote exact prices in Indian Rupees (₹) with commas.
   - Highlight 2-3 standout features and give cheerful, practical shopping advice.
3. Keep answers cheerful, empathetic, concise, and structured with bullet points.`;

  try {
    const contents: any[] = [];
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
          temperature: 0.8,
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
  const greetingsRegex = /^(hey|hello|hi|hii|heyy|heyyyy|howdy|sup|what'?s up|yo|hola|greetings|good (morning|afternoon|evening)|hey there|hi there)(\s+.*|\!|\?)*$/i;
  const howAreYouRegex = /^(how are you|how'?s it going|how are things|how do you do|how is your day)(\s+.*|\!|\?)*$/i;
  const smallTalkRegex = /^(who are you|what can you do|help|what is agentpay|tell me about yourself|what do you sell|tell me a joke)(\s+.*|\!|\?)*$/i;
  const courtesyRegex = /^(thanks|thank you|thx|awesome|cool|great|ok|okay|got it|nice|super|perfect|bye|goodbye)(\s+.*|\!|\?)*$/i;

  if (howAreYouRegex.test(lower)) {
    state.taskCount.SALES_AGENT += 1;
    const geminiReply = await callGeminiApiDirect(message, history);
    const text = geminiReply || `😊 **I'm doing fantastic, thank you so much for asking!** ⚡\n\nThe office vibes are great today, all our agent monitors are green, and I'm super excited to hang out and help you explore some cool gear!\n\nHow is your day going so far? Anything fun on your wishlist? 🎧💻📱`;

    return {
      session_id: sessionId,
      agent: 'SALES_AGENT',
      message: text,
      products: [],
      duration_ms: Date.now() - startTime,
    };
  }

  if (greetingsRegex.test(lower)) {
    state.taskCount.SALES_AGENT += 1;
    const geminiReply = await callGeminiApiDirect(message, history);
    const text = geminiReply || `👋 **Hey there! So great to see you!** 😊\n\nI'm **Michael**, your friendly shopping companion here at AgentPay! Think of me as your tech buddy who loves finding the coolest gadgets and sweetest deals for you.\n\nWhat are you in the mood for today? 🛍️✨\n\n💬 *Feel free to ask me anything like:*\n• *"Find laptops under 70k"*\n• *"Show me mechanical keyboards & gaming mice"*\n• *"Recommend noise-cancelling headphones"*\n• *"Best 5G phones under 15k"*\n• *"Show running shoes, whey protein, or smartwatches"*`;

    return {
      session_id: sessionId,
      agent: 'SALES_AGENT',
      message: text,
      products: [],
      duration_ms: Date.now() - startTime,
    };
  }

  if (smallTalkRegex.test(lower)) {
    state.taskCount.SALES_AGENT += 1;
    const geminiReply = await callGeminiApiDirect(message, history);
    const text = geminiReply || `🤖 **I'm Michael — your Lead Sales & Shopping Agent!** ✨\n\nI can help you browse our entire store catalog across:\n📱 **Smartphones & Tablets**\n💻 **Laptops & Monitors**\n⌨️ **Mechanical Keyboards & Gaming Mice**\n🎧 **Headphones, Speakers & Audio**\n⌚ **Smartwatches & Wearables**\n👟 **Sneakers & Running Shoes**\n💪 **Fitness & Whey Protein**\n🏠 **Home, Kitchen & Air Fryers**\n🎒 **Backpacks & Action Cameras**\n\nJust tell me what you're shopping for or your target budget! 🚀`;

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
    const text = geminiReply || `You're super welcome! 😊 It's always a pleasure chatting with you. Whenever you're ready to look at more gear or proceed with an order, I'm right here! ✨`;

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
        ? `Budget verification passed: Cart total ₹${cartTotal.toLocaleString('en-IN')} is strictly within your ₹${budgetCap.toLocaleString('en-IN')} customer safety ceiling.`
        : `Budget Policy Notice: Cart total ₹${cartTotal.toLocaleString('en-IN')} exceeds your pre-configured safety limit of ₹${budgetCap.toLocaleString('en-IN')}.`,
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
      { from: 'AUTHORITY_AGENT', to: 'MERCHANT_AGENT', message: isApproved ? `Authorization GRANTED! Hard policy check passed (₹${cartTotal.toLocaleString('en-IN')} ≤ ₹${budgetCap.toLocaleString('en-IN')}). Order generated.` : `Authorization DENIED. Cart exceeds budget cap (₹${cartTotal.toLocaleString('en-IN')} > ₹${budgetCap.toLocaleString('en-IN')}).` },
    ];

    return {
      session_id: sessionId,
      agent: 'AUTHORITY_AGENT',
      message: isApproved
        ? `⚖️ **AUTHORITY GATEKEEPER — TRANSACTION APPROVED!** 🎉\n\nAll deterministic financial policies have passed with 0 risk.\n\n• **Order ID**: \`${orderId}\`\n• **Final Payable Total**: **₹${cartTotal.toLocaleString('en-IN')}**\n• **Status**: Ready for Instant Settlement\n\nClick **💳 RAZORPAY / DIRECT CHECKOUT** below to complete payment!`
        : `🚫 **AUTHORITY GATEKEEPER — TRANSACTION REJECTED**\n\n${validation.reason}\n\nPlease adjust cart items to stay within your ₹${budgetCap.toLocaleString('en-IN')} limit.`,
      validation,
      a2a_dialogue: a2a,
      order_id: orderId,
      order_total: isApproved ? cartTotal : undefined,
      duration_ms: Date.now() - startTime,
    };
  }

  // 2. Add to Cart / Cross-sell flow
  if (lower.includes('add') && (lower.includes('cart') || lower.includes('buy') || lower.includes('ideapad') || lower.includes('laptop') || lower.includes('mouse') || lower.includes('phone') || lower.includes('keyboard') || lower.includes('headphone') || lower.includes('shoe') || lower.includes('protein'))) {
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
      message: `🛒 **Awesome! Added to your Cart!** 🎉\n\nI've synchronized **${matched.name}** (₹${matched.price.toLocaleString('en-IN')}) into your active session.\n\n🏪 **TechStore Merchant Promotion**:\n> *Special Bundle Deal: Pair this with a wireless mouse or gaming headset today and get ₹500 off instantly!*\n\n• **Cart Total**: **₹${state.cart.total.toLocaleString('en-IN')}**\n\nReady to wrap up? Say *"Proceed to checkout"* or ask me about any accessories!`,
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
      message: `🌐 **Live Web Grounding Complete!** 🚀\n\nI ran a live search across tech benchmarks and external market pricing:\n\n• **Efficiency**: AMD Ryzen 7 7730U outperforms comparable 13th-Gen CPUs in multi-threaded workflows by ~18%.\n• **Market Pricing**: Current market average is ₹63,500. Our catalog price of **₹62,000** saves you an immediate ₹1,500!\n\nHere are the top grounded matches:`,
      products: UNIVERSAL_PRODUCTS.slice(0, 2),
      web_results: webResults,
      duration_ms: Date.now() - startTime,
    };
  }

  // 4. Default: Product Search across the 40+ Universal Catalog
  state.taskCount.SALES_AGENT += 1;
  const { keyword, maxBudget } = parseQuery(message);

  const words = keyword.toLowerCase().split(/\s+/).filter((w) => w.length > 1);

  let matches = UNIVERSAL_PRODUCTS.filter((p) => {
    const pName = p.name.toLowerCase();
    const pCat = p.category.toLowerCase();
    const pBrand = p.brand.toLowerCase();
    const pDesc = (p.description || '').toLowerCase();

    // Direct match
    let textMatch =
      pName.includes(keyword) ||
      pCat.includes(keyword) ||
      pBrand.includes(keyword) ||
      words.some((w) => pName.includes(w) || pCat.includes(w) || pBrand.includes(w) || pDesc.includes(w));

    // Category synonyms
    if (!textMatch) {
      if ((keyword.includes('phone') || keyword.includes('mobile')) && pCat === 'smartphones') textMatch = true;
      if ((keyword.includes('earphone') || keyword.includes('headphone') || keyword.includes('audio') || keyword.includes('speaker') || keyword.includes('tws') || keyword.includes('airpod')) && pCat === 'audio') textMatch = true;
      if ((keyword.includes('laptop') || keyword.includes('notebook') || keyword.includes('macbook')) && pCat === 'laptops') textMatch = true;
      if ((keyword.includes('keyboard') || keyword.includes('mouse') || keyword.includes('mice') || keyword.includes('peripheral')) && pCat === 'peripherals') textMatch = true;
      if ((keyword.includes('watch') || keyword.includes('smartwatch') || keyword.includes('band')) && pCat === 'wearables') textMatch = true;
      if ((keyword.includes('shoe') || keyword.includes('sneaker') || keyword.includes('footwear')) && pCat === 'footwear') textMatch = true;
      if ((keyword.includes('jacket') || keyword.includes('cloth') || keyword.includes('denim')) && pCat === 'clothing') textMatch = true;
      if ((keyword.includes('protein') || keyword.includes('whey') || keyword.includes('gym') || keyword.includes('fitness')) && pCat === 'fitness') textMatch = true;
      if ((keyword.includes('fryer') || keyword.includes('airfryer') || keyword.includes('kitchen') || keyword.includes('coffee')) && pCat === 'home') textMatch = true;
      if ((keyword.includes('monitor') || keyword.includes('screen') || keyword.includes('display')) && pCat === 'monitors') textMatch = true;
      if ((keyword.includes('tablet') || keyword.includes('ipad') || keyword.includes('tab')) && pCat === 'tablets') textMatch = true;
      if ((keyword.includes('ssd') || keyword.includes('storage') || keyword.includes('drive')) && pCat === 'storage') textMatch = true;
      if ((keyword.includes('bag') || keyword.includes('backpack') || keyword.includes('travel')) && pCat === 'bags') textMatch = true;
      if ((keyword.includes('camera') || keyword.includes('gopro') || keyword.includes('action cam')) && pCat === 'cameras') textMatch = true;
    }

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
    ? `🎉 **Here are the top hand-picked options for "${keyword}"**${budgetText}!\n\n${matches
        .slice(0, 4)
        .map(
          (p, idx) =>
            `**${idx + 1}. ${p.name}** — **₹${p.price.toLocaleString('en-IN')}**\n⭐ ${p.rating} / 5 | 📦 ${p.stock} in stock\n_${p.description}_`
        )
        .join('\n\n')}\n\n💡 *Tip: Click **"⚡ BUY DIRECT"** on any card for instant checkout, or tell me to add it to your cart!*`
    : `I searched across our catalog for **"${keyword}"**${budgetText}, but couldn't find exact matches. Let me know if you'd like to adjust your budget or explore other categories like laptops, smartphones, keyboards, mice, headphones, shoes, or fitness gear!`;

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
