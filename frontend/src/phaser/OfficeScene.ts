import Phaser from 'phaser';

export interface AgentState {
  id: string;
  name: string;
  role: string;
  accent: number;
  shirtColor: number;
  pantColor: number;
  homeX: number;
  homeY: number;
  currentStation: string;
}

/**
 * OfficeScene — Retro pixel-art top-down office for the AgentPay multi-agent platform.
 *
 * Layout (540 × 480 canvas):
 * ┌───────────────────────┬──────────────────────────┐
 * │  👑 MICHAEL'S OFFICE  │  🏪 TECHSTORE HUB        │
 * │   (Sales Discovery)   │   (Merchant Inventory)   │
 * ├──────────┬────────────┤──────────────────────────┤
 * │          │ 🌐 WEB HUB │                          │
 * │          ├────────────┤  💳 PAYMENT COUNTER       │
 * │ 🛡️ AUTH  │            │                          │
 * ├──────────┴────────────┼──────────────────────────┤
 * │  ☕ BREAKROOM LOUNGE   │  ⚡ SERVER ROOM           │
 * └───────────────────────┴──────────────────────────┘
 */
export class OfficeScene extends Phaser.Scene {
  private characters: { [key: string]: Phaser.GameObjects.Container } = {};
  private speechBubbles: { [key: string]: Phaser.GameObjects.Container } = {};
  private statusBadges: { [key: string]: Phaser.GameObjects.Container } = {};
  private serverLights: Phaser.GameObjects.Graphics[] = [];
  private tooltipText: Phaser.GameObjects.Text | null = null;

  // Fixed canvas dimensions
  private W = 540;
  private H = 480;

  // Station coordinates
  private stations: { [key: string]: { x: number; y: number; name: string } } = {
    MICHAEL_DESK:      { x: 120, y: 100, name: "Michael's Office" },
    MERCHANT_DESK:     { x: 400, y: 100, name: 'TechStore Hub' },
    AUTHORITY_DESK:    { x: 120, y: 260, name: 'Authority Desk' },
    PAYMENT_COUNTER:   { x: 400, y: 260, name: 'Payment Counter' },
    WEB_RESEARCH_HUB:  { x: 260, y: 200, name: 'Web Grounding Hub' },
    SERVER_ROOM:       { x: 420, y: 400, name: 'Server Room' },
    BREAKROOM:         { x: 120, y: 400, name: 'Breakroom' },
  };

  private agentsData: AgentState[] = [
    {
      id: 'SALES_AGENT',
      name: 'Michael (Sales)',
      role: 'Sales Discovery',
      accent: 0x4ecdc4,
      shirtColor: 0x4ecdc4,
      pantColor: 0x1a1320,
      homeX: 120,
      homeY: 100,
      currentStation: 'MICHAEL_DESK',
    },
    {
      id: 'MERCHANT_AGENT',
      name: 'TechStore Agent',
      role: 'Merchant Inventory',
      accent: 0xffa07a,
      shirtColor: 0xffa07a,
      pantColor: 0x3d2e4a,
      homeX: 400,
      homeY: 100,
      currentStation: 'MERCHANT_DESK',
    },
    {
      id: 'AUTHORITY_AGENT',
      name: 'Authority Gatekeeper',
      role: 'Policy & Budget',
      accent: 0xb197fc,
      shirtColor: 0xb197fc,
      pantColor: 0x1a1320,
      homeX: 120,
      homeY: 260,
      currentStation: 'AUTHORITY_DESK',
    },
    {
      id: 'CUSTOMER',
      name: 'Customer',
      role: 'Shopper',
      accent: 0x6bcf7f,
      shirtColor: 0x6bcf7f,
      pantColor: 0x2e384d,
      homeX: 260,
      homeY: 320,
      currentStation: 'PAYMENT_COUNTER',
    },
  ];

  constructor() {
    super({ key: 'OfficeScene' });
  }

  preload() {
    this.createProceduralTextures();
  }

  create() {
    // 1. Floor zones
    this.drawFloorZones();

    // 2. Walls & dividers
    this.drawWallsAndDoors();

    // 3. Furniture & stations
    this.drawFurniture();

    // 4. Characters
    this.createCharacterAvatars();

    // 5. Ambient animations
    this.time.addEvent({ delay: 300, callback: this.blinkServerLights, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 500, callback: this.animateCoffeeSteam, callbackScope: this, loop: true });

    // 6. Tooltip text (shared)
    this.tooltipText = this.add.text(0, 0, '', {
      fontFamily: 'monospace',
      fontSize: '9px',
      fontStyle: 'bold',
      color: '#FFFDF5',
      backgroundColor: '#1A1320',
      padding: { x: 6, y: 3 },
    })
      .setOrigin(0.5)
      .setDepth(200)
      .setVisible(false);

    // 7. React event listeners
    this.game.events.on('agent-speak', this.handleAgentSpeech, this);
    this.game.events.on('agent-action', this.handleAgentAction, this);
    this.game.events.on('agent-message-flying', this.handleFlyingEnvelope, this);
  }

  // ─── Procedural Tile Textures ──────────────────────────────────────────────

  private createProceduralTextures() {
    const make = (key: string, fillColor: number, lineColor: number, pattern: (g: Phaser.GameObjects.Graphics) => void) => {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(fillColor, 1);
      g.fillRect(0, 0, 32, 32);
      g.lineStyle(1, lineColor, 0.4);
      g.strokeRect(0, 0, 32, 32);
      pattern(g);
      g.generateTexture(key, 32, 32);
      g.destroy();
    };

    // Light Oak Wood
    make('tile_oak', 0xe5c896, 0xd4b57e, (g) => {
      g.fillStyle(0xd9b982, 0.35);
      g.fillRect(3, 8, 26, 2);
      g.fillRect(6, 20, 20, 2);
    });

    // Dark Walnut Wood
    make('tile_walnut', 0xc9a66b, 0xb89255, (g) => {
      g.fillStyle(0xba9457, 0.35);
      g.fillRect(4, 14, 24, 2);
      g.fillRect(2, 26, 28, 2);
    });

    // Carpet (Hallway / Common Area)
    make('tile_carpet', 0xe8d8b0, 0xd8c599, (g) => {
      g.fillStyle(0xd5c49a, 0.25);
      g.fillRect(13, 13, 6, 6);
    });

    // Breakroom Checker Tile
    make('tile_check', 0xd9cfe0, 0xa899b5, (g) => {
      g.fillStyle(0xfffdf5, 1);
      g.fillRect(0, 0, 16, 16);
      g.fillRect(16, 16, 16, 16);
    });

    // Executive Rug
    make('tile_rug', 0x7a1f2d, 0x9e2a3b, (g) => {
      g.fillStyle(0xf4d35e, 0.4);
      g.fillRect(4, 4, 2, 2);
      g.fillRect(26, 4, 2, 2);
      g.fillRect(4, 26, 2, 2);
      g.fillRect(26, 26, 2, 2);
    });

    // Server Room Tile
    make('tile_server', 0x16131e, 0x2a2438, (g) => {
      g.fillStyle(0x1e1a28, 0.5);
      g.fillRect(0, 16, 32, 16);
    });
  }

  // ─── Floor Zone Rendering ──────────────────────────────────────────────────

  private drawFloorZones() {
    const w = this.W, h = this.H;
    const midX = 260, midY = 330;

    for (let x = 0; x < w; x += 32) {
      for (let y = 0; y < h; y += 32) {
        // Michael's Executive Office (Top-Left)
        if (x < midX && y < 180) {
          if (x >= 40 && x <= 200 && y >= 40 && y <= 140) {
            this.add.image(x, y, 'tile_rug').setOrigin(0, 0);
          } else {
            this.add.image(x, y, 'tile_oak').setOrigin(0, 0);
          }
        }
        // TechStore Hub (Top-Right)
        else if (x >= midX && y < 180) {
          const alt = ((x / 32) + (y / 32)) % 2 === 0;
          this.add.image(x, y, alt ? 'tile_oak' : 'tile_walnut').setOrigin(0, 0);
        }
        // Authority + Central Hallway (Middle-Left / Center)
        else if (y >= 180 && y < midY && x < midX) {
          this.add.image(x, y, 'tile_carpet').setOrigin(0, 0);
        }
        // Payment Counter Area (Middle-Right)
        else if (y >= 180 && y < midY && x >= midX) {
          this.add.image(x, y, 'tile_carpet').setOrigin(0, 0);
        }
        // Breakroom (Bottom-Left)
        else if (y >= midY && x < midX) {
          this.add.image(x, y, 'tile_check').setOrigin(0, 0);
        }
        // Server Room (Bottom-Right)
        else if (y >= midY && x >= midX) {
          this.add.image(x, y, 'tile_server').setOrigin(0, 0);
        }
        else {
          this.add.image(x, y, 'tile_oak').setOrigin(0, 0);
        }
      }
    }
  }

  // ─── Walls, Doors & Room Labels ────────────────────────────────────────────

  private drawWallsAndDoors() {
    const gfx = this.add.graphics();
    const w = this.W, h = this.H;
    const midX = 260, midY = 330;

    // Outer border
    gfx.lineStyle(4, 0x1a1320, 1);
    gfx.strokeRect(6, 6, w - 12, h - 12);

    // ── Horizontal Dividers ──
    // Top rooms / middle area divider (y = 180)
    gfx.fillStyle(0x8b6f47, 1);
    gfx.fillRect(8, 177, midX - 60, 8);   // left wall segment
    gfx.fillRect(midX + 10, 177, w - midX - 18, 8); // right wall segment
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeRect(8, 177, midX - 60, 8);
    gfx.strokeRect(midX + 10, 177, w - midX - 18, 8);

    // Doorway openings
    gfx.fillStyle(0xe8d8b0, 1);
    gfx.fillRect(midX - 52, 177, 62, 8);  // Center door

    // Middle / Bottom divider (y = midY)
    gfx.fillStyle(0x8b6f47, 1);
    gfx.fillRect(8, midY - 3, midX - 50, 8);
    gfx.fillRect(midX + 20, midY - 3, w - midX - 28, 8);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeRect(8, midY - 3, midX - 50, 8);
    gfx.strokeRect(midX + 20, midY - 3, w - midX - 28, 8);

    // Doorway openings
    gfx.fillStyle(0xe8d8b0, 1);
    gfx.fillRect(midX - 48, midY - 3, 68, 8);

    // ── Vertical Divider (x = midX) ──
    gfx.fillStyle(0x8b6f47, 1);
    gfx.fillRect(midX - 4, 8, 8, 170);     // Top rooms divider
    gfx.fillRect(midX - 4, midY + 5, 8, h - midY - 13); // Bottom rooms divider
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeRect(midX - 4, 8, 8, 170);
    gfx.strokeRect(midX - 4, midY + 5, 8, h - midY - 13);

    // Room Label Badges
    this.drawRoomBadge(20, 14, "👑 MICHAEL'S OFFICE", 0x4ecdc4);
    this.drawRoomBadge(midX + 16, 14, '🏪 TECHSTORE HUB', 0xffa07a);
    this.drawRoomBadge(20, 190, '🛡️ AUTHORITY & HUB', 0xb197fc);
    this.drawRoomBadge(midX + 16, 190, '💳 PAYMENT DESK', 0xffd93d);
    this.drawRoomBadge(20, midY + 8, '☕ BREAKROOM', 0x6bcf7f);
    this.drawRoomBadge(midX + 16, midY + 8, '⚡ SERVER ROOM', 0xff6b6b);
  }

  private drawRoomBadge(x: number, y: number, text: string, accent: number) {
    const badge = this.add.graphics();
    badge.fillStyle(0xfffdf5, 0.92);
    badge.fillRoundedRect(x, y, 135, 18, 3);
    badge.lineStyle(1.5, 0x1a1320, 1);
    badge.strokeRoundedRect(x, y, 135, 18, 3);

    badge.fillStyle(accent, 1);
    badge.fillRect(x + 3, y + 3, 4, 12);

    this.add.text(x + 12, y + 9, text, {
      fontFamily: 'monospace',
      fontSize: '8px',
      fontStyle: 'bold',
      color: '#1A1320',
    }).setOrigin(0, 0.5);
  }

  // ─── Furniture & Station Drawing ───────────────────────────────────────────

  private drawFurniture() {
    // Michael's Executive Desk
    this.drawExecutiveDesk(120, 85);

    // TechStore Merchant Station
    this.drawWorkstationDesk(400, 85, 0xffa07a, 'INVENTORY SYSTEM');

    // Central Web Hub
    this.drawWebGroundingStation(260, 240);

    // Authority Policy Desk
    this.drawWorkstationDesk(120, 250, 0xb197fc, 'POLICY ENGINE');

    // Payment Counter
    this.drawPaymentCounter(400, 250);

    // Breakroom
    this.drawBreakroomFurniture();

    // Server Racks
    this.drawServerRacks(360, 370);

    // Decorative plants
    this.drawPlant(230, 30);
    this.drawPlant(500, 30);
    this.drawPlant(230, 290);
    this.drawPlant(500, 290);
  }

  private drawExecutiveDesk(x: number, y: number) {
    const gfx = this.add.graphics();

    // L-shaped mahogany desk
    gfx.fillStyle(0x6e1423, 1);
    gfx.fillRoundedRect(x - 35, y - 18, 70, 36, 4);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeRoundedRect(x - 35, y - 18, 70, 36, 4);

    // Dual widescreen monitors
    gfx.fillStyle(0x1a1320, 1);
    gfx.fillRect(x - 26, y - 14, 24, 14);
    gfx.fillRect(x + 2, y - 14, 24, 14);
    gfx.lineStyle(1, 0x2a2438, 1);
    gfx.strokeRect(x - 26, y - 14, 24, 14);
    gfx.strokeRect(x + 2, y - 14, 24, 14);

    // Monitor glow (teal + green)
    gfx.fillStyle(0x4ecdc4, 0.95);
    gfx.fillRect(x - 24, y - 12, 20, 10);
    gfx.fillStyle(0x6bcf7f, 0.95);
    gfx.fillRect(x + 4, y - 12, 20, 10);

    // Keyboard
    gfx.fillStyle(0xfffdf5, 1);
    gfx.fillRect(x - 14, y + 4, 20, 6);
    gfx.lineStyle(1, 0xd9cfe0, 1);
    gfx.strokeRect(x - 14, y + 4, 20, 6);

    // Mouse
    gfx.fillStyle(0xd9cfe0, 1);
    gfx.fillRect(x + 14, y + 5, 6, 4);

    // Gold nameplate
    gfx.fillStyle(0xffd93d, 1);
    gfx.fillRect(x - 12, y + 14, 24, 5);
    gfx.lineStyle(1, 0x1a1320, 1);
    gfx.strokeRect(x - 12, y + 14, 24, 5);

    // Executive leather chair
    gfx.fillStyle(0x8b2635, 1);
    gfx.fillCircle(x, y + 30, 11);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeCircle(x, y + 30, 11);
    // Chair wheels
    gfx.fillStyle(0x3d2e4a, 1);
    for (let a = 0; a < 5; a++) {
      const angle = (a / 5) * Math.PI * 2 - Math.PI / 2;
      gfx.fillCircle(x + Math.cos(angle) * 13, y + 30 + Math.sin(angle) * 13, 2);
    }
  }

  private drawWorkstationDesk(x: number, y: number, screenColor: number, label: string) {
    const gfx = this.add.graphics();

    // Desk surface
    gfx.fillStyle(0xd49b4b, 1);
    gfx.fillRoundedRect(x - 28, y - 16, 56, 32, 3);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeRoundedRect(x - 28, y - 16, 56, 32, 3);

    // Monitor (CRT style)
    gfx.fillStyle(0x2a2438, 1);
    gfx.fillRect(x - 14, y - 14, 28, 16);
    gfx.lineStyle(1.5, 0x1a1320, 1);
    gfx.strokeRect(x - 14, y - 14, 28, 16);

    // Glowing screen
    gfx.fillStyle(screenColor, 0.9);
    gfx.fillRect(x - 12, y - 12, 24, 12);

    // Code lines on screen
    gfx.fillStyle(0xfffdf5, 0.4);
    for (let i = 0; i < 4; i++) {
      gfx.fillRect(x - 10 + (i % 2) * 3, y - 11 + i * 3, 10 + (i % 3) * 4, 1);
    }

    // Keyboard & coffee mug
    gfx.fillStyle(0xfffdf5, 1);
    gfx.fillRect(x - 10, y + 4, 16, 5);
    gfx.fillStyle(0xff6b6b, 1);
    gfx.fillCircle(x + 14, y + 7, 3);

    // Standard chair
    gfx.fillStyle(0x3d2e4a, 1);
    gfx.fillCircle(x, y + 26, 9);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeCircle(x, y + 26, 9);

    // Label
    this.add.text(x, y - 24, label, {
      fontFamily: 'monospace',
      fontSize: '7px',
      fontStyle: 'bold',
      color: '#3D2E4A',
    }).setOrigin(0.5);
  }

  private drawWebGroundingStation(x: number, y: number) {
    const gfx = this.add.graphics();

    // Holographic table
    gfx.fillStyle(0x3d2e4a, 1);
    gfx.fillCircle(x, y, 24);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeCircle(x, y, 24);

    // Globe radar screen
    gfx.fillStyle(0x4ecdc4, 0.8);
    gfx.fillCircle(x, y, 16);

    // Radar rings
    gfx.lineStyle(1, 0xfffdf5, 0.6);
    gfx.strokeCircle(x, y, 12);
    gfx.strokeCircle(x, y, 8);

    // Center blip
    gfx.fillStyle(0xffd93d, 1);
    gfx.fillCircle(x, y, 4);
    gfx.lineStyle(1, 0x1a1320, 1);
    gfx.strokeCircle(x, y, 4);

    // Radial dots (data points)
    const dots = [
      { dx: -10, dy: -6, c: 0xff6b6b },
      { dx: 8, dy: -8, c: 0x6bcf7f },
      { dx: -5, dy: 10, c: 0xb197fc },
      { dx: 11, dy: 5, c: 0xffa07a },
    ];
    dots.forEach(({ dx, dy, c }) => {
      gfx.fillStyle(c, 1);
      gfx.fillCircle(x + dx, y + dy, 2);
    });

    this.add.text(x, y + 30, '🌐 LIVE WEB HUB', {
      fontFamily: 'monospace',
      fontSize: '8px',
      fontStyle: 'bold',
      color: '#1A1320',
    }).setOrigin(0.5);
  }

  private drawPaymentCounter(x: number, y: number) {
    const gfx = this.add.graphics();

    // Marble counter
    gfx.fillStyle(0xfffdf5, 1);
    gfx.fillRoundedRect(x - 32, y - 15, 64, 30, 3);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeRoundedRect(x - 32, y - 15, 64, 30, 3);

    // Cash register
    gfx.fillStyle(0x1a1320, 1);
    gfx.fillRect(x - 20, y - 12, 20, 16);
    gfx.fillStyle(0x6bcf7f, 1);
    gfx.fillRect(x - 18, y - 10, 16, 8);

    // Card terminal
    gfx.fillStyle(0xffd93d, 1);
    gfx.fillRect(x + 6, y - 8, 14, 14);
    gfx.lineStyle(1, 0x1a1320, 1);
    gfx.strokeRect(x + 6, y - 8, 14, 14);

    // Card slot line
    gfx.fillStyle(0x1a1320, 1);
    gfx.fillRect(x + 10, y - 2, 6, 2);

    this.add.text(x, y - 22, '💳 RAZORPAY POS', {
      fontFamily: 'monospace',
      fontSize: '7px',
      fontStyle: 'bold',
      color: '#1A1320',
    }).setOrigin(0.5);
  }

  private drawBreakroomFurniture() {
    const gfx = this.add.graphics();

    // Coffee counter
    gfx.fillStyle(0xfff8e7, 1);
    gfx.fillRect(20, 365, 60, 28);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeRect(20, 365, 60, 28);

    // Coffee machine
    gfx.fillStyle(0x3d2e4a, 1);
    gfx.fillRect(26, 356, 18, 16);
    gfx.fillStyle(0xff6b6b, 1);
    gfx.fillRect(29, 363, 12, 7);

    // Water cooler
    gfx.fillStyle(0xfffdf5, 1);
    gfx.fillRect(95, 370, 20, 26);
    gfx.lineStyle(1.5, 0x1a1320, 1);
    gfx.strokeRect(95, 370, 20, 26);
    gfx.fillStyle(0x4ecdc4, 0.85);
    gfx.fillRoundedRect(97, 356, 16, 16, 4);

    // Lounge couch
    gfx.fillStyle(0x4ba85c, 1);
    gfx.fillRoundedRect(130, 375, 55, 24, 5);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeRoundedRect(130, 375, 55, 24, 5);

    // Cushion detail
    gfx.fillStyle(0x3d9e4d, 0.5);
    gfx.fillRoundedRect(135, 380, 20, 14, 3);
    gfx.fillRoundedRect(160, 380, 20, 14, 3);

    // Small table
    gfx.fillStyle(0xd49b4b, 1);
    gfx.fillCircle(200, 395, 10);
    gfx.lineStyle(1.5, 0x1a1320, 1);
    gfx.strokeCircle(200, 395, 10);
  }

  private drawServerRacks(x: number, y: number) {
    const gfx = this.add.graphics();

    for (let r = 0; r < 4; r++) {
      const rx = x + r * 38;

      // Rack chassis
      gfx.fillStyle(0x13111c, 1);
      gfx.fillRect(rx, y, 28, 56);
      gfx.lineStyle(2, 0x1a1320, 1);
      gfx.strokeRect(rx, y, 28, 56);

      // Rack unit slots
      gfx.fillStyle(0x2a2438, 1);
      for (let s = 0; s < 5; s++) {
        gfx.fillRect(rx + 3, y + 4 + s * 10, 22, 7);
      }

      // LED container (dynamic)
      const lightGfx = this.add.graphics();
      this.serverLights.push(lightGfx);
    }
  }

  private drawPlant(x: number, y: number) {
    const gfx = this.add.graphics();

    // Pot
    gfx.fillStyle(0xba5d39, 1);
    gfx.fillRoundedRect(x, y + 10, 16, 14, 2);
    gfx.lineStyle(1.5, 0x1a1320, 1);
    gfx.strokeRoundedRect(x, y + 10, 16, 14, 2);

    // Leaves (layered spheres)
    gfx.fillStyle(0x6bcf7f, 1);
    gfx.fillCircle(x + 8, y + 6, 9);
    gfx.fillStyle(0x4ba85c, 1);
    gfx.fillCircle(x + 4, y + 9, 7);
    gfx.fillCircle(x + 12, y + 9, 7);
    gfx.fillStyle(0x3d8f44, 1);
    gfx.fillCircle(x + 8, y + 3, 5);
  }

  // ─── Ambient Animations ────────────────────────────────────────────────────

  private blinkServerLights() {
    const colors = [0x6bcf7f, 0x4ecdc4, 0xffd93d, 0xff6b6b, 0xb197fc];
    this.serverLights.forEach((gfx, idx) => {
      gfx.clear();
      for (let i = 0; i < 5; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const alpha = 0.6 + Math.random() * 0.4;
        gfx.fillStyle(color, alpha);
        gfx.fillCircle(364 + idx * 38 + 22, 374 + i * 10, 2);
      }
    });
  }

  private animateCoffeeSteam() {
    const steam = this.add.circle(35, 352, 2.5, 0xffffff, 0.6);
    this.tweens.add({
      targets: steam,
      y: 336,
      alpha: 0,
      scale: 2,
      duration: 1200,
      ease: 'Sine.easeOut',
      onComplete: () => steam.destroy(),
    });
  }

  // ─── Character Avatars ─────────────────────────────────────────────────────

  private createCharacterAvatars() {
    this.agentsData.forEach((agent) => {
      const avatar = this.createAvatar(agent);
      this.characters[agent.id] = avatar;
    });
  }

  private createAvatar(agent: AgentState): Phaser.GameObjects.Container {
    const container = this.add.container(agent.homeX, agent.homeY);
    container.setDepth(100);
    const gfx = this.add.graphics();

    // Shadow
    gfx.fillStyle(0x1a1320, 0.3);
    gfx.fillEllipse(0, 20, 22, 8);

    // Legs
    gfx.fillStyle(agent.pantColor, 1);
    gfx.fillRect(-5, 7, 4, 12);
    gfx.fillRect(1, 7, 4, 12);
    gfx.lineStyle(1, 0x1a1320, 1);
    gfx.strokeRect(-5, 7, 4, 12);
    gfx.strokeRect(1, 7, 4, 12);

    // Torso
    gfx.fillStyle(agent.shirtColor, 1);
    gfx.fillRoundedRect(-8, -5, 16, 13, 2);
    gfx.lineStyle(1.5, 0x1a1320, 1);
    gfx.strokeRoundedRect(-8, -5, 16, 13, 2);

    // Tie / collar detail
    gfx.fillStyle(0x1a1320, 1);
    gfx.fillRect(-1, -5, 2, 10);

    // Head
    gfx.fillStyle(0xffd8b3, 1);
    gfx.fillCircle(0, -12, 9);
    gfx.lineStyle(1.5, 0x1a1320, 1);
    gfx.strokeCircle(0, -12, 9);

    // Hair (varies per agent)
    const hairColor = agent.id === 'SALES_AGENT' ? 0x2e1a0c
      : agent.id === 'MERCHANT_AGENT' ? 0x4a2e18
      : agent.id === 'AUTHORITY_AGENT' ? 0x1a1320
      : 0x5a3a1a;
    gfx.fillStyle(hairColor, 1);
    gfx.fillArc(0, -14, 9, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false);
    gfx.fillRect(-8, -18, 16, 5);

    // Eyes
    gfx.fillStyle(0x1a1320, 1);
    gfx.fillRect(-4, -13, 2, 2);
    gfx.fillRect(2, -13, 2, 2);

    // Smile
    gfx.fillStyle(0x1a1320, 1);
    gfx.fillRect(-2, -9, 4, 1);

    container.add(gfx);

    // Nameplate badge
    const badge = this.add.graphics();
    badge.fillStyle(0xfffdf5, 0.95);
    badge.fillRoundedRect(-46, 24, 92, 16, 3);
    badge.lineStyle(1.5, 0x1a1320, 1);
    badge.strokeRoundedRect(-46, 24, 92, 16, 3);
    badge.fillStyle(agent.accent, 1);
    badge.fillRect(-42, 28, 6, 8);
    container.add(badge);

    const nameText = this.add.text(0, 32, agent.name, {
      fontFamily: 'monospace',
      fontSize: '8px',
      fontStyle: 'bold',
      color: '#1A1320',
    }).setOrigin(0.5);
    container.add(nameText);

    // Status emote
    const emoteContainer = this.add.container(0, -30);
    const emoteBg = this.add.graphics();
    emoteBg.fillStyle(agent.accent, 1);
    emoteBg.fillCircle(0, 0, 9);
    emoteBg.lineStyle(1.5, 0x1a1320, 1);
    emoteBg.strokeCircle(0, 0, 9);
    const emoteText = this.add.text(0, 0, '⚡', { fontSize: '9px' }).setOrigin(0.5);
    emoteContainer.add([emoteBg, emoteText]);
    emoteContainer.setVisible(false);
    container.add(emoteContainer);
    this.statusBadges[agent.id] = emoteContainer;

    // Speech bubble
    const bubbleContainer = this.add.container(0, -52);
    bubbleContainer.setVisible(false);

    const bubbleBg = this.add.graphics();
    bubbleBg.fillStyle(0xfffdf5, 1);
    bubbleBg.fillRoundedRect(-90, -24, 180, 40, 5);
    bubbleBg.lineStyle(2, 0x1a1320, 1);
    bubbleBg.strokeRoundedRect(-90, -24, 180, 40, 5);

    // Inner border accent
    bubbleBg.lineStyle(1, 0xf4e9c7, 1);
    bubbleBg.strokeRoundedRect(-88, -22, 176, 36, 3);

    // Speech pointer
    bubbleBg.fillStyle(0xfffdf5, 1);
    bubbleBg.fillTriangle(0, 20, -7, 14, 7, 14);
    bubbleBg.lineStyle(2, 0x1a1320, 1);
    bubbleBg.lineBetween(0, 20, -7, 14);
    bubbleBg.lineBetween(0, 20, 7, 14);

    const bubbleText = this.add.text(0, -4, '', {
      fontFamily: 'monospace',
      fontSize: '9px',
      fontStyle: 'bold',
      color: '#1A1320',
      wordWrap: { width: 165 },
      align: 'center',
    }).setOrigin(0.5);

    bubbleContainer.add([bubbleBg, bubbleText]);
    container.add(bubbleContainer);
    this.speechBubbles[agent.id] = bubbleContainer;

    // Idle breathing animation
    this.tweens.add({
      targets: container,
      y: agent.homeY - 2,
      duration: 1200 + Math.random() * 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Make interactive
    container.setSize(50, 60);
    container.setInteractive({ useHandCursor: true });
    container.on('pointerover', () => {
      if (this.tooltipText) {
        this.tooltipText.setText(`${agent.name}\n${agent.role}`);
        this.tooltipText.setPosition(container.x, container.y - 62);
        this.tooltipText.setVisible(true);
      }
    });
    container.on('pointerout', () => {
      if (this.tooltipText) this.tooltipText.setVisible(false);
    });

    return container;
  }

  // ─── Agent Movement ────────────────────────────────────────────────────────

  public moveAgentToStation(agentId: string, stationKey: string, onArrival?: () => void) {
    const avatar = this.characters[agentId];
    const station = this.stations[stationKey];
    if (!avatar || !station) return;

    const emote = this.statusBadges[agentId];
    if (emote) {
      emote.setVisible(true);
      (emote.getAt(1) as Phaser.GameObjects.Text).setText('🚶');
    }

    this.tweens.add({
      targets: avatar,
      x: station.x,
      y: station.y,
      duration: 800,
      ease: 'Power2.easeOut',
      onComplete: () => {
        if (emote) (emote.getAt(1) as Phaser.GameObjects.Text).setText('⚡');
        if (onArrival) onArrival();
      },
    });
  }

  // ─── Event Handlers (from React) ───────────────────────────────────────────

  public handleAgentSpeech(data: { agent: string; text: string }) {
    const msg = data.text.toLowerCase();

    // Context-driven character movement
    if (msg.includes('search') || msg.includes('phone') || msg.includes('laptop') || msg.includes('find') || msg.includes('looking')) {
      this.moveAgentToStation('SALES_AGENT', 'WEB_RESEARCH_HUB');
    } else if (msg.includes('cart') || msg.includes('discount') || msg.includes('stock') || msg.includes('inventory')) {
      this.moveAgentToStation('MERCHANT_AGENT', 'MERCHANT_DESK');
      this.moveAgentToStation('SALES_AGENT', 'MERCHANT_DESK');
    } else if (msg.includes('pay') || msg.includes('order') || msg.includes('checkout') || msg.includes('buy')) {
      this.moveAgentToStation('CUSTOMER', 'PAYMENT_COUNTER');
      this.moveAgentToStation('AUTHORITY_AGENT', 'PAYMENT_COUNTER');
    } else if (msg.includes('policy') || msg.includes('budget') || msg.includes('limit') || msg.includes('verify')) {
      this.moveAgentToStation('AUTHORITY_AGENT', 'AUTHORITY_DESK');
    }

    // Show speech bubble
    const bubble = this.speechBubbles[data.agent];
    if (bubble) {
      const textObj = bubble.getAt(1) as Phaser.GameObjects.Text;
      if (textObj) {
        textObj.setText(data.text.slice(0, 55) + (data.text.length > 55 ? '…' : ''));
      }
      bubble.setVisible(true);
      bubble.setAlpha(1);

      this.tweens.add({
        targets: bubble,
        alpha: 0,
        delay: 5000,
        duration: 500,
        onComplete: () => bubble.setVisible(false),
      });
    }
  }

  public handleAgentAction(data: { agent: string; action: string }) {
    const emote = this.statusBadges[data.agent];
    if (!emote) return;

    const textObj = emote.getAt(1) as Phaser.GameObjects.Text;
    const actionEmoji: { [k: string]: string } = {
      SEARCH: '🔍',
      VALIDATE: '🛡️',
      PAY: '💳',
      CART: '🛒',
      NEGOTIATE: '🤝',
    };
    textObj.setText(actionEmoji[data.action] || '⚡');
    emote.setVisible(true);

    // Auto-hide after delay
    this.time.delayedCall(3000, () => {
      textObj.setText('⚡');
    });
  }

  public handleFlyingEnvelope(data: { from: string; to: string }) {
    const sender = this.characters[data.from] || this.characters['SALES_AGENT'];
    const recipient = this.characters[data.to] || this.characters['MERCHANT_AGENT'];
    if (!sender || !recipient) return;

    const envelope = this.add.container(sender.x, sender.y - 18);
    envelope.setDepth(150);
    const gfx = this.add.graphics();

    // Envelope body
    gfx.fillStyle(0xfffdf5, 1);
    gfx.fillRect(-9, -6, 18, 12);
    gfx.lineStyle(1.5, 0x1a1320, 1);
    gfx.strokeRect(-9, -6, 18, 12);

    // Envelope flap
    gfx.fillStyle(0xff6b6b, 1);
    gfx.fillTriangle(0, 2, -7, -5, 7, -5);
    envelope.add(gfx);

    // Trail particles
    this.tweens.add({
      targets: envelope,
      x: recipient.x,
      y: recipient.y - 18,
      duration: 700,
      ease: 'Quad.easeInOut',
      onUpdate: () => {
        const trail = this.add.circle(envelope.x, envelope.y + 4, 1.5, 0xffd93d, 0.5);
        trail.setDepth(149);
        this.tweens.add({
          targets: trail,
          alpha: 0,
          scale: 0.3,
          duration: 300,
          onComplete: () => trail.destroy(),
        });
      },
      onComplete: () => {
        // Delivery flash
        const flash = this.add.circle(recipient.x, recipient.y - 10, 12, 0xffd93d, 0.6);
        flash.setDepth(150);
        this.tweens.add({
          targets: flash,
          alpha: 0,
          scale: 2.5,
          duration: 400,
          onComplete: () => flash.destroy(),
        });
        envelope.destroy();
      },
    });
  }
}
