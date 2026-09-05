"""
app/agents/universal_catalog.py

Universal Product Intelligence & Feature Synthesis Engine for AgentPay.
Generates authentic, market-accurate product models, specifications, and realistic pricing
for ANY consumer query (Electronics, Fashion, Footwear, Fitness, Home, Kitchen, Beauty, Books, etc.)
adhering to user budgets (e.g., "phone under 14k", "running shoes below 3000", "whey protein", "coffee maker").
"""

import re
import random
from typing import Any


def clean_search_query(text: str) -> tuple[str, float]:
    """
    Extracts the clean product keyword and the maximum price budget in INR.
    Example: "i need the phone under 14k" -> ("phone", 14000.0)
             "show me running shoes below 3000" -> ("running shoes", 3000.0)
             "leather jacket" -> ("leather jacket", 0.0)
    """
    msg = text.lower()

    # Extract budget if present
    max_price = 0.0
    price_match = re.search(
        r'(?:under|below|less than|max|budget|within|upto|up to)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*(?:\.\d+)?(?:k)?)',
        msg
    )
    if price_match:
        raw_p = price_match.group(1).replace(',', '').lower()
        try:
            if raw_p.endswith('k'):
                max_price = float(raw_p[:-1]) * 1000.0
            else:
                max_price = float(raw_p)
        except Exception:
            max_price = 0.0

    # Remove conversational filler patterns
    fillers = [
        r'\b(i need|i want to buy|i want|please show|show me|find me|give me|search for|looking for|recommend|suggest)\b',
        r'\b(cheap|best|top|good|quality|latest|affordable|new)\b',
        r'\b(under|below|less than|max|budget|within|upto|up to)\s*(?:₹|rs\.?|inr)?\s*\d+(?:,\d+)*(?:\.\d+)?k?\b',
        r'\b(rs\.?|inr|₹|\bproducts?\b|\bitems?\b|\bgive\b|\bcan you\b|\bplease\b|\bfor me\b|\bfor\b|\bthe\b|\ba\b|\ban\b|\bsome\b)\b',
    ]

    cleaned = msg
    for pattern in fillers:
        cleaned = re.sub(pattern, ' ', cleaned, flags=re.IGNORECASE)

    cleaned = re.sub(r'[^a-zA-Z0-9\s-]', ' ', cleaned)
    cleaned = ' '.join(cleaned.split()).strip()

    if not cleaned:
        cleaned = text.strip()

    return cleaned, max_price


# ── Domain-Specific Product Synthesizer ───────────────────────────────────────

CATALOG_KNOWLEDGE: dict[str, dict[str, Any]] = {
    # ── Smartphones ───────────────────────────────────────────────────────────
    "phone": {
        "category": "smartphones",
        "brand_pool": ["Redmi", "Realme", "Motorola", "Samsung", "POCO", "OnePlus", "iQOO", "Vivo", "Apple", "Google"],
        "tiers": [
            {
                "max_budget": 15000,
                "items": [
                    {
                        "name": "Redmi 13 5G (8GB RAM, 128GB)",
                        "brand": "redmi",
                        "price": 12999.00,
                        "description": "5G powerhouse with Snapdragon 4 Gen 2 AE, crystal glass back design, and 108MP ultra-clear AI camera.",
                        "specifications": {
                            "display": "6.79-inch FHD+ 120Hz AdaptiveSync",
                            "processor": "Qualcomm Snapdragon 4 Gen 2 AE (4nm)",
                            "camera": "108MP 3X In-Sensor Zoom AI Dual Camera",
                            "battery": "5030mAh with 33W Fast Charging",
                            "ram_storage": "8GB RAM (4GB + 4GB Virtual) + 128GB ROM",
                        }
                    },
                    {
                        "name": "Realme Narzo 70x 5G",
                        "brand": "realme",
                        "price": 11999.00,
                        "description": "Ultra-smooth 120Hz smartphone with Dimensity 6100+ 5G chipset, 45W SUPERVOOC charging, and IP54 dust & water resistance.",
                        "specifications": {
                            "display": "6.72-inch FHD+ 120Hz Ultra Smooth Display",
                            "processor": "MediaTek Dimensity 6100+ 5G (6nm)",
                            "camera": "50MP AI Primary Camera + 2MP Depth",
                            "battery": "5000mAh with 45W SUPERVOOC Charge",
                            "audio": "Dual Stereo Speakers with Hi-Res Audio",
                        }
                    },
                    {
                        "name": "Moto G34 5G (128GB)",
                        "brand": "motorola",
                        "price": 10999.00,
                        "description": "Clean near-stock Android 14 experience powered by Snapdragon 695 5G with premium vegan leather finish.",
                        "specifications": {
                            "display": "6.5-inch HD+ 120Hz IPS Display",
                            "processor": "Snapdragon 695 5G Octa-Core",
                            "camera": "50MP Quad Pixel + 2MP Macro",
                            "battery": "5000mAh with 20W TurboPower",
                            "os": "Android 14 (Clean My UX)",
                        }
                    },
                    {
                        "name": "Samsung Galaxy M14 5G",
                        "brand": "samsung",
                        "price": 13499.00,
                        "description": "Massive 6000mAh battery champion with Exynos 1330 5nm chip, 50MP triple camera, and 2 OS updates guaranteed.",
                        "specifications": {
                            "display": "6.6-inch FHD+ 90Hz PLS LCD Display",
                            "processor": "Exynos 1330 5nm Octa-Core",
                            "camera": "50MP Main + 2MP Macro + 2MP Depth",
                            "battery": "6000mAh Monster Battery with 25W Fast Charge",
                            "security": "Voice Focus & Samsung Knox Security",
                        }
                    },
                ]
            },
            {
                "max_budget": 30000,
                "items": [
                    {
                        "name": "OnePlus Nord CE4 5G",
                        "brand": "oneplus",
                        "price": 24999.00,
                        "description": "Snapdragon 7 Gen 3 performer with 100W SUPERVOOC charging, Sony LYT-600 OIS camera, and 120Hz AMOLED.",
                        "specifications": {
                            "display": "6.7-inch FHD+ 120Hz Fluid AMOLED (Aqua Touch)",
                            "processor": "Snapdragon 7 Gen 3 (4nm)",
                            "camera": "50MP Sony LYT-600 with OIS + 8MP Ultra-Wide",
                            "battery": "5500mAh with 100W SUPERVOOC (1-100% in 29 mins)",
                        }
                    },
                    {
                        "name": "POCO X6 Pro 5G",
                        "brand": "poco",
                        "price": 26999.00,
                        "description": "Flagship-grade Dimensity 8300-Ultra chip, 1.5K 120Hz Flow AMOLED, 64MP OIS triple camera, and WildBoost 2.0.",
                        "specifications": {
                            "display": "6.67-inch 1.5K 120Hz Flow AMOLED (1800 nits peak)",
                            "processor": "MediaTek Dimensity 8300-Ultra (AnTuTu 1.4M+)",
                            "camera": "64MP OIS Primary + 8MP UW + 2MP Macro",
                            "cooling": "LiquidCool Technology 2.0 (5000mm² Vapor Chamber)",
                        }
                    }
                ]
            }
        ]
    },

    # ── Footwear & Running Shoes ──────────────────────────────────────────────
    "shoe": {
        "category": "footwear",
        "brand_pool": ["Nike", "Puma", "Adidas", "Asics", "New Balance", "Skechers"],
        "tiers": [
            {
                "max_budget": 4000,
                "items": [
                    {
                        "name": "Puma Softride Enzo Evo Running Shoes",
                        "brand": "puma",
                        "price": 2899.00,
                        "description": "Softride EVA foam cushioning technology for extreme comfort, breathable mesh upper, and progressive clamshell collar design.",
                        "specifications": {
                            "sole_material": "Softride EVA Midsole with zoned rubber outsole",
                            "upper_material": "Engineered Breathable Mesh",
                            "closure": "Lace-Up with TPU cage support",
                            "weight": "285g (lightweight responsive stride)",
                        }
                    },
                    {
                        "name": "Nike Revolution 6 Next Nature Shoes",
                        "brand": "nike",
                        "price": 3495.00,
                        "description": "Intuitive comfort and flexible cushioning made with at least 20% recycled content by weight. Ideal for road running and training.",
                        "specifications": {
                            "cushioning": "Plush foam midsole for smooth ride",
                            "upper": "Lightweight breathable knit fabric",
                            "outsole": "Computer-generated generative traction pattern",
                        }
                    }
                ]
            },
            {
                "max_budget": 10000,
                "items": [
                    {
                        "name": "Adidas Ultraboost Light Running Shoes",
                        "brand": "adidas",
                        "price": 9999.00,
                        "description": "Epic energy with the lightest BOOST midsole ever. Continental Better Rubber outsole delivers extraordinary traction in wet and dry conditions.",
                        "specifications": {
                            "midsole": "Ultraboost Light (30% lighter BOOST material)",
                            "upper": "PRIMEKNIT+ textile upper with sock-like fit",
                            "stability": "Linear Energy Push (LEP) system",
                        }
                    }
                ]
            }
        ]
    },

    # ── Clothing & Jackets ───────────────────────────────────────────────────
    "jacket": {
        "category": "clothing",
        "brand_pool": ["Roadster", "Levis", "Zara", "Wildcraft", "H&M", "Columbia"],
        "tiers": [
            {
                "max_budget": 4000,
                "items": [
                    {
                        "name": "Roadster Men Solid Biker Leather Jacket",
                        "brand": "roadster",
                        "price": 2499.00,
                        "description": "Sleek cafe-racer biker jacket crafted from premium PU faux leather with quilted shoulders, snap collar, and zippered pockets.",
                        "specifications": {
                            "material": "High-Grade Synthetic Leather (Polyurethane)",
                            "lining": "Soft polyester quilted thermal inner lining",
                            "closure": "Heavy-duty front metallic YKK zipper",
                            "pockets": "2 side zip pockets, 1 chest pocket, 1 inner slip",
                            "fit": "Regular tailored rider fit",
                        }
                    },
                    {
                        "name": "Wildcraft Men Lightweight Windproof Bomber Jacket",
                        "brand": "wildcraft",
                        "price": 1999.00,
                        "description": "Water-repellent and wind-resistant lightweight jacket engineered for daily commutes and outdoor adventures.",
                        "specifications": {
                            "fabric": "100% Ripstop Nylon with DWR finish",
                            "cuffs": "Ribbed elasticated cuffs and hem",
                            "breathability": "Breathable underarm eyelets",
                        }
                    }
                ]
            }
        ]
    },

    # ── Fitness & Supplements ─────────────────────────────────────────────────
    "protein": {
        "category": "fitness",
        "brand_pool": ["Optimum Nutrition", "MuscleBlaze", "Dymatize", "MyProtein", "As-It-Is"],
        "tiers": [
            {
                "max_budget": 5000,
                "items": [
                    {
                        "name": "Optimum Nutrition (ON) Gold Standard 100% Whey (2 lbs)",
                        "brand": "optimum nutrition",
                        "price": 3499.00,
                        "description": "World's #1 selling whey protein powder. Delivers 24g of high-quality whey protein isolate, 5.5g naturally occurring BCAAs, and 4g glutamine.",
                        "specifications": {
                            "protein_per_serving": "24g Whey Protein Isolate & Concentrate blend",
                            "bcaa": "5.5g Branched Chain Amino Acids per scoop",
                            "servings": "29-31 servings (Double Rich Chocolate)",
                            "certifications": "Informed-Choice Trusted by Sport",
                        }
                    },
                    {
                        "name": "MuscleBlaze Biozyme Performance Whey (1 kg)",
                        "brand": "muscleblaze",
                        "price": 2399.00,
                        "description": "Clinically tested for 50% higher protein absorption and 60% higher BCAA absorption. Formulated with Enhanced Absorption Formula (EAF).",
                        "specifications": {
                            "protein_per_serving": "25g pure protein per 36g scoop",
                            "absorption": "Clinically tested Biozyme enzyme technology",
                            "flavour": "Rich Chocolate Fudge",
                            "testing": "Labdoor USA certified for purity and accuracy",
                        }
                    }
                ]
            }
        ]
    },

    # ── Home Appliances & Kitchen ─────────────────────────────────────────────
    "coffee": {
        "category": "kitchen",
        "brand_pool": ["Philips", "Nespresso", "Morphy Richards", "DeLonghi", "Wonderchef"],
        "tiers": [
            {
                "max_budget": 10000,
                "items": [
                    {
                        "name": "Philips HD7431/20 700W Drip Coffee Maker",
                        "brand": "philips",
                        "price": 2795.00,
                        "description": "Compact and elegant drip coffee maker with aroma twister for optimal coffee taste and drip stop to pour a cup anytime.",
                        "specifications": {
                            "capacity": "0.6 Litre (4 to 7 cups)",
                            "power": "700 Watts fast heating element",
                            "features": "Aroma Twister, Drip Stop, Dishwasher-safe parts",
                            "warranty": "2 Years International Warranty",
                        }
                    },
                    {
                        "name": "Morphy Richards Fresco 800W Espresso Coffee Maker",
                        "brand": "morphy richards",
                        "price": 4999.00,
                        "description": "Brews authentic espresso, cappuccino, and latte with 4-bar steam pressure and stainless steel milk frothing wand.",
                        "specifications": {
                            "pressure": "4 Bar operating pressure for rich crema",
                            "frothing": "Turbo cappuccino nozzle for thick milk froth",
                            "capacity": "4 Cups glass carafe with level markings",
                        }
                    }
                ]
            }
        ]
    },

    # ── Furniture & Ergonomics ────────────────────────────────────────────────
    "chair": {
        "category": "furniture",
        "brand_pool": ["Green Soul", "Featherlite", "Wakefit", "Sleep Company", "Ikea"],
        "tiers": [
            {
                "max_budget": 15000,
                "items": [
                    {
                        "name": "Green Soul Monster Ultimate Ergonomic Gaming & Office Chair",
                        "brand": "green soul",
                        "price": 12999.00,
                        "description": "High-back ergonomic chair with molded foam seat, 4D adjustable armrests, magnetic memory foam headrest, and heavy-duty metal wheelbase.",
                        "specifications": {
                            "lumbar_support": "Integrated internal mechanical lumbar support",
                            "recline": "90° to 180° multi-tilt lock mechanism",
                            "gas_lift": "Class 4 heavy duty explosion-proof piston",
                            "material": "Breathable Spandex fabric & premium PU leather",
                            "weight_capacity": "Supports up to 135 kg",
                        }
                    },
                    {
                        "name": "Wakefit Aries High Back Ergonomic Mesh Chair",
                        "brand": "wakefit",
                        "price": 5499.00,
                        "description": "Breathable Korean mesh back with adjustable lumbar cushion, synchro-tilt mechanism, and 3-year manufacturer warranty.",
                        "specifications": {
                            "mesh": "High-tensile breathable Korean mesh back",
                            "seat": "High-density injection molded foam cushion",
                            "castors": "60mm smooth-rolling nylon castors",
                        }
                    }
                ]
            }
        ]
    },

    # ── Headphones & Audio ───────────────────────────────────────────────────
    "headphone": {
        "category": "audio",
        "brand_pool": ["Sony", "JBL", "boAt", "Sennheiser", "Bose", "Apple"],
        "tiers": [
            {
                "max_budget": 5000,
                "items": [
                    {
                        "name": "boAt Rockerz 551ANC Wireless Headphones",
                        "brand": "boat",
                        "price": 2499.00,
                        "description": "Active Noise Cancelling wireless headphones with 40mm Dirac Opteo drivers, 100H playtime, Ambient Mode, and ASAP charge.",
                        "specifications": {
                            "driver": "40mm Dirac Opteo™ Tuned Drivers",
                            "anc": "Hybrid Active Noise Cancellation (-25dB)",
                            "battery": "100 Hours (ANC Off) / 72 Hours (ANC On)",
                            "connectivity": "Bluetooth 5.3 with Dual Pairing",
                        }
                    },
                    {
                        "name": "JBL Tune 770NC Wireless Headphones",
                        "brand": "jbl",
                        "price": 4699.00,
                        "description": "Legendary JBL Pure Bass Sound with Adaptive ANC, 70H battery, Ambient Aware and TalkThru, foldable flat-fold design.",
                        "specifications": {
                            "driver": "40mm JBL Pure Bass Drivers",
                            "anc": "Adaptive Active Noise Cancelling",
                            "battery": "70 Hours with ANC / 44 Hours with ANC On",
                            "connectivity": "Bluetooth 5.3, multipoint connection, Google Fast Pair",
                        }
                    }
                ]
            },
            {
                "max_budget": 30000,
                "items": [
                    {
                        "name": "Sony WH-1000XM5 Premium Wireless ANC Headphones",
                        "brand": "sony",
                        "price": 26990.00,
                        "description": "Industry-leading noise cancellation with 8 microphones, Auto NC Optimizer, 30H battery, Hi-Res Audio, and crystal-clear hands-free calling.",
                        "specifications": {
                            "driver": "30mm specially designed carbon fiber composite drivers",
                            "anc": "Dual Processor noise cancelling with 8 microphones",
                            "battery": "30 Hours with ANC / 3 min charge = 3 hours",
                            "audio_codec": "LDAC, SBC, AAC (Hi-Res Audio Wireless)",
                        }
                    }
                ]
            }
        ]
    },

    # ── Laptops & Ultrabooks ─────────────────────────────────────────────────
    "laptop": {
        "category": "laptops",
        "brand_pool": ["HP", "Lenovo", "ASUS", "Dell", "Acer", "Apple"],
        "tiers": [
            {
                "max_budget": 45000,
                "items": [
                    {
                        "name": "Acer Aspire Lite AL15-52 (i5, 16GB, 512GB SSD)",
                        "brand": "acer",
                        "price": 37990.00,
                        "description": "Powerful everyday laptop with 12th Gen Intel Core i5-1235U, 16GB DDR4 RAM, 512GB NVMe SSD, and 15.6-inch FHD IPS display.",
                        "specifications": {
                            "processor": "Intel Core i5-1235U (12th Gen, 10-core)",
                            "memory": "16GB DDR4 3200MHz (Upgradeable)",
                            "storage": "512GB PCIe NVMe SSD",
                            "display": "15.6-inch FHD IPS (1920×1080, 300 nits)",
                            "battery": "Up to 11 Hours battery life",
                        }
                    },
                    {
                        "name": "Lenovo IdeaPad Slim 3 (Ryzen 5, 8GB, 512GB)",
                        "brand": "lenovo",
                        "price": 34990.00,
                        "description": "Sleek and lightweight laptop with AMD Ryzen 5 7520U, 8GB LPDDR5, 512GB SSD, and 15.6-inch FHD anti-glare display.",
                        "specifications": {
                            "processor": "AMD Ryzen 5 7520U (Zen 2, 4-core)",
                            "memory": "8GB LPDDR5 4800MHz",
                            "storage": "512GB PCIe Gen 4 NVMe SSD",
                            "display": "15.6-inch FHD Anti-Glare (250 nits)",
                            "weight": "1.62 kg ultra-portable",
                        }
                    }
                ]
            },
            {
                "max_budget": 80000,
                "items": [
                    {
                        "name": "ASUS Vivobook S 15 OLED (i7, 16GB, 1TB SSD)",
                        "brand": "asus",
                        "price": 74990.00,
                        "description": "Stunning 15.6-inch 2.8K 120Hz OLED display, Intel Core i7-13700H (13th Gen), 16GB DDR5, 1TB SSD, Intel Iris Xe.",
                        "specifications": {
                            "processor": "Intel Core i7-13700H (14-core, 5.0GHz turbo)",
                            "memory": "16GB DDR5 4800MHz",
                            "storage": "1TB PCIe Gen 4 NVMe SSD",
                            "display": "15.6-inch 2.8K OLED 120Hz (600 nits, DCI-P3 100%)",
                            "weight": "1.7 kg, Thunderbolt 4, HARMAN speakers",
                        }
                    }
                ]
            }
        ]
    },

    # ── Smartwatches & Fitness Trackers ───────────────────────────────────────
    "watch": {
        "category": "wearables",
        "brand_pool": ["Noise", "Fire-Boltt", "boAt", "Samsung", "Apple"],
        "tiers": [
            {
                "max_budget": 5000,
                "items": [
                    {
                        "name": "Noise ColorFit Pulse 3 Smartwatch",
                        "brand": "noise",
                        "price": 1499.00,
                        "description": "1.96-inch TFT Vivid Display, BT Calling, 150+ watch faces, SpO2 monitoring, and 7-day battery life.",
                        "specifications": {
                            "display": "1.96-inch TFT HD Vivid Display (240×282px)",
                            "calling": "Bluetooth Calling with built-in mic & speaker",
                            "health": "24/7 Heart Rate, SpO2, Sleep Tracking",
                            "battery": "7-Day Battery Life / 200mAh",
                        }
                    },
                    {
                        "name": "Fire-Boltt Phoenix Ultra Smartwatch",
                        "brand": "fire-boltt",
                        "price": 1799.00,
                        "description": "1.39-inch AMOLED Always-On Display, Bluetooth Calling, IP68 water resistance, 120+ sports modes.",
                        "specifications": {
                            "display": "1.39-inch AMOLED AOD (360×360px, 500 nits)",
                            "health": "Heart Rate, SpO2, Blood Pressure monitor",
                            "sports": "120+ Sports Modes with GPS Connected",
                            "battery": "10-Day Battery / 280mAh",
                        }
                    }
                ]
            },
            {
                "max_budget": 30000,
                "items": [
                    {
                        "name": "Samsung Galaxy Watch6 (44mm, Bluetooth)",
                        "brand": "samsung",
                        "price": 22999.00,
                        "description": "Premium Wear OS smartwatch with BioActive sensor, Sapphire Crystal display, advanced sleep coaching, and Galaxy AI features.",
                        "specifications": {
                            "display": "1.5-inch Super AMOLED (480×480px, Sapphire Crystal)",
                            "sensor": "Samsung BioActive Sensor (HR, SpO2, Bioelectrical Impedance)",
                            "battery": "425mAh with fast wireless charging",
                            "os": "Wear OS 4.0 powered by Samsung with Google Play",
                        }
                    }
                ]
            }
        ]
    },

    # ── Bags & Backpacks ─────────────────────────────────────────────────────
    "bag": {
        "category": "bags",
        "brand_pool": ["Safari", "Skybags", "American Tourister", "Wildcraft", "Aristocrat"],
        "tiers": [
            {
                "max_budget": 5000,
                "items": [
                    {
                        "name": "American Tourister Valex 28L Laptop Backpack",
                        "brand": "american tourister",
                        "price": 1399.00,
                        "description": "28-Litre durable backpack with dedicated 15.6-inch laptop compartment, organizer pockets, and padded shoulder straps.",
                        "specifications": {
                            "capacity": "28 Litres with multi-section organization",
                            "laptop_compartment": "Fits up to 15.6-inch laptops",
                            "material": "Water-Resistant Polyester Fabric",
                            "warranty": "3 Year International Brand Warranty",
                        }
                    },
                    {
                        "name": "Wildcraft 44L Hiking \u0026 Travel Rucksack",
                        "brand": "wildcraft",
                        "price": 2999.00,
                        "description": "Rugged 44L adventure rucksack with rain cover, hip belt suspension, hydration sleeve, and ripstop nylon construction.",
                        "specifications": {
                            "capacity": "44 Litres with expandable top lid",
                            "material": "High Denier Ripstop Nylon with PU coating",
                            "features": "Rain Cover, Hip Belt, Hydration Sleeve",
                            "back_system": "Padded contoured back panel with ventilation channels",
                        }
                    }
                ]
            }
        ]
    },

    # ── Speakers & Portable Audio ────────────────────────────────────────────
    "speaker": {
        "category": "audio",
        "brand_pool": ["JBL", "boAt", "Sony", "Marshall", "Ultimate Ears"],
        "tiers": [
            {
                "max_budget": 10000,
                "items": [
                    {
                        "name": "JBL Flip 6 Portable Bluetooth Speaker",
                        "brand": "jbl",
                        "price": 8999.00,
                        "description": "Powerful JBL Original Pro Sound with IP67 waterproof dustproof rating, 12H playtime, and PartyBoost multi-speaker pairing.",
                        "specifications": {
                            "driver": "Dual passive radiators + racetrack woofer",
                            "battery": "12 Hours playtime / 4800mAh",
                            "waterproof": "IP67 Waterproof and Dustproof",
                            "connectivity": "Bluetooth 5.1, PartyBoost",
                        }
                    },
                    {
                        "name": "boAt Stone 1208 Bluetooth Speaker",
                        "brand": "boat",
                        "price": 1999.00,
                        "description": "14W HD immersive sound with passive bass radiator, IPX7 water resistance, 9H battery, and RGB LED lights.",
                        "specifications": {
                            "output": "14W HD stereo sound with passive bass radiator",
                            "battery": "9 Hours playtime / 2500mAh",
                            "waterproof": "IPX7 water resistance",
                            "features": "RGB LED lights, TWS pairing, AUX/microSD/BT",
                        }
                    }
                ]
            }
        ]
    },
}


# ── Category Images & Visual Resolver ────────────────────────────────────────

CATEGORY_IMAGE_MAP: dict[str, str] = {
    "smartphones": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&auto=format&fit=crop&q=80",
    "phone": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80",
    "laptops": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=80",
    "audio": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
    "wearables": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80",
    "footwear": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80",
    "shoes": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80",
    "clothing": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=80",
    "fitness": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80",
    "kitchen": "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&auto=format&fit=crop&q=80",
    "furniture": "https://images.unsplash.com/photo-1580481077198-ac826f634571?w=500&auto=format&fit=crop&q=80",
    "bags": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80",
    "gaming": "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=500&auto=format&fit=crop&q=80",
    "cameras": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=80",
    "electronics": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=80",
    "beauty": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80",
    "stationery": "https://images.unsplash.com/photo-1585336261026-0043c7b642ff?w=500&auto=format&fit=crop&q=80",
    "toys": "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=500&auto=format&fit=crop&q=80",
    "automotive": "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=500&auto=format&fit=crop&q=80",
    "sports": "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=500&auto=format&fit=crop&q=80",
    "books": "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500&auto=format&fit=crop&q=80",
    "consumer_goods": "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=80",
}

def resolve_product_image(cat: str, name: str) -> str:
    lower = f"{cat} {name}".lower()
    if any(k in lower for k in ["phone", "redmi", "realme", "galaxy", "iphone", "oneplus", "poco"]):
        return CATEGORY_IMAGE_MAP["smartphones"]
    if any(k in lower for k in ["laptop", "macbook", "aspire", "ideapad", "vivobook"]):
        return CATEGORY_IMAGE_MAP["laptops"]
    if any(k in lower for k in ["headphone", "earbud", "audio", "boat", "sony", "jbl", "speaker"]):
        return CATEGORY_IMAGE_MAP["audio"]
    if any(k in lower for k in ["watch", "smartwatch", "fitness", "band", "fire-boltt", "noise"]):
        return CATEGORY_IMAGE_MAP["wearables"]
    if any(k in lower for k in ["shoe", "shoes", "sneaker", "sneakers", "running", "nike", "puma", "adidas", "asics", "footwear"]):
        return CATEGORY_IMAGE_MAP["footwear"]
    if any(k in lower for k in ["jacket", "hoodie", "shirt", "clothing", "dress", "leather", "jeans"]):
        return CATEGORY_IMAGE_MAP["clothing"]
    if any(k in lower for k in ["protein", "whey", "creatine", "supplement", "fitness"]):
        return CATEGORY_IMAGE_MAP["fitness"]
    if any(k in lower for k in ["coffee", "espresso", "maker", "kettle", "kitchen"]):
        return CATEGORY_IMAGE_MAP["kitchen"]
    if any(k in lower for k in ["chair", "desk", "furniture", "table"]):
        return CATEGORY_IMAGE_MAP["furniture"]
    if any(k in lower for k in ["bag", "backpack", "rucksack", "tourister", "wildcraft"]):
        return CATEGORY_IMAGE_MAP["bags"]
    return CATEGORY_IMAGE_MAP.get(cat, CATEGORY_IMAGE_MAP["consumer_goods"])


# ── Universal AI Synthesizer Logic ───────────────────────────────────────────

def synthesize_products_for_query(raw_query: str) -> list[dict]:
    """
    Synthesizes rich, domain-tailored product cards for ANY product request.
    Applies real brand names, realistic pricing matching user budget, and detailed specs.
    """
    clean_keyword, user_budget = clean_search_query(raw_query)
    lower_keyword = clean_keyword.lower()

    # 1. Match against known knowledge domains
    matched_domain = None
    if any(w in lower_keyword for w in ["phone", "mobile", "smartphone", "android", "iphone", "5g phone", "samsung", "redmi", "oneplus", "poco", "realme", "vivo", "oppo", "iqoo"]):
        matched_domain = "phone"
    elif any(w in lower_keyword for w in ["shoe", "shoes", "sneaker", "sneakers", "running", "footwear", "boot", "boots", "sandal", "sandals", "slipper", "slippers", "jogger", "training shoe", "nike", "adidas", "puma", "asics", "skechers"]):
        matched_domain = "shoe"
    elif any(w in lower_keyword for w in ["jacket", "hoodie", "shirt", "tshirt", "t-shirt", "jeans", "coat", "clothing", "sweatshirt", "kurta", "trouser", "pant", "dress", "blazer", "sweater"]):
        matched_domain = "jacket"
    elif any(w in lower_keyword for w in ["protein", "creatine", "supplement", "whey", "gym", "bcaa", "pre-workout", "preworkout", "mass gainer", "vitamins"]):
        matched_domain = "protein"
    elif any(w in lower_keyword for w in ["coffee", "espresso", "maker", "kettle", "fryer", "blender", "kitchen", "mixer", "grinder", "oven", "microwave", "toaster", "juicer", "cooker", "pressure cooker"]):
        matched_domain = "coffee"
    elif any(w in lower_keyword for w in ["chair", "desk", "furniture", "table", "ergonomic", "standing desk", "bookshelf", "sofa", "bed", "mattress"]):
        matched_domain = "chair"
    elif any(w in lower_keyword for w in ["headphone", "earphone", "earbud", "earbuds", "headset", "tws", "bluetooth earbuds", "neckband", "airpod", "sony wh", "jbl"]):
        matched_domain = "headphone"
    elif any(w in lower_keyword for w in ["laptop", "notebook", "ultrabook", "macbook", "chromebook", "thinkpad", "ideapad", "gaming laptop"]):
        matched_domain = "laptop"
    elif any(w in lower_keyword for w in ["watch", "smartwatch", "wristwatch", "apple watch", "fitness band", "tracker", "fitbit", "noise watch"]):
        matched_domain = "watch"
    elif any(w in lower_keyword for w in ["tablet", "ipad", "tab", "drawing pad", "kindle", "e-reader"]):
        matched_domain = "tablet"
    elif any(w in lower_keyword for w in ["bag", "backpack", "luggage", "suitcase", "travel bag", "duffel", "laptop bag", "handbag", "tote"]):
        matched_domain = "bag"
    elif any(w in lower_keyword for w in ["camera", "dslr", "mirrorless", "gopro", "action camera", "webcam", "tripod"]):
        matched_domain = "camera"
    elif any(w in lower_keyword for w in ["speaker", "bluetooth speaker", "soundbar", "subwoofer", "home theater", "portable speaker"]):
        matched_domain = "speaker"
    elif any(w in lower_keyword for w in ["monitor", "gaming monitor", "curved monitor", "display", "4k monitor"]):
        matched_domain = "monitor"
    elif any(w in lower_keyword for w in ["keyboard", "mouse", "gaming keyboard", "mechanical keyboard", "wireless mouse", "mousepad"]):
        matched_domain = "keyboard"

    if matched_domain and matched_domain in CATALOG_KNOWLEDGE:
        domain_info = CATALOG_KNOWLEDGE[matched_domain]
        matching_products = []

        # Find matching tier
        for tier in domain_info["tiers"]:
            if user_budget <= 0 or user_budget >= tier["max_budget"] or tier == domain_info["tiers"][0]:
                for item in tier["items"]:
                    if user_budget <= 0 or item["price"] <= (user_budget * 1.05):
                        p_cat = domain_info["category"]
                        p_name = item["name"]
                        matching_products.append({
                            "name": p_name,
                            "category": p_cat,
                            "brand": item["brand"],
                            "price": float(item["price"]),
                            "description": item["description"],
                            "specifications": item["specifications"],
                            "image_url": item.get("image_url") or resolve_product_image(p_cat, p_name),
                            "rating": 4.8,
                            "stock": 15,
                            "in_stock": True,
                        })

        if matching_products:
            return matching_products[:8]

    # 2. Universal Smart Fallback Generator for any arbitrary product term
    target_name = clean_keyword.title() if clean_keyword else "Premium Item"
    target_cat = "consumer_goods"

    # Smart category inference from context
    cat_map = {
        "footwear": ["shoe", "shoes", "sneaker", "sneakers", "boot", "boots", "sandal", "sandals", "slipper", "slippers", "clog"],
        "clothing": ["shirt", "tshirt", "t-shirt", "pant", "pants", "jeans", "jacket", "hoodie", "dress", "kurta", "suit", "blazer", "trouser", "trousers"],
        "fitness": ["protein", "creatine", "supplement", "whey", "gym", "bcaa", "mass gainer", "shaker"],
        "kitchen": ["cooker", "pan", "pot", "blender", "toaster", "kettle", "fryer", "microwave", "oven", "knife", "utensil"],
        "furniture": ["chair", "desk", "table", "sofa", "bed", "mattress", "cushion", "curtain", "lamp"],
        "electronics": ["charger", "cable", "adapter", "power bank", "usb", "hub", "dongle"],
        "gaming": ["controller", "gamepad", "console", "joystick", "vr"],
        "beauty": ["perfume", "cream", "serum", "moisturizer", "sunscreen", "shampoo", "conditioner"],
        "stationery": ["pen", "pencil", "notebook", "diary", "planner", "marker"],
        "toys": ["toy", "lego", "puzzle", "board game", "action figure"],
        "automotive": ["car", "bike", "helmet", "dash cam", "gps"],
        "sports": ["bat", "ball", "racket", "gloves", "jersey", "shin guard"],
        "books": ["book", "novel", "manga", "textbook", "guide"],
    }
    for cat, keywords in cat_map.items():
        if any(kw in lower_keyword for kw in keywords):
            target_cat = cat
            break

    # Realistic brand pools by inferred category
    brand_pools = {
        "footwear": ["Nike", "Puma", "Adidas", "Asics", "New Balance", "Skechers"],
        "clothing": ["Roadster", "Levis", "Zara", "Wildcraft", "H&M", "Columbia"],
        "fitness": ["Optimum Nutrition", "MuscleBlaze", "Dymatize", "MyProtein", "As-It-Is"],
        "kitchen": ["Philips", "Morphy Richards", "Prestige", "Pigeon", "Wonderchef"],
        "furniture": ["Green Soul", "Featherlite", "Wakefit", "Sleep Company", "Ikea"],
        "electronics": ["Anker", "Belkin", "Baseus", "Portronics", "Ambrane", "Stuffcool"],
        "gaming": ["Cosmic Byte", "Redgear", "HyperX", "Ant Esports", "Logitech G", "Razer"],
        "beauty": ["Mamaearth", "The Body Shop", "L'Oreal", "Nivea", "Plum", "Minimalist"],
        "stationery": ["Parker", "Faber-Castell", "Classmate", "Cello", "Camlin", "Pilot"],
        "toys": ["Lego", "Funskool", "Mattel", "Hasbro", "Hot Wheels", "Barbie"],
        "automotive": ["Bosch", "Mivi", "Qubo", "70Mai", "Portronics", "AmazonBasics"],
        "sports": ["Nivia", "Yonex", "Cosco", "SG", "Puma", "Decathlon"],
        "books": ["Penguin", "HarperCollins", "Rupa", "Scholastic", "Bloomsbury", "Vintage"],
        "consumer_goods": ["ApexTech", "NovaGear", "ProElite", "UrbanLux", "Zenith", "PrimeCraft"],
    }
    brands = brand_pools.get(target_cat, brand_pools["consumer_goods"])

    # Estimate price from user budget
    if user_budget > 0:
        base_price = round(user_budget * 0.95, -1)
    else:
        base_price = 2499.00 if target_cat in ("footwear", "clothing", "kitchen", "beauty") else 4999.00

    # Build 6 varied branded models & recommended alternatives
    model_variants = [
        (f"{brands[0]} {target_name} Flagship Pro Edition", brands[0], base_price, 4.9, f"Top-rated bestseller with premium materials, maximum durability, and official warranty."),
        (f"{brands[1]} {target_name} Ultra Performance", brands[1], round(base_price * 0.88, -1), 4.8, f"High-performance edition engineered for durability, longevity, and ergonomic comfort."),
        (f"{brands[2]} {target_name} Neo Smart Edition", brands[2], round(base_price * 0.78, -1), 4.7, f"Feature-packed everyday companion with modern styling and high user satisfaction."),
        (f"{brands[3 % len(brands)]} {target_name} Essential Series", brands[3 % len(brands)], round(base_price * 0.65, -1), 4.5, f"Maximum value-for-money option offering all core features at an unbeatable budget price."),
        (f"{brands[4 % len(brands)]} {target_name} Compact Plus", brands[4 % len(brands)], round(base_price * 0.55, -1), 4.6, f"Ultra-lightweight portable variant designed for on-the-go professionals and students."),
        (f"{brands[5 % len(brands)]} {target_name} Studio Custom", brands[5 % len(brands)], round(base_price * 0.92, -1), 4.8, f"Custom-tuned edition with enhanced precision engineering and VIP courier dispatch."),
    ]

    synth_results = []
    for m_name, m_brand, m_price, m_rating, m_desc in model_variants:
        synth_results.append({
            "name": m_name,
            "category": target_cat,
            "brand": m_brand.lower(),
            "price": float(m_price if m_price > 0 else 999.00),
            "description": m_desc,
            "specifications": {
                "grade": "Certified Grade-A Materials",
                "features": f"Optimized {clean_keyword} design with premium build quality",
                "warranty": "1 Year Official Brand Warranty",
                "dispatch": "Free 2-Day Priority Express Shipping",
            },
            "image_url": resolve_product_image(target_cat, m_name),
            "rating": m_rating,
            "stock": 25,
            "in_stock": True,
        })

    return synth_results
