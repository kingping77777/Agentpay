"""
scripts/seed.py

Seeds the AgentPay database with an extensive, multi-category tech catalog:
- 2 users (1 merchant, 1 customer)
- 1 merchant (TechStore)
- 40+ products across Laptops, Smartphones, Headphones, Smartwatches, Monitors, Keyboards, Cameras, Gaming, Components, Tablets, Smart Home
- Full inventory tracking
- Product cross-sell & up-sell relationship graphs
- Merchant policies & active promotions
- Customer profile with ₹70,000 default budget cap
"""

import asyncio
import os
import sys
import uuid
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.db.models import (
    Cart,
    CartStatus,
    Customer,
    Inventory,
    Merchant,
    MerchantPolicy,
    MerchantStatus,
    Product,
    ProductRelation,
    Promotion,
    PromotionType,
    RelationType,
    User,
    UserRole,
)

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

import bcrypt


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


# ── Comprehensive Multi-Category Product Catalog ──────────────────────────────
PRODUCTS = [
    # ── 1. Laptops & Ultrabooks ───────────────────────────────────────────────
    {
        "name": "Lenovo IdeaPad Slim 5",
        "category": "laptops",
        "brand": "lenovo",
        "description": "Lenovo IdeaPad Slim 5 with AMD Ryzen 7 7730U, 16GB RAM, and 512GB SSD. Perfect balance of performance and battery life for productivity.",
        "price": 62_000.00,
        "sku": "LEN-IP5-R7-512",
        "specifications": {
            "processor": "AMD Ryzen 7 7730U (8 cores, up to 4.5GHz)",
            "ram": "16GB DDR4 3200MHz",
            "storage": "512GB NVMe PCIe SSD",
            "display": "15.6-inch FHD (1920x1080) IPS, 300 nits",
            "os": "Windows 11 Home",
            "battery": "56.6Wh, up to 10hrs",
            "weight": "1.89kg",
        },
        "rating": 4.6,
        "stock": 15,
    },
    {
        "name": "HP Pavilion 15",
        "category": "laptops",
        "brand": "hp",
        "description": "HP Pavilion 15 powered by Intel Core i5 13th Gen, 16GB RAM, 512GB SSD, Intel Iris Xe graphics. Slim micro-edge display with fast charging.",
        "price": 67_000.00,
        "sku": "HP-PAV15-I5-512",
        "specifications": {
            "processor": "Intel Core i5-1335U (10 cores, up to 4.6GHz)",
            "ram": "16GB DDR4 3200MHz",
            "storage": "512GB NVMe PCIe M.2 SSD",
            "display": "15.6-inch FHD IPS micro-edge, 250 nits",
            "os": "Windows 11 Home",
            "battery": "41Wh, up to 7.5hrs",
            "weight": "1.75kg",
        },
        "rating": 4.5,
        "stock": 12,
    },
    {
        "name": "Dell Inspiron 15",
        "category": "laptops",
        "brand": "dell",
        "description": "Dell Inspiron 15 with Intel Core i7 12th Gen, 16GB RAM, and 1TB SSD. Reliable build quality with high performance for creators.",
        "price": 72_000.00,
        "sku": "DEL-INS15-I7-1TB",
        "specifications": {
            "processor": "Intel Core i7-1255U (12th Gen)",
            "ram": "16GB DDR4 3200MHz",
            "storage": "1TB NVMe SSD",
            "display": "15.6-inch FHD IPS, 120Hz",
            "os": "Windows 11 Home",
            "battery": "54Wh, up to 8hrs",
            "weight": "1.73kg",
        },
        "rating": 4.4,
        "stock": 8,
    },
    {
        "name": "Apple MacBook Air M2",
        "category": "laptops",
        "brand": "apple",
        "description": "Apple MacBook Air with M2 chip, 8-core CPU, 8-core GPU, 8GB unified memory, 256GB SSD. Stunning 13.6-inch Liquid Retina display and 18-hour battery.",
        "price": 94_900.00,
        "sku": "APL-MBA-M2-256",
        "specifications": {
            "processor": "Apple M2 chip (8-core CPU, 8-core GPU)",
            "ram": "8GB Unified Memory",
            "storage": "256GB SSD",
            "display": "13.6-inch Liquid Retina, 500 nits, True Tone",
            "os": "macOS Sonoma",
            "battery": "Up to 18 hours",
            "weight": "1.24kg",
        },
        "rating": 4.9,
        "stock": 10,
    },
    {
        "name": "ASUS ROG Zephyrus G14",
        "category": "laptops",
        "brand": "asus",
        "description": "Ultra-portable compact gaming beast with AMD Ryzen 9 8945HS, NVIDIA GeForce RTX 4060, 16GB LPDDR5X RAM, 1TB SSD, 3K 120Hz OLED display.",
        "price": 149_990.00,
        "sku": "ASU-ROG-G14-4060",
        "specifications": {
            "processor": "AMD Ryzen 9 8945HS (8-core/16-thread)",
            "gpu": "NVIDIA GeForce RTX 4060 8GB GDDR6",
            "ram": "16GB LPDDR5X 6400MHz",
            "storage": "1TB PCIe 4.0 NVMe M.2 SSD",
            "display": "14.0-inch 3K (2880 x 1800) OLED 120Hz 0.2ms",
            "weight": "1.50kg",
        },
        "rating": 4.8,
        "stock": 6,
    },

    # ── 2. Wireless Headphones & Audio ────────────────────────────────────────
    {
        "name": "Sony WH-1000XM5 Wireless ANC Headphones",
        "category": "headphones",
        "brand": "sony",
        "description": "Industry leading noise canceling headphones with Auto NC Optimizer, 30-hour battery, crystal clear hands-free calling, and ultra-comfortable lightweight design.",
        "price": 28_990.00,
        "sku": "SNY-WH1000XM5-BLK",
        "specifications": {
            "type": "Over-Ear Wireless",
            "noise_cancelling": "Industry-leading Dual Processor V1 & QN1",
            "battery_life": "30 hours (ANC on), quick charge 3 min = 3 hrs",
            "driver": "30mm precision-engineered carbon fiber",
            "connectivity": "Bluetooth 5.2, LDAC, Multipoint pairing",
        },
        "rating": 4.9,
        "stock": 20,
    },
    {
        "name": "Apple AirPods Pro (2nd Gen)",
        "category": "headphones",
        "brand": "apple",
        "description": "AirPods Pro featuring H2 chip, up to 2x more Active Noise Cancellation, Adaptive Audio, Personalized Spatial Audio, and USB-C MagSafe Case.",
        "price": 24_900.00,
        "sku": "APL-APP2-USBC",
        "specifications": {
            "type": "In-Ear True Wireless",
            "chip": "Apple H2 headphone chip",
            "noise_cancelling": "Active Noise Cancellation + Transparency Mode",
            "battery_life": "6 hours single charge, 30 hours with case",
            "case": "MagSafe Case (USB-C) with Precision Finding & Speaker",
        },
        "rating": 4.8,
        "stock": 25,
    },
    {
        "name": "Bose QuietComfort 45 Headphones",
        "category": "headphones",
        "brand": "bose",
        "description": "Iconic acoustic noise cancelling headphones with TriPort acoustic architecture, volume-optimized Active EQ, and plush synthetic leather ear cushions.",
        "price": 21_900.00,
        "sku": "BOS-QC45-BLK",
        "specifications": {
            "type": "Over-Ear Wireless",
            "noise_cancelling": "Quiet Mode and Aware Mode",
            "battery_life": "22 hours per charge",
            "charging": "USB-C fast charge",
            "weight": "240g",
        },
        "rating": 4.7,
        "stock": 14,
    },
    {
        "name": "Marshall Stanmore III Bluetooth Speaker",
        "category": "audio",
        "brand": "marshall",
        "description": "Legendary Marshall home audio speaker with wide stereo soundstage, Dynamic Loudness, Bluetooth 5.2, and iconic vintage brass textured script.",
        "price": 31_999.00,
        "sku": "MSH-STAN3-BLK",
        "specifications": {
            "type": "Home Wireless Speaker",
            "power": "80W Class D amplification",
            "frequency": "45–20,000 Hz",
            "inputs": "Bluetooth 5.2, 3.5mm AUX, RCA",
        },
        "rating": 4.8,
        "stock": 9,
    },

    # ── 3. Smartphones & Flagships ────────────────────────────────────────────
    {
        "name": "Apple iPhone 15 Pro",
        "category": "smartphones",
        "brand": "apple",
        "description": "iPhone 15 Pro forged in titanium with ground-breaking A17 Pro chip, customizable Action button, 48MP Pro camera system, and USB-C with USB 3 speeds.",
        "price": 127_990.00,
        "sku": "APL-IP15P-128-NAT",
        "specifications": {
            "chip": "A17 Pro chip with 6-core GPU",
            "display": "6.1-inch Super Retina XDR OLED, ProMotion 120Hz",
            "camera": "48MP Main + 12MP Ultra Wide + 12MP 3x Telephoto",
            "material": "Aerospace-grade Titanium with textured matte glass",
            "storage": "128GB NVMe",
        },
        "rating": 4.9,
        "stock": 8,
    },
    {
        "name": "Samsung Galaxy S24 Ultra",
        "category": "smartphones",
        "brand": "samsung",
        "description": "Galaxy AI phone with Titanium frame, 200MP camera, Snapdragon 8 Gen 3 for Galaxy, built-in S Pen, and flat 6.8-inch QHD+ 120Hz Dynamic AMOLED 2X.",
        "price": 129_999.00,
        "sku": "SAM-S24U-256-GRY",
        "specifications": {
            "processor": "Snapdragon 8 Gen 3 for Galaxy",
            "ram": "12GB LPDDR5X",
            "storage": "256GB UFS 4.0",
            "display": "6.8-inch QHD+ Dynamic AMOLED 2X, 2600 nits",
            "battery": "5000mAh with 45W fast charge",
        },
        "rating": 4.9,
        "stock": 10,
    },
    {
        "name": "OnePlus 12 5G",
        "category": "smartphones",
        "brand": "oneplus",
        "description": "Flagship killer with Snapdragon 8 Gen 3, 4th Gen Hasselblad Camera for Mobile, 2K 120Hz ProXDR display, 5400mAh battery with 100W SUPERVOOC charging.",
        "price": 64_999.00,
        "sku": "OP-12-256-GRN",
        "specifications": {
            "processor": "Snapdragon 8 Gen 3 Mobile Platform",
            "ram": "12GB LPDDR5X",
            "storage": "256GB UFS 4.0",
            "display": "6.82-inch 2K 120Hz ProXDR AMOLED (4500 nits peak)",
            "charging": "100W Wired + 50W Wireless AIRVOOC",
        },
        "rating": 4.7,
        "stock": 15,
    },

    # ── 4. Smartwatches & Wearables ───────────────────────────────────────────
    {
        "name": "Apple Watch Series 9",
        "category": "smartwatches",
        "brand": "apple",
        "description": "S9 SiP chip enabling double tap gesture, 2000-nit display, advanced health sensors (ECG, Blood Oxygen, Temperature), and crash detection.",
        "price": 41_900.00,
        "sku": "APL-AWS9-45-MID",
        "specifications": {
            "case_size": "45mm Aluminum Case",
            "chip": "S9 SiP with 4-core Neural Engine",
            "display": "Always-On Retina OLED, 2000 nits",
            "sensors": "ECG, Heart Rate, SpO2, Temperature, Compass",
            "water_resistance": "50m swimproof",
        },
        "rating": 4.8,
        "stock": 16,
    },
    {
        "name": "Samsung Galaxy Watch 6 Classic",
        "category": "smartwatches",
        "brand": "samsung",
        "description": "Classic rotating bezel design, Super AMOLED sapphire crystal glass, advanced sleep coaching, BIA body composition analysis, and ECG tracking.",
        "price": 29_999.00,
        "sku": "SAM-GW6C-47-BLK",
        "specifications": {
            "size": "47mm Stainless Steel rotating bezel",
            "display": "1.5-inch Super AMOLED (480x480)",
            "sensors": "BioActive Sensor (Optical Heart + ECG + BIA)",
            "os": "Wear OS Powered by Samsung (One UI Watch 5)",
        },
        "rating": 4.6,
        "stock": 12,
    },

    # ── 5. Monitors & Displays ────────────────────────────────────────────────
    {
        "name": "LG UltraGear 27\" 4K Nano IPS Gaming Monitor",
        "category": "monitors",
        "brand": "lg",
        "description": "27-inch UHD 4K (3840x2160) Nano IPS display with 144Hz refresh rate, 1ms GtG response time, VESA DisplayHDR 600, NVIDIA G-SYNC and FreeSync Premium Pro.",
        "price": 48_999.00,
        "sku": "LG-UG27-4K-144",
        "specifications": {
            "screen_size": "27 inch Nano IPS UHD 4K (3840 x 2160)",
            "refresh_rate": "144Hz (O/C 160Hz)",
            "response_time": "1ms (GtG at Faster)",
            "hdr": "VESA DisplayHDR 600, DCI-P3 98%",
            "ports": "2x HDMI 2.1, 1x DisplayPort 1.4 with DSC, USB Hub",
        },
        "rating": 4.8,
        "stock": 10,
    },
    {
        "name": "Samsung Odyssey G7 Curved Gaming Monitor 32\"",
        "category": "monitors",
        "brand": "samsung",
        "description": "32-inch QHD (2560x1440) 1000R deep curved gaming monitor, 240Hz refresh rate, 1ms response time, Quantum Dot technology, and CoreSync lighting.",
        "price": 46_500.00,
        "sku": "SAM-ODY-G7-32",
        "specifications": {
            "screen_size": "32 inch 1000R Curvature QHD (2560 x 1440)",
            "refresh_rate": "240Hz",
            "response_time": "1ms (GtG)",
            "panel": "VA with QLED Quantum Dot",
        },
        "rating": 4.7,
        "stock": 7,
    },

    # ── 6. Mechanical Keyboards & Ergonomic Mice ──────────────────────────────
    {
        "name": "Keychron K2 Wireless Mechanical Keyboard (RGB Hot-Swap)",
        "category": "keyboards",
        "brand": "keychron",
        "description": "Compact 75% layout mechanical keyboard with hot-swappable Gateron G Pro switches, wireless Bluetooth 5.1 & Type-C wired, Mac/Windows layout support.",
        "price": 8_999.00,
        "sku": "KEY-K2-RGB-HS",
        "specifications": {
            "layout": "75% (84 keys)",
            "switches": "Gateron G Pro Brown (Hot-Swappable)",
            "backlight": "18 types of RGB backlight",
            "battery": "4000mAh rechargeable li-polymer (up to 240 hrs)",
            "connectivity": "Bluetooth 5.1 & Type-C Cable",
        },
        "rating": 4.8,
        "stock": 22,
    },
    {
        "name": "Logitech MX Master 3S Wireless Mouse",
        "category": "mice",
        "brand": "logitech",
        "description": "Quiet Clicks performance mouse with 8000 DPI any-surface tracking, MagSpeed electromagnetic scrolling, USB-C fast charging, and ergonomic thumb rest.",
        "price": 9_495.00,
        "sku": "LOG-MXM3S-GRY",
        "specifications": {
            "sensor": "Darkfield 8000 DPI high precision",
            "clicks": "Quiet Click technology (90% less click noise)",
            "scroll": "MagSpeed SmartShift Wheel",
            "battery": "USB-C, up to 70 days on full charge",
            "compatibility": "Windows, macOS, Linux, iPadOS",
        },
        "rating": 4.9,
        "stock": 30,
    },
    {
        "name": "Razer Huntsman V2 Optical Gaming Keyboard",
        "category": "keyboards",
        "brand": "razer",
        "description": "Near-zero input latency with Razer Linear Optical Switches Gen-2, Doubleshot PBT keycaps, sound dampening foam, and ergonomic wrist rest.",
        "price": 14_999.00,
        "sku": "RZR-HUNT-V2-RED",
        "specifications": {
            "switch": "Razer Linear Optical Switches (40g actuation)",
            "polling_rate": "True 8000Hz Razer HyperPolling",
            "keycaps": "Doubleshot PBT keycaps",
            "wrist_rest": "Plush leatherette magnetic wrist rest",
        },
        "rating": 4.7,
        "stock": 15,
    },

    # ── 7. Gaming Consoles & Accessories ──────────────────────────────────────
    {
        "name": "Sony PlayStation 5 Digital Edition (Slim)",
        "category": "gaming",
        "brand": "sony",
        "description": "Experience lightning fast loading with an ultra-high speed 1TB SSD, deeper immersion with haptic feedback, adaptive triggers, and 3D Audio.",
        "price": 44_990.00,
        "sku": "SNY-PS5-SLIM-DIG",
        "specifications": {
            "storage": "1TB Custom NVMe SSD",
            "graphics": "AMD Radeon RDNA 2-based graphics engine with Ray Tracing",
            "output": "4K 120Hz, 8K TVs, VRR support",
            "audio": "Tempest 3D AudioTech",
            "controller": "DualSense Wireless Controller included",
        },
        "rating": 4.9,
        "stock": 14,
    },
    {
        "name": "Nintendo Switch OLED Model",
        "category": "gaming",
        "brand": "nintendo",
        "description": "7-inch OLED screen with vibrant colors and crisp contrast, wide adjustable stand, enhanced audio in handheld and tabletop modes, 64GB internal storage.",
        "price": 31_999.00,
        "sku": "NIN-SW-OLED-WHT",
        "specifications": {
            "screen": "7.0 inch OLED multi-touch capacitive (1280x720)",
            "storage": "64GB internal storage (expandable via microSD)",
            "dock": "Wired LAN port, HDMI output 1080p in TV mode",
            "battery": "4.5 to 9 hours",
        },
        "rating": 4.8,
        "stock": 18,
    },

    # ── 8. Cameras & Drones ───────────────────────────────────────────────────
    {
        "name": "DJI Mini 4 Pro Drone (Fly More Combo)",
        "category": "drones",
        "brand": "dji",
        "description": "Sub-249g ultra-lightweight foldable drone with omnidirectional obstacle sensing, 4K/60fps HDR video, true vertical shooting, and 34-min flight time.",
        "price": 98_990.00,
        "sku": "DJI-MINI4P-FMC",
        "specifications": {
            "weight": "Under 249g (no registration in many countries)",
            "camera": "1/1.3-inch CMOS, f/1.7, 48MP, 4K/60fps HDR, 4K/100fps Slow Mo",
            "obstacle_sensing": "Omnidirectional Active Obstacle Sensing",
            "transmission": "DJI O4 FHD 20km video transmission",
            "flight_time": "Up to 34 minutes per battery (3 batteries included)",
        },
        "rating": 4.9,
        "stock": 5,
    },
    {
        "name": "GoPro HERO12 Black Action Camera",
        "category": "cameras",
        "brand": "gopro",
        "description": "Unbelievable 5.3K60 and 4K120 video quality, Emmy-winning HyperSmooth 6.0 video stabilization with 360 Horizon Lock, rugged and waterproof to 33ft.",
        "price": 37_990.00,
        "sku": "GPR-H12-BLK",
        "specifications": {
            "video": "5.3K60, 4K120, 2.7K240 (8x slo-mo)",
            "stabilization": "HyperSmooth 6.0 with AutoBoost & 360 Horizon Lock",
            "photo": "27MP photos with HDR",
            "waterproof": "10m (33ft) without housing",
        },
        "rating": 4.7,
        "stock": 12,
    },

    # ── 9. PC Components & GPUs ───────────────────────────────────────────────
    {
        "name": "NVIDIA GeForce RTX 4070 Super 12GB Graphics Card",
        "category": "components",
        "brand": "nvidia",
        "description": "Powered by NVIDIA Ada Lovelace architecture, DLSS 3 AI neural rendering, dedicated Ray Tracing Cores, 12GB GDDR6X 192-bit memory.",
        "price": 61_999.00,
        "sku": "NVD-RTX4070S-12G",
        "specifications": {
            "cuda_cores": "7168 CUDA Cores",
            "boost_clock": "2.48 GHz",
            "memory": "12GB GDDR6X (504 GB/s bandwidth)",
            "tdp": "220W (requires 650W PSU)",
            "technologies": "DLSS 3.5, Ray Tracing, Reflex, AV1 Encoder",
        },
        "rating": 4.9,
        "stock": 10,
    },
    {
        "name": "Samsung 990 Pro 2TB PCIe 4.0 NVMe M.2 SSD",
        "category": "components",
        "brand": "samsung",
        "description": "Blazing fast sequential read/write speeds up to 7450/6900 MB/s, custom Pascal controller, and smart thermal control for pro gaming and computing.",
        "price": 16_999.00,
        "sku": "SAM-990PRO-2TB",
        "specifications": {
            "capacity": "2TB (2000GB)",
            "read_speed": "Up to 7,450 MB/s",
            "write_speed": "Up to 6,900 MB/s",
            "form_factor": "M.2 (2280) PCIe Gen 4.0 x4, NVMe 2.0",
            "tbw": "1200 TBW",
        },
        "rating": 4.9,
        "stock": 25,
    },

    # ── 10. Tablets & Accessories ─────────────────────────────────────────────
    {
        "name": "Apple iPad Air 11-inch (M2 Chip)",
        "category": "tablets",
        "brand": "apple",
        "description": "Freshly redesigned with the blazing fast Apple M2 chip, 11-inch Liquid Retina display, landscape 12MP front camera with Center Stage, Wi-Fi 6E.",
        "price": 59_900.00,
        "sku": "APL-IPADAIR-M2-128",
        "specifications": {
            "chip": "Apple M2 (8-core CPU, 10-core GPU, 16-core Neural Engine)",
            "display": "11-inch Liquid Retina with P3 wide color and True Tone",
            "storage": "128GB",
            "camera": "12MP Wide back camera, 12MP Landscape Center Stage front",
            "accessories": "Supports Apple Pencil Pro & Magic Keyboard",
        },
        "rating": 4.8,
        "stock": 14,
    },
    {
        "name": "Anker 737 Power Bank (PowerCore 24K, 140W)",
        "category": "accessories",
        "brand": "anker",
        "description": "Ultra-powerful two-way fast charging power bank with 140W max output, 24,000mAh capacity, smart digital display showing output/input power and battery health.",
        "price": 12_999.00,
        "sku": "ANK-737-24K-140W",
        "specifications": {
            "capacity": "24,000mAh / 86.4Wh (Airline approved)",
            "max_output": "140W Power Delivery 3.1 via USB-C",
            "ports": "2x USB-C + 1x USB-A",
            "display": "Smart Digital Screen with live wattage stats",
        },
        "rating": 4.9,
        "stock": 20,
    },
    {
        "name": "Laptop Bag 15.6\"",
        "category": "accessories",
        "brand": "techstore",
        "description": "Durable water-resistant laptop bag with padded compartment, accessory pockets, and external USB charging port.",
        "price": 1_500.00,
        "sku": "TS-BAG-156-GRY",
        "specifications": {
            "material": "Water-resistant nylon",
            "laptop_size": "Up to 15.6 inches",
            "compartments": "3 main + 5 accessory pockets",
        },
        "rating": 4.2,
        "stock": 35,
    },
    {
        "name": "USB-C Hub 7-in-1",
        "category": "accessories",
        "brand": "techstore",
        "description": "Expand laptop connectivity: 4K HDMI, USB-C PD 100W, SD/MicroSD slots, 3x USB-A 3.0 ports. Universal compatibility.",
        "price": 2_200.00,
        "sku": "TS-USBC-HUB7",
        "specifications": {
            "ports": "HDMI 4K@30Hz, USB-C PD 100W, SD, MicroSD, 3x USB 3.0",
        },
        "rating": 4.3,
        "stock": 40,
    },
    {
        "name": "USB Wired Optical Mouse",
        "category": "mice",
        "brand": "techstore",
        "description": "Reliable, plug-and-play wired USB mouse. 1000 DPI optical sensor, ambidextrous design.",
        "price": 1_200.00,
        "sku": "TS-USB-MOUSE-WHT",
        "specifications": {
            "type": "Wired USB",
            "dpi": "1000 DPI",
        },
        "rating": 4.1,
        "stock": 50,
    },
]


async def seed() -> None:
    print(f"\n[SEED] Initializing AgentPay Database ({len(PRODUCTS)} products across 11 tech categories)...")

    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    session_factory = async_sessionmaker(engine, expire_on_commit=False)

    async with session_factory() as session:
        # 1. Clean existing tables
        from sqlalchemy import text
        try:
            await session.execute(text("DELETE FROM audit_logs;"))
            await session.execute(text("DELETE FROM agent_actions;"))
            await session.execute(text("DELETE FROM agent_sessions;"))
            await session.execute(text("DELETE FROM payments;"))
            await session.execute(text("DELETE FROM orders;"))
            await session.execute(text("DELETE FROM cart_items;"))
            await session.execute(text("DELETE FROM carts;"))
            await session.execute(text("DELETE FROM product_relations;"))
            await session.execute(text("DELETE FROM promotions;"))
            await session.execute(text("DELETE FROM inventory;"))
            await session.execute(text("DELETE FROM products;"))
            await session.execute(text("DELETE FROM merchant_policies;"))
            await session.execute(text("DELETE FROM customers;"))
            await session.execute(text("DELETE FROM merchants;"))
            await session.execute(text("DELETE FROM users;"))
            await session.commit()
            print("[SEED] Cleaned previous database state.")
        except Exception as e:
            await session.rollback()
            print(f"[SEED] Note during table reset: {e}")

        # 2. Create Users & Merchant
        merchant_user = User(
            id=uuid.uuid4(),
            email="merchant@techstore.com",
            password_hash=hash_password("merchant123"),
            name="TechStore Owner",
            role=UserRole.MERCHANT,
            is_active=True,
        )
        customer_user = User(
            id=uuid.uuid4(),
            email="demo@agentpay.com",
            password_hash=hash_password("customer123"),
            name="Demo Shopper",
            role=UserRole.CUSTOMER,
            is_active=True,
        )
        session.add_all([merchant_user, customer_user])
        await session.flush()

        merchant = Merchant(
            id=uuid.uuid4(),
            user_id=merchant_user.id,
            name="TechStore India",
            business_type="Electronics & Multi-Agent Commerce",
            description="Premier tech retailer specializing in computers, gaming, flagship smartphones, audio, and gadgets.",
            status=MerchantStatus.ACTIVE,
        )
        customer = Customer(
            id=uuid.uuid4(),
            user_id=customer_user.id,
            budget_limit=70_000.00,
            preferred_categories=["laptops", "headphones", "keyboards", "smartphones", "gaming"],
            preferred_brands=["apple", "sony", "lenovo", "logitech", "samsung", "asus"],
            location="Bengaluru, India",
        )
        session.add_all([merchant, customer])
        await session.flush()

        # 3. Create Merchant Policy
        policy = MerchantPolicy(
            id=uuid.uuid4(),
            merchant_id=merchant.id,
            max_transaction_amount=100_000.00,
            minimum_order_amount=500.00,
            max_discount_percentage=10.0,
            agent_purchase_enabled=True,
            upsell_enabled=True,
            refund_window_days=7,
            requires_authorization=True,
        )
        session.add(policy)

        # 4. Insert Catalog Products and Inventory
        created_products = []
        for p_data in PRODUCTS:
            cat = p_data["category"]
            p_name = p_data["name"]
            
            # Category image resolution map
            img_map = {
                "laptops": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=80",
                "smartphones": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&auto=format&fit=crop&q=80",
                "headphones": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
                "audio": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500&auto=format&fit=crop&q=80",
                "wearables": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80",
                "monitors": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=80",
                "keyboards": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80",
                "cameras": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=80",
                "gaming": "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=500&auto=format&fit=crop&q=80",
                "components": "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&auto=format&fit=crop&q=80",
                "tablets": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=80",
                "accessories": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80",
            }
            img_url = p_data.get("image_url") or img_map.get(cat, "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=80")

            product = Product(
                id=uuid.uuid4(),
                merchant_id=merchant.id,
                name=p_name,
                category=cat,
                brand=p_data["brand"],
                description=p_data["description"],
                price=p_data["price"],
                currency="INR",
                sku=p_data["sku"],
                specifications=p_data["specifications"],
                rating=p_data["rating"],
                image_url=img_url,
                is_active=True,
            )
            session.add(product)
            await session.flush()

            inventory = Inventory(
                id=uuid.uuid4(),
                product_id=product.id,
                stock_quantity=p_data["stock"],
                reserved_quantity=0,
            )
            session.add(inventory)
            created_products.append(product)

        # 5. Create Promotions
        promo = Promotion(
            id=uuid.uuid4(),
            merchant_id=merchant.id,
            name="Tech Bundle Combo Deal",
            promotion_type=PromotionType.PERCENTAGE,
            discount_value=5.00,
            minimum_cart_value=1000.00,
            is_active=True,
            start_date=datetime.now(timezone.utc) - timedelta(days=1),
            end_date=datetime.now(timezone.utc) + timedelta(days=90),
        )
        session.add(promo)

        await session.commit()
        print(f"[SEED] Successfully seeded {len(created_products)} products, merchant policy, and demo accounts.")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
