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
 * OfficeScene — High-performance retro pixel-art office for AgentPay multi-agent platform.
 * Fully self-contained Graphics rendering (no texture generation failure modes).
 * Fixed 540 × 480 virtual canvas with automatic FIT scaling.
 */
export class OfficeScene extends Phaser.Scene {
  private characters: { [key: string]: Phaser.GameObjects.Container } = {};
  private speechBubbles: { [key: string]: Phaser.GameObjects.Container } = {};
  private statusBadges: { [key: string]: Phaser.GameObjects.Container } = {};
  private serverLights: Phaser.GameObjects.Graphics[] = [];
  private tooltipText: Phaser.GameObjects.Text | null = null;

  private W = 540;
  private H = 480;

  private stations: { [key: string]: { x: number; y: number; name: string } } = {
    MICHAEL_DESK:      { x: 125, y: 95, name: "Michael's Office" },
    MERCHANT_DESK:     { x: 405, y: 95, name: 'TechStore Hub' },
    AUTHORITY_DESK:    { x: 125, y: 255, name: 'Authority Desk' },
    PAYMENT_COUNTER:   { x: 405, y: 255, name: 'Payment Counter' },
    WEB_RESEARCH_HUB:  { x: 265, y: 195, name: 'Web Grounding Hub' },
    SERVER_ROOM:       { x: 420, y: 395, name: 'Server Room' },
    BREAKROOM:         { x: 125, y: 395, name: 'Breakroom' },
  };

  private agentsData: AgentState[] = [
    {
      id: 'SALES_AGENT',
      name: 'Michael (Sales)',
      role: 'Sales Discovery',
      accent: 0x4ecdc4,
      shirtColor: 0x4ecdc4,
      pantColor: 0x1a1320,
      homeX: 125,
      homeY: 95,
      currentStation: 'MICHAEL_DESK',
    },
    {
      id: 'MERCHANT_AGENT',
      name: 'TechStore Agent',
      role: 'Merchant Inventory',
      accent: 0xffa07a,
      shirtColor: 0xffa07a,
      pantColor: 0x3d2e4a,
      homeX: 405,
      homeY: 95,
      currentStation: 'MERCHANT_DESK',
    },
    {
      id: 'AUTHORITY_AGENT',
      name: 'Authority Gatekeeper',
      role: 'Policy & Budget',
      accent: 0xb197fc,
      shirtColor: 0xb197fc,
      pantColor: 0x1a1320,
      homeX: 125,
      homeY: 255,
      currentStation: 'AUTHORITY_DESK',
    },
    {
      id: 'CUSTOMER',
      name: 'Customer',
      role: 'Shopper',
      accent: 0x6bcf7f,
      shirtColor: 0x6bcf7f,
      pantColor: 0x2e384d,
      homeX: 265,
      homeY: 315,
      currentStation: 'PAYMENT_COUNTER',
    },
  ];

  constructor() {
    super({ key: 'OfficeScene' });
  }

  create() {
    // 1. Direct crisp graphics floor rendering
    this.drawFloor();

    // 2. Walls, doors & room labels
    this.drawWallsAndLabels();

    // 3. Furniture & stations
    this.drawFurniture();

    // 4. Character Avatars
    this.createCharacterAvatars();

    // 5. Ambient animations
    this.time.addEvent({ delay: 300, callback: this.blinkServerLights, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 600, callback: this.animateCoffeeSteam, callbackScope: this, loop: true });

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

  // ─── Direct High-Performance Floor Rendering ───────────────────────────────

  private drawFloor() {
    const gfx = this.add.graphics();
    const w = this.W;
    const midX = 265;
    const midY = 325;
    const topH = 175;

    // 1. Base floor background
    gfx.fillStyle(0xe5c896, 1);
    gfx.fillRect(0, 0, w, this.H);

    // 2. Room Zone Colors
    // Michael's Office (Top-Left): Elegant Wood + Persian Rug
    gfx.fillStyle(0xd9b982, 1);
    gfx.fillRect(8, 8, midX - 12, topH - 8);
    // Rug
    gfx.fillStyle(0x7a1f2d, 1);
    gfx.fillRoundedRect(35, 35, 180, 115, 6);
    gfx.lineStyle(2, 0xd4a017, 0.8);
    gfx.strokeRoundedRect(35, 35, 180, 115, 6);
    gfx.lineStyle(1, 0xf4d35e, 0.4);
    gfx.strokeRoundedRect(42, 42, 166, 101, 4);

    // TechStore Hub (Top-Right): Polished Walnut
    gfx.fillStyle(0xc9a66b, 1);
    gfx.fillRect(midX + 4, 8, w - midX - 12, topH - 8);
    // Grid planks
    gfx.lineStyle(1, 0xb89255, 0.5);
    for (let py = 24; py < topH; py += 24) {
      gfx.lineBetween(midX + 4, py, w - 8, py);
    }

    // Hallway / Authority Area (Mid-Left & Center): Warm Carpet
    gfx.fillStyle(0xe8d8b0, 1);
    gfx.fillRect(8, topH, w - 16, midY - topH);

    // Breakroom (Bottom-Left): Retro Checkered Tiles
    const tileSize = 20;
    for (let x = 8; x < midX - 4; x += tileSize) {
      for (let y = midY; y < this.H - 8; y += tileSize) {
        const isWhite = ((Math.floor((x - 8) / tileSize) + Math.floor((y - midY) / tileSize)) % 2) === 0;
        gfx.fillStyle(isWhite ? 0xfffdf5 : 0xd9cfe0, 1);
        gfx.fillRect(x, y, Math.min(tileSize, midX - 4 - x), Math.min(tileSize, this.H - 8 - y));
      }
    }

    // Server Room (Bottom-Right): High-tech Dark Cyber Grid
    gfx.fillStyle(0x16131e, 1);
    gfx.fillRect(midX + 4, midY, w - midX - 12, this.H - midY - 8);
    gfx.lineStyle(1, 0x2a2438, 0.8);
    for (let x = midX + 4; x < w - 8; x += 24) {
      gfx.lineBetween(x, midY, x, this.H - 8);
    }
    for (let y = midY; y < this.H - 8; y += 24) {
      gfx.lineBetween(midX + 4, y, w - 8, y);
    }
  }

  // ─── Walls, Doorways & Room Labels ─────────────────────────────────────────

  private drawWallsAndLabels() {
    const gfx = this.add.graphics();
    const w = this.W;
    const h = this.H;
    const midX = 265;
    const midY = 325;
    const topH = 175;

    // Outer border frame
    gfx.lineStyle(4, 0x1a1320, 1);
    gfx.strokeRect(6, 6, w - 12, h - 12);

    // Top horizontal divider
    gfx.fillStyle(0x8b6f47, 1);
    gfx.fillRect(8, topH - 4, midX - 55, 8);
    gfx.fillRect(midX + 15, topH - 4, w - midX - 23, 8);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeRect(8, topH - 4, midX - 55, 8);
    gfx.strokeRect(midX + 15, topH - 4, w - midX - 23, 8);

    // Bottom horizontal divider
    gfx.fillStyle(0x8b6f47, 1);
    gfx.fillRect(8, midY - 4, midX - 55, 8);
    gfx.fillRect(midX + 15, midY - 4, w - midX - 23, 8);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeRect(8, midY - 4, midX - 55, 8);
    gfx.strokeRect(midX + 15, midY - 4, w - midX - 23, 8);

    // Vertical central divider (Top section)
    gfx.fillStyle(0x8b6f47, 1);
    gfx.fillRect(midX - 4, 8, 8, topH - 12);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeRect(midX - 4, 8, 8, topH - 12);

    // Vertical central divider (Bottom section)
    gfx.fillStyle(0x8b6f47, 1);
    gfx.fillRect(midX - 4, midY + 4, 8, h - midY - 12);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeRect(midX - 4, midY + 4, 8, h - midY - 12);

    // Room Label Badges
    this.drawRoomBadge(16, 12, "👑 MICHAEL'S OFFICE", 0x4ecdc4);
    this.drawRoomBadge(midX + 14, 12, '🏪 TECHSTORE HUB', 0xffa07a);
    this.drawRoomBadge(16, topH + 10, '🛡️ AUTHORITY DESK', 0xb197fc);
    this.drawRoomBadge(midX + 14, topH + 10, '💳 PAYMENT DESK', 0xffd93d);
    this.drawRoomBadge(16, midY + 8, '☕ BREAKROOM', 0x6bcf7f);
    this.drawRoomBadge(midX + 14, midY + 8, '⚡ SERVER ROOM', 0xff6b6b);
  }

  private drawRoomBadge(x: number, y: number, text: string, accent: number) {
    const badge = this.add.graphics();
    badge.fillStyle(0xfffdf5, 0.95);
    badge.fillRoundedRect(x, y, 130, 18, 3);
    badge.lineStyle(1.5, 0x1a1320, 1);
    badge.strokeRoundedRect(x, y, 130, 18, 3);

    badge.fillStyle(accent, 1);
    badge.fillRect(x + 3, y + 3, 4, 12);

    this.add.text(x + 11, y + 9, text, {
      fontFamily: 'monospace',
      fontSize: '8px',
      fontStyle: 'bold',
      color: '#1A1320',
    }).setOrigin(0, 0.5);
  }

  // ─── Furniture & Workstations ──────────────────────────────────────────────

  private drawFurniture() {
    // Michael's Executive Mahogany Desk
    this.drawExecutiveDesk(125, 80);

    // TechStore Merchant Station
    this.drawWorkstationDesk(405, 80, 0xffa07a, 'INVENTORY HUB');

    // Central Live Web Radar Hub
    this.drawWebGroundingStation(265, 235);

    // Authority Desk
    this.drawWorkstationDesk(125, 245, 0xb197fc, 'POLICY ENGINE');

    // Payment Counter
    this.drawPaymentCounter(405, 245);

    // Breakroom Items
    this.drawBreakroomFurniture();

    // Server Racks
    this.drawServerRacks(365, 365);

    // Decorative Plants
    this.drawPlant(235, 25);
    this.drawPlant(505, 25);
    this.drawPlant(235, 285);
    this.drawPlant(505, 285);
  }

  private drawExecutiveDesk(x: number, y: number) {
    const gfx = this.add.graphics();

    // Desk
    gfx.fillStyle(0x6e1423, 1);
    gfx.fillRoundedRect(x - 35, y - 16, 70, 32, 4);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeRoundedRect(x - 35, y - 16, 70, 32, 4);

    // Dual monitors
    gfx.fillStyle(0x1a1320, 1);
    gfx.fillRect(x - 24, y - 12, 22, 13);
    gfx.fillRect(x + 2, y - 12, 22, 13);
    gfx.fillStyle(0x4ecdc4, 0.9);
    gfx.fillRect(x - 22, y - 10, 18, 9);
    gfx.fillStyle(0x6bcf7f, 0.9);
    gfx.fillRect(x + 4, y - 10, 18, 9);

    // Keyboard & mouse
    gfx.fillStyle(0xfffdf5, 1);
    gfx.fillRect(x - 12, y + 4, 18, 5);
    gfx.fillStyle(0xd9cfe0, 1);
    gfx.fillRect(x + 12, y + 5, 5, 3);

    // Leather chair
    gfx.fillStyle(0x8b2635, 1);
    gfx.fillCircle(x, y + 26, 10);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeCircle(x, y + 26, 10);
  }

  private drawWorkstationDesk(x: number, y: number, screenColor: number, label: string) {
    const gfx = this.add.graphics();

    // Desk
    gfx.fillStyle(0xd49b4b, 1);
    gfx.fillRoundedRect(x - 28, y - 15, 56, 30, 3);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeRoundedRect(x - 28, y - 15, 56, 30, 3);

    // Monitor
    gfx.fillStyle(0x2a2438, 1);
    gfx.fillRect(x - 14, y - 13, 28, 15);
    gfx.fillStyle(screenColor, 0.9);
    gfx.fillRect(x - 12, y - 11, 24, 11);

    // Code lines
    gfx.fillStyle(0xfffdf5, 0.5);
    for (let i = 0; i < 3; i++) {
      gfx.fillRect(x - 10, y - 10 + i * 3, 12 + i * 3, 1);
    }

    // Keyboard & mug
    gfx.fillStyle(0xfffdf5, 1);
    gfx.fillRect(x - 10, y + 3, 16, 5);
    gfx.fillStyle(0xff6b6b, 1);
    gfx.fillCircle(x + 12, y + 5, 3);

    // Chair
    gfx.fillStyle(0x3d2e4a, 1);
    gfx.fillCircle(x, y + 24, 8);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeCircle(x, y + 24, 8);

    this.add.text(x, y - 22, label, {
      fontFamily: 'monospace',
      fontSize: '7px',
      fontStyle: 'bold',
      color: '#3D2E4A',
    }).setOrigin(0.5);
  }

  private drawWebGroundingStation(x: number, y: number) {
    const gfx = this.add.graphics();

    // Radar station
    gfx.fillStyle(0x3d2e4a, 1);
    gfx.fillCircle(x, y, 22);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeCircle(x, y, 22);

    gfx.fillStyle(0x4ecdc4, 0.85);
    gfx.fillCircle(x, y, 15);

    gfx.lineStyle(1, 0xfffdf5, 0.6);
    gfx.strokeCircle(x, y, 10);
    gfx.strokeCircle(x, y, 5);

    gfx.fillStyle(0xffd93d, 1);
    gfx.fillCircle(x, y, 3);

    this.add.text(x, y + 28, '🌐 LIVE WEB HUB', {
      fontFamily: 'monospace',
      fontSize: '7px',
      fontStyle: 'bold',
      color: '#1A1320',
    }).setOrigin(0.5);
  }

  private drawPaymentCounter(x: number, y: number) {
    const gfx = this.add.graphics();

    // Counter
    gfx.fillStyle(0xfffdf5, 1);
    gfx.fillRoundedRect(x - 30, y - 14, 60, 28, 3);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeRoundedRect(x - 30, y - 14, 60, 28, 3);

    // Register
    gfx.fillStyle(0x1a1320, 1);
    gfx.fillRect(x - 18, y - 11, 18, 14);
    gfx.fillStyle(0x6bcf7f, 1);
    gfx.fillRect(x - 16, y - 9, 14, 7);

    // POS Card Reader
    gfx.fillStyle(0xffd93d, 1);
    gfx.fillRect(x + 5, y - 7, 13, 13);
    gfx.lineStyle(1, 0x1a1320, 1);
    gfx.strokeRect(x + 5, y - 7, 13, 13);

    this.add.text(x, y - 20, '💳 RAZORPAY POS', {
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
    gfx.fillRect(18, 360, 56, 26);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeRect(18, 360, 56, 26);

    // Coffee maker
    gfx.fillStyle(0x3d2e4a, 1);
    gfx.fillRect(23, 350, 16, 15);
    gfx.fillStyle(0xff6b6b, 1);
    gfx.fillRect(26, 357, 10, 6);

    // Water cooler
    gfx.fillStyle(0xfffdf5, 1);
    gfx.fillRect(88, 362, 18, 24);
    gfx.lineStyle(1.5, 0x1a1320, 1);
    gfx.strokeRect(88, 362, 18, 24);
    gfx.fillStyle(0x4ecdc4, 0.85);
    gfx.fillRoundedRect(90, 350, 14, 14, 3);

    // Lounge couch
    gfx.fillStyle(0x4ba85c, 1);
    gfx.fillRoundedRect(125, 370, 52, 22, 4);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeRoundedRect(125, 370, 52, 22, 4);
  }

  private drawServerRacks(x: number, y: number) {
    const gfx = this.add.graphics();

    for (let r = 0; r < 4; r++) {
      const rx = x + r * 36;
      gfx.fillStyle(0x13111c, 1);
      gfx.fillRect(rx, y, 26, 52);
      gfx.lineStyle(2, 0x1a1320, 1);
      gfx.strokeRect(rx, y, 26, 52);

      gfx.fillStyle(0x2a2438, 1);
      for (let s = 0; s < 5; s++) {
        gfx.fillRect(rx + 3, y + 4 + s * 9, 20, 6);
      }

      const lightGfx = this.add.graphics();
      this.serverLights.push(lightGfx);
    }
  }

  private drawPlant(x: number, y: number) {
    const gfx = this.add.graphics();
    gfx.fillStyle(0xba5d39, 1);
    gfx.fillRoundedRect(x, y + 8, 14, 12, 2);
    gfx.lineStyle(1.5, 0x1a1320, 1);
    gfx.strokeRoundedRect(x, y + 8, 14, 12, 2);

    gfx.fillStyle(0x6bcf7f, 1);
    gfx.fillCircle(x + 7, y + 5, 8);
    gfx.fillStyle(0x4ba85c, 1);
    gfx.fillCircle(x + 3, y + 8, 6);
    gfx.fillCircle(x + 11, y + 8, 6);
  }

  // ─── Ambient Animations ────────────────────────────────────────────────────

  private blinkServerLights() {
    const colors = [0x6bcf7f, 0x4ecdc4, 0xffd93d, 0xff6b6b, 0xb197fc];
    this.serverLights.forEach((gfx, idx) => {
      gfx.clear();
      for (let i = 0; i < 5; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        gfx.fillStyle(color, 0.7 + Math.random() * 0.3);
        gfx.fillCircle(365 + idx * 36 + 21, 369 + i * 9, 1.8);
      }
    });
  }

  private animateCoffeeSteam() {
    const steam = this.add.circle(31, 347, 2, 0xffffff, 0.6);
    this.tweens.add({
      targets: steam,
      y: 334,
      alpha: 0,
      scale: 2,
      duration: 1100,
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
    gfx.fillStyle(0x1a1320, 0.25);
    gfx.fillEllipse(0, 18, 20, 7);

    // Legs
    gfx.fillStyle(agent.pantColor, 1);
    gfx.fillRect(-5, 6, 4, 11);
    gfx.fillRect(1, 6, 4, 11);
    gfx.lineStyle(1, 0x1a1320, 1);
    gfx.strokeRect(-5, 6, 4, 11);
    gfx.strokeRect(1, 6, 4, 11);

    // Torso
    gfx.fillStyle(agent.shirtColor, 1);
    gfx.fillRoundedRect(-7, -5, 14, 12, 2);
    gfx.lineStyle(1.5, 0x1a1320, 1);
    gfx.strokeRoundedRect(-7, -5, 14, 12, 2);

    // Head
    gfx.fillStyle(0xffd8b3, 1);
    gfx.fillCircle(0, -11, 8);
    gfx.lineStyle(1.5, 0x1a1320, 1);
    gfx.strokeCircle(0, -11, 8);

    // Hair
    const hairColor = agent.id === 'SALES_AGENT' ? 0x2e1a0c
      : agent.id === 'MERCHANT_AGENT' ? 0x4a2e18
      : agent.id === 'AUTHORITY_AGENT' ? 0x1a1320
      : 0x5a3a1a;
    gfx.fillStyle(hairColor, 1);
    gfx.fillRect(-7, -17, 14, 5);

    // Eyes
    gfx.fillStyle(0x1a1320, 1);
    gfx.fillRect(-3, -12, 2, 2);
    gfx.fillRect(2, -12, 2, 2);

    container.add(gfx);

    // Nameplate badge
    const badge = this.add.graphics();
    badge.fillStyle(0xfffdf5, 0.95);
    badge.fillRoundedRect(-44, 22, 88, 15, 3);
    badge.lineStyle(1.5, 0x1a1320, 1);
    badge.strokeRoundedRect(-44, 22, 88, 15, 3);
    badge.fillStyle(agent.accent, 1);
    badge.fillRect(-40, 25, 5, 8);
    container.add(badge);

    const nameText = this.add.text(0, 30, agent.name, {
      fontFamily: 'monospace',
      fontSize: '7.5px',
      fontStyle: 'bold',
      color: '#1A1320',
    }).setOrigin(0.5);
    container.add(nameText);

    // Status emote
    const emoteContainer = this.add.container(0, -28);
    const emoteBg = this.add.graphics();
    emoteBg.fillStyle(agent.accent, 1);
    emoteBg.fillCircle(0, 0, 8);
    emoteBg.lineStyle(1.5, 0x1a1320, 1);
    emoteBg.strokeCircle(0, 0, 8);
    const emoteText = this.add.text(0, 0, '⚡', { fontSize: '8px' }).setOrigin(0.5);
    emoteContainer.add([emoteBg, emoteText]);
    emoteContainer.setVisible(false);
    container.add(emoteContainer);
    this.statusBadges[agent.id] = emoteContainer;

    // Speech bubble
    const bubbleContainer = this.add.container(0, -50);
    bubbleContainer.setVisible(false);

    const bubbleBg = this.add.graphics();
    bubbleBg.fillStyle(0xfffdf5, 1);
    bubbleBg.fillRoundedRect(-85, -22, 170, 36, 4);
    bubbleBg.lineStyle(2, 0x1a1320, 1);
    bubbleBg.strokeRoundedRect(-85, -22, 170, 36, 4);
    bubbleBg.fillStyle(0xfffdf5, 1);
    bubbleBg.fillTriangle(0, 18, -6, 13, 6, 13);

    const bubbleText = this.add.text(0, -4, '', {
      fontFamily: 'monospace',
      fontSize: '8.5px',
      fontStyle: 'bold',
      color: '#1A1320',
      wordWrap: { width: 155 },
      align: 'center',
    }).setOrigin(0.5);

    bubbleContainer.add([bubbleBg, bubbleText]);
    container.add(bubbleContainer);
    this.speechBubbles[agent.id] = bubbleContainer;

    // Breathing tween
    this.tweens.add({
      targets: container,
      y: agent.homeY - 2,
      duration: 1200 + Math.random() * 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Hover tooltip
    container.setSize(44, 55);
    container.setInteractive({ useHandCursor: true });
    container.on('pointerover', () => {
      if (this.tooltipText) {
        this.tooltipText.setText(`${agent.name}\n${agent.role}`);
        this.tooltipText.setPosition(container.x, container.y - 58);
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

  // ─── Event Handlers ────────────────────────────────────────────────────────

  public handleAgentSpeech(data: { agent: string; text: string }) {
    const msg = data.text.toLowerCase();

    if (msg.includes('search') || msg.includes('phone') || msg.includes('laptop') || msg.includes('find')) {
      this.moveAgentToStation('SALES_AGENT', 'WEB_RESEARCH_HUB');
    } else if (msg.includes('cart') || msg.includes('discount') || msg.includes('stock')) {
      this.moveAgentToStation('MERCHANT_AGENT', 'MERCHANT_DESK');
      this.moveAgentToStation('SALES_AGENT', 'MERCHANT_DESK');
    } else if (msg.includes('pay') || msg.includes('order') || msg.includes('buy')) {
      this.moveAgentToStation('CUSTOMER', 'PAYMENT_COUNTER');
      this.moveAgentToStation('AUTHORITY_AGENT', 'PAYMENT_COUNTER');
    } else if (msg.includes('policy') || msg.includes('budget') || msg.includes('limit')) {
      this.moveAgentToStation('AUTHORITY_AGENT', 'AUTHORITY_DESK');
    }

    const bubble = this.speechBubbles[data.agent];
    if (bubble) {
      const textObj = bubble.getAt(1) as Phaser.GameObjects.Text;
      if (textObj) {
        textObj.setText(data.text.slice(0, 50) + (data.text.length > 50 ? '…' : ''));
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

    gfx.fillStyle(0xfffdf5, 1);
    gfx.fillRect(-8, -5, 16, 10);
    gfx.lineStyle(1.5, 0x1a1320, 1);
    gfx.strokeRect(-8, -5, 16, 10);
    gfx.fillStyle(0xff6b6b, 1);
    gfx.fillTriangle(0, 2, -6, -4, 6, -4);
    envelope.add(gfx);

    this.tweens.add({
      targets: envelope,
      x: recipient.x,
      y: recipient.y - 18,
      duration: 700,
      ease: 'Quad.easeInOut',
      onComplete: () => {
        const flash = this.add.circle(recipient.x, recipient.y - 10, 10, 0xffd93d, 0.6);
        flash.setDepth(150);
        this.tweens.add({
          targets: flash,
          alpha: 0,
          scale: 2.2,
          duration: 350,
          onComplete: () => flash.destroy(),
        });
        envelope.destroy();
      },
    });
  }
}
