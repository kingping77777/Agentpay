import Phaser from 'phaser';

export interface AgentState {
  id: string;
  name: string;
  role: string;
  accent: number;
  shirtColor: number;
  pantColor: number;
  homeXRatio: number;
  homeYRatio: number;
  currentStation: string;
}

/**
 * OfficeScene — Fully Responsive, Full-Frame 2D Pixel Office for AgentPay.
 * Dynamically recalculates all room zones, furniture coordinates, and character positions
 * based on actual canvas dimensions (fills 100% of any viewport without letterboxing).
 */
export class OfficeScene extends Phaser.Scene {
  private characters: { [key: string]: Phaser.GameObjects.Container } = {};
  private speechBubbles: { [key: string]: Phaser.GameObjects.Container } = {};
  private statusBadges: { [key: string]: Phaser.GameObjects.Container } = {};
  private serverLights: Phaser.GameObjects.Graphics[] = [];
  private tooltipText: Phaser.GameObjects.Text | null = null;
  private mainGraphics: Phaser.GameObjects.Graphics | null = null;
  private roomLabels: Phaser.GameObjects.Container[] = [];
  private furnitureObjects: Phaser.GameObjects.GameObject[] = [];

  private agentsData: AgentState[] = [
    {
      id: 'SALES_AGENT',
      name: 'Michael (Sales)',
      role: 'Sales Discovery',
      accent: 0x4ecdc4,
      shirtColor: 0x4ecdc4,
      pantColor: 0x1a1320,
      homeXRatio: 0.23,
      homeYRatio: 0.22,
      currentStation: 'MICHAEL_DESK',
    },
    {
      id: 'MERCHANT_AGENT',
      name: 'TechStore Agent',
      role: 'Merchant Inventory',
      accent: 0xffa07a,
      shirtColor: 0xffa07a,
      pantColor: 0x3d2e4a,
      homeXRatio: 0.75,
      homeYRatio: 0.22,
      currentStation: 'MERCHANT_DESK',
    },
    {
      id: 'AUTHORITY_AGENT',
      name: 'Authority Gatekeeper',
      role: 'Policy & Budget',
      accent: 0xb197fc,
      shirtColor: 0xb197fc,
      pantColor: 0x1a1320,
      homeXRatio: 0.23,
      homeYRatio: 0.54,
      currentStation: 'AUTHORITY_DESK',
    },
    {
      id: 'CUSTOMER',
      name: 'Customer',
      role: 'Shopper',
      accent: 0x6bcf7f,
      shirtColor: 0x6bcf7f,
      pantColor: 0x2e384d,
      homeXRatio: 0.50,
      homeYRatio: 0.65,
      currentStation: 'PAYMENT_COUNTER',
    },
  ];

  constructor() {
    super({ key: 'OfficeScene' });
  }

  create() {
    this.renderFullOffice();

    // Ambient loop events
    this.time.addEvent({ delay: 300, callback: this.blinkServerLights, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 600, callback: this.animateCoffeeSteam, callbackScope: this, loop: true });

    // Handle dynamic viewport resize
    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height);
      this.renderFullOffice();
    });

    // React event listeners
    this.game.events.on('agent-speak', this.handleAgentSpeech, this);
    this.game.events.on('agent-action', this.handleAgentAction, this);
    this.game.events.on('agent-message-flying', this.handleFlyingEnvelope, this);
  }

  private renderFullOffice() {
    const W = this.scale.width || 600;
    const H = this.scale.height || 500;

    // Clean up previous elements on re-render
    if (this.mainGraphics) this.mainGraphics.destroy();
    this.roomLabels.forEach((c) => c.destroy());
    this.roomLabels = [];
    this.furnitureObjects.forEach((o) => o.destroy());
    this.furnitureObjects = [];
    this.serverLights.forEach((g) => g.destroy());
    this.serverLights = [];

    this.mainGraphics = this.add.graphics();
    const gfx = this.mainGraphics;

    const midX = Math.round(W * 0.49);
    const midY = Math.round(H * 0.68);
    const topH = Math.round(H * 0.38);

    // ── 1. Base Floor Background ──
    gfx.fillStyle(0xe5c896, 1);
    gfx.fillRect(0, 0, W, H);

    // Michael's Office (Top-Left): Wood + Luxury Persian Rug
    gfx.fillStyle(0xd9b982, 1);
    gfx.fillRect(6, 6, midX - 10, topH - 6);
    const rugW = Math.max(140, midX - 70);
    const rugH = Math.max(90, topH - 50);
    gfx.fillStyle(0x7a1f2d, 1);
    gfx.fillRoundedRect(30, 25, rugW, rugH, 6);
    gfx.lineStyle(2, 0xd4a017, 0.8);
    gfx.strokeRoundedRect(30, 25, rugW, rugH, 6);
    gfx.lineStyle(1, 0xf4d35e, 0.4);
    gfx.strokeRoundedRect(36, 31, rugW - 12, rugH - 12, 4);

    // TechStore Hub (Top-Right): Polished Walnut
    gfx.fillStyle(0xc9a66b, 1);
    gfx.fillRect(midX + 4, 6, W - midX - 12, topH - 6);
    gfx.lineStyle(1, 0xb89255, 0.4);
    for (let py = 20; py < topH; py += 22) {
      gfx.lineBetween(midX + 4, py, W - 6, py);
    }

    // Mid Hallway / Authority Area: Warm Carpet
    gfx.fillStyle(0xe8d8b0, 1);
    gfx.fillRect(6, topH, W - 12, midY - topH);

    // Breakroom (Bottom-Left): Checkered Tiles
    const tileSize = 22;
    for (let x = 6; x < midX - 4; x += tileSize) {
      for (let y = midY; y < H - 6; y += tileSize) {
        const isWhite = ((Math.floor((x - 6) / tileSize) + Math.floor((y - midY) / tileSize)) % 2) === 0;
        gfx.fillStyle(isWhite ? 0xfffdf5 : 0xd9cfe0, 1);
        gfx.fillRect(x, y, Math.min(tileSize, midX - 4 - x), Math.min(tileSize, H - 6 - y));
      }
    }

    // Server Room (Bottom-Right): High-tech Cyber Grid
    gfx.fillStyle(0x16131e, 1);
    gfx.fillRect(midX + 4, midY, W - midX - 10, H - midY - 6);
    gfx.lineStyle(1, 0x2a2438, 0.8);
    for (let x = midX + 4; x < W - 6; x += 22) {
      gfx.lineBetween(x, midY, x, H - 6);
    }
    for (let y = midY; y < H - 6; y += 22) {
      gfx.lineBetween(midX + 4, y, W - 6, y);
    }

    // ── 2. Walls & Doorway Openings ──
    gfx.lineStyle(4, 0x1a1320, 1);
    gfx.strokeRect(4, 4, W - 8, H - 8);

    // Top horizontal divider
    gfx.fillStyle(0x8b6f47, 1);
    gfx.fillRect(6, topH - 4, midX - 55, 8);
    gfx.fillRect(midX + 25, topH - 4, W - midX - 31, 8);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeRect(6, topH - 4, midX - 55, 8);
    gfx.strokeRect(midX + 25, topH - 4, W - midX - 31, 8);

    // Bottom horizontal divider
    gfx.fillStyle(0x8b6f47, 1);
    gfx.fillRect(6, midY - 4, midX - 55, 8);
    gfx.fillRect(midX + 25, midY - 4, W - midX - 31, 8);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeRect(6, midY - 4, midX - 55, 8);
    gfx.strokeRect(midX + 25, midY - 4, W - midX - 31, 8);

    // Vertical top divider
    gfx.fillStyle(0x8b6f47, 1);
    gfx.fillRect(midX - 4, 6, 8, topH - 10);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeRect(midX - 4, 6, 8, topH - 10);

    // Vertical bottom divider
    gfx.fillStyle(0x8b6f47, 1);
    gfx.fillRect(midX - 4, midY + 4, 8, H - midY - 10);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeRect(midX - 4, midY + 4, 8, H - midY - 10);

    // ── 3. Room Badges ──
    this.createRoomBadge(16, 12, "👑 MICHAEL'S OFFICE", 0x4ecdc4);
    this.createRoomBadge(midX + 16, 12, '🏪 TECHSTORE HUB', 0xffa07a);
    this.createRoomBadge(16, topH + 10, '🛡️ AUTHORITY DESK', 0xb197fc);
    this.createRoomBadge(midX + 16, topH + 10, '💳 PAYMENT DESK', 0xffd93d);
    this.createRoomBadge(16, midY + 8, '☕ BREAKROOM', 0x6bcf7f);
    this.createRoomBadge(midX + 16, midY + 8, '⚡ SERVER ROOM', 0xff6b6b);

    // ── 4. Furniture ──
    const michaelX = Math.round(W * 0.23);
    const michaelY = Math.round(topH * 0.52);
    this.drawExecutiveDesk(michaelX, michaelY);

    const merchantX = Math.round(midX + (W - midX) * 0.48);
    const merchantY = Math.round(topH * 0.52);
    this.drawWorkstationDesk(merchantX, merchantY, 0xffa07a, 'INVENTORY HUB');

    const webX = midX;
    const webY = Math.round(topH + (midY - topH) * 0.48);
    this.drawWebGroundingStation(webX, webY);

    const authorityX = Math.round(W * 0.23);
    const authorityY = Math.round(topH + (midY - topH) * 0.48);
    this.drawWorkstationDesk(authorityX, authorityY, 0xb197fc, 'POLICY ENGINE');

    const paymentX = Math.round(midX + (W - midX) * 0.48);
    const paymentY = Math.round(topH + (midY - topH) * 0.48);
    this.drawPaymentCounter(paymentX, paymentY);

    this.drawBreakroomFurniture(16, midY + 25);
    this.drawServerRacks(midX + 20, midY + 25, W - midX - 35);

    // ── 5. Position / Reposition Characters ──
    this.createOrUpdateAvatars(W, H, topH, midH_calc(topH, midY), midX);

    // Tooltip
    if (!this.tooltipText) {
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
    }
  }

  private createRoomBadge(x: number, y: number, text: string, accent: number) {
    const container = this.add.container(x, y);
    container.setDepth(50);

    const badge = this.add.graphics();
    badge.fillStyle(0xfffdf5, 0.95);
    badge.fillRoundedRect(0, 0, 135, 18, 3);
    badge.lineStyle(1.5, 0x1a1320, 1);
    badge.strokeRoundedRect(0, 0, 135, 18, 3);

    badge.fillStyle(accent, 1);
    badge.fillRect(3, 3, 4, 12);
    container.add(badge);

    const t = this.add.text(12, 9, text, {
      fontFamily: 'monospace',
      fontSize: '8px',
      fontStyle: 'bold',
      color: '#1A1320',
    }).setOrigin(0, 0.5);
    container.add(t);

    this.roomLabels.push(container);
  }

  private drawExecutiveDesk(x: number, y: number) {
    const gfx = this.add.graphics();
    this.furnitureObjects.push(gfx);

    gfx.fillStyle(0x6e1423, 1);
    gfx.fillRoundedRect(x - 38, y - 18, 76, 36, 4);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeRoundedRect(x - 38, y - 18, 76, 36, 4);

    gfx.fillStyle(0x1a1320, 1);
    gfx.fillRect(x - 26, y - 14, 24, 14);
    gfx.fillRect(x + 2, y - 14, 24, 14);
    gfx.fillStyle(0x4ecdc4, 0.9);
    gfx.fillRect(x - 24, y - 12, 20, 10);
    gfx.fillStyle(0x6bcf7f, 0.9);
    gfx.fillRect(x + 4, y - 12, 20, 10);

    gfx.fillStyle(0xfffdf5, 1);
    gfx.fillRect(x - 14, y + 4, 20, 6);
    gfx.fillStyle(0xd9cfe0, 1);
    gfx.fillRect(x + 14, y + 5, 6, 4);

    gfx.fillStyle(0x8b2635, 1);
    gfx.fillCircle(x, y + 30, 11);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeCircle(x, y + 30, 11);
  }

  private drawWorkstationDesk(x: number, y: number, screenColor: number, label: string) {
    const gfx = this.add.graphics();
    this.furnitureObjects.push(gfx);

    gfx.fillStyle(0xd49b4b, 1);
    gfx.fillRoundedRect(x - 30, y - 16, 60, 32, 3);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeRoundedRect(x - 30, y - 16, 60, 32, 3);

    gfx.fillStyle(0x2a2438, 1);
    gfx.fillRect(x - 16, y - 14, 32, 16);
    gfx.fillStyle(screenColor, 0.9);
    gfx.fillRect(x - 14, y - 12, 28, 12);

    gfx.fillStyle(0xfffdf5, 0.4);
    for (let i = 0; i < 3; i++) {
      gfx.fillRect(x - 12, y - 10 + i * 3, 14 + i * 3, 1);
    }

    gfx.fillStyle(0xfffdf5, 1);
    gfx.fillRect(x - 12, y + 4, 18, 5);
    gfx.fillStyle(0xff6b6b, 1);
    gfx.fillCircle(x + 14, y + 6, 3);

    gfx.fillStyle(0x3d2e4a, 1);
    gfx.fillCircle(x, y + 26, 9);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeCircle(x, y + 26, 9);

    const labelTxt = this.add.text(x, y - 24, label, {
      fontFamily: 'monospace',
      fontSize: '7px',
      fontStyle: 'bold',
      color: '#3D2E4A',
    }).setOrigin(0.5);
    this.furnitureObjects.push(labelTxt);
  }

  private drawWebGroundingStation(x: number, y: number) {
    const gfx = this.add.graphics();
    this.furnitureObjects.push(gfx);

    gfx.fillStyle(0x3d2e4a, 1);
    gfx.fillCircle(x, y, 24);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeCircle(x, y, 24);

    gfx.fillStyle(0x4ecdc4, 0.85);
    gfx.fillCircle(x, y, 16);

    gfx.lineStyle(1, 0xfffdf5, 0.6);
    gfx.strokeCircle(x, y, 11);
    gfx.strokeCircle(x, y, 6);

    gfx.fillStyle(0xffd93d, 1);
    gfx.fillCircle(x, y, 3.5);

    const txt = this.add.text(x, y + 30, '🌐 LIVE WEB HUB', {
      fontFamily: 'monospace',
      fontSize: '7.5px',
      fontStyle: 'bold',
      color: '#1A1320',
    }).setOrigin(0.5);
    this.furnitureObjects.push(txt);
  }

  private drawPaymentCounter(x: number, y: number) {
    const gfx = this.add.graphics();
    this.furnitureObjects.push(gfx);

    gfx.fillStyle(0xfffdf5, 1);
    gfx.fillRoundedRect(x - 34, y - 15, 68, 30, 3);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeRoundedRect(x - 34, y - 15, 68, 30, 3);

    gfx.fillStyle(0x1a1320, 1);
    gfx.fillRect(x - 20, y - 12, 20, 15);
    gfx.fillStyle(0x6bcf7f, 1);
    gfx.fillRect(x - 18, y - 10, 16, 8);

    gfx.fillStyle(0xffd93d, 1);
    gfx.fillRect(x + 6, y - 8, 14, 14);
    gfx.lineStyle(1, 0x1a1320, 1);
    gfx.strokeRect(x + 6, y - 8, 14, 14);

    const txt = this.add.text(x, y - 22, '💳 RAZORPAY POS', {
      fontFamily: 'monospace',
      fontSize: '7.5px',
      fontStyle: 'bold',
      color: '#1A1320',
    }).setOrigin(0.5);
    this.furnitureObjects.push(txt);
  }

  private drawBreakroomFurniture(startX: number, startY: number) {
    const gfx = this.add.graphics();
    this.furnitureObjects.push(gfx);

    // Coffee machine table
    gfx.fillStyle(0xfff8e7, 1);
    gfx.fillRect(startX, startY, 60, 28);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeRect(startX, startY, 60, 28);

    gfx.fillStyle(0x3d2e4a, 1);
    gfx.fillRect(startX + 6, startY - 10, 18, 16);
    gfx.fillStyle(0xff6b6b, 1);
    gfx.fillRect(startX + 9, startY - 3, 12, 7);

    // Water cooler
    gfx.fillStyle(0xfffdf5, 1);
    gfx.fillRect(startX + 75, startY, 20, 26);
    gfx.lineStyle(1.5, 0x1a1320, 1);
    gfx.strokeRect(startX + 75, startY, 20, 26);
    gfx.fillStyle(0x4ecdc4, 0.85);
    gfx.fillRoundedRect(startX + 77, startY - 12, 16, 16, 4);

    // Lounge sofa
    gfx.fillStyle(0x4ba85c, 1);
    gfx.fillRoundedRect(startX + 110, startY + 5, 58, 24, 4);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeRoundedRect(startX + 110, startY + 5, 58, 24, 4);
  }

  private drawServerRacks(startX: number, startY: number, maxW: number) {
    const gfx = this.add.graphics();
    this.furnitureObjects.push(gfx);

    const rackCount = Math.max(3, Math.min(5, Math.floor(maxW / 42)));
    for (let r = 0; r < rackCount; r++) {
      const rx = startX + r * 40;
      gfx.fillStyle(0x13111c, 1);
      gfx.fillRect(rx, startY, 30, 56);
      gfx.lineStyle(2, 0x1a1320, 1);
      gfx.strokeRect(rx, startY, 30, 56);

      gfx.fillStyle(0x2a2438, 1);
      for (let s = 0; s < 5; s++) {
        gfx.fillRect(rx + 3, startY + 4 + s * 10, 24, 7);
      }

      const lightGfx = this.add.graphics();
      this.serverLights.push(lightGfx);
    }
  }

  // ─── Character Avatars Management ───

  private createOrUpdateAvatars(W: number, H: number, topH: number, midH: number, midX: number) {
    const positions: { [key: string]: { x: number; y: number } } = {
      SALES_AGENT:      { x: Math.round(W * 0.23), y: Math.round(topH * 0.52) },
      MERCHANT_AGENT:   { x: Math.round(midX + (W - midX) * 0.48), y: Math.round(topH * 0.52) },
      AUTHORITY_AGENT:  { x: Math.round(W * 0.23), y: Math.round(topH + (midH) * 0.48) },
      CUSTOMER:         { x: Math.round(midX + (W - midX) * 0.48), y: Math.round(topH + (midH) * 0.48) },
    };

    this.agentsData.forEach((agent) => {
      const pos = positions[agent.id] || { x: Math.round(W * agent.homeXRatio), y: Math.round(H * agent.homeYRatio) };

      if (this.characters[agent.id]) {
        this.characters[agent.id].setPosition(pos.x, pos.y);
      } else {
        const avatar = this.createAvatar(agent, pos.x, pos.y);
        this.characters[agent.id] = avatar;
      }
    });
  }

  private createAvatar(agent: AgentState, x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
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
      y: y - 2,
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

  // ─── Ambient Animations ───

  private blinkServerLights() {
    const colors = [0x6bcf7f, 0x4ecdc4, 0xffd93d, 0xff6b6b, 0xb197fc];
    this.serverLights.forEach((gfx, idx) => {
      gfx.clear();
      for (let i = 0; i < 5; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        gfx.fillStyle(color, 0.7 + Math.random() * 0.3);
        const midX = Math.round(this.scale.width * 0.49);
        const midY = Math.round(this.scale.height * 0.68);
        gfx.fillCircle(midX + 20 + idx * 40 + 23, midY + 29 + i * 10, 2);
      }
    });
  }

  private animateCoffeeSteam() {
    const midY = Math.round(this.scale.height * 0.68);
    const steam = this.add.circle(32, midY + 20, 2, 0xffffff, 0.6);
    this.tweens.add({
      targets: steam,
      y: midY + 8,
      alpha: 0,
      scale: 2,
      duration: 1100,
      ease: 'Sine.easeOut',
      onComplete: () => steam.destroy(),
    });
  }

  // ─── Event Handlers ───

  public handleAgentSpeech(data: { agent: string; text: string }) {
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

function midH_calc(topH: number, midY: number) {
  return midY - topH;
}
