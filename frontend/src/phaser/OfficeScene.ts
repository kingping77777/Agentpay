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

export class OfficeScene extends Phaser.Scene {
  private characters: { [key: string]: Phaser.GameObjects.Container } = {};
  private speechBubbles: { [key: string]: Phaser.GameObjects.Container } = {};
  private statusBadges: { [key: string]: Phaser.GameObjects.Container } = {};
  private serverLights: Phaser.GameObjects.Graphics[] = [];
  private coffeeSteamParticles: Phaser.GameObjects.Arc[] = [];

  // Station Coordinates
  private stations: { [key: string]: { x: number; y: number; name: string } } = {
    'MICHAEL_DESK': { x: 130, y: 110, name: "Michael's Office" },
    'MERCHANT_DESK': { x: 370, y: 110, name: "Merchant Desk" },
    'AUTHORITY_DESK': { x: 130, y: 260, name: "Authority Desk" },
    'PAYMENT_COUNTER': { x: 370, y: 260, name: "Payment POS Counter" },
    'WEB_RESEARCH_HUB': { x: 250, y: 185, name: "Web Grounding Hub" },
    'SERVER_ROOM': { x: 420, y: 390, name: "Server Room" },
    'BREAKROOM': { x: 90, y: 400, name: "Breakroom Lounge" },
  };

  private agentsData: AgentState[] = [
    {
      id: 'SALES_AGENT',
      name: 'Michael (Sales)',
      role: 'Sales Discovery',
      accent: 0x4ecdc4, // Sky
      shirtColor: 0x4ecdc4,
      pantColor: 0x1a1320,
      homeX: 130,
      homeY: 110,
      currentStation: 'MICHAEL_DESK',
    },
    {
      id: 'MERCHANT_AGENT',
      name: 'TechStore Agent',
      role: 'Merchant Stock & Discounts',
      accent: 0xffa07a, // Peach
      shirtColor: 0xffa07a,
      pantColor: 0x3d2e4a,
      homeX: 370,
      homeY: 110,
      currentStation: 'MERCHANT_DESK',
    },
    {
      id: 'AUTHORITY_AGENT',
      name: 'Authority Gatekeeper',
      role: 'Policy & Hard Budget',
      accent: 0xb197fc, // Lilac
      shirtColor: 0xb197fc,
      pantColor: 0x1a1320,
      homeX: 130,
      homeY: 260,
      currentStation: 'AUTHORITY_DESK',
    },
    {
      id: 'CUSTOMER',
      name: 'Customer',
      role: 'Shopper',
      accent: 0x6bcf7f, // Mint
      shirtColor: 0x6bcf7f,
      pantColor: 0x2e384d,
      homeX: 250,
      homeY: 310,
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
    const width = this.cameras.main.width || 540;
    const height = this.cameras.main.height || 480;

    // 1. Draw Themed Floor Zones
    this.drawFloorZones(width, height);

    // 2. Draw Office Walls & Room Dividers
    this.drawWallsAndDoors(width, height);

    // 3. Draw Rich Isometric/Top-Down Furniture & Stations
    this.drawStationsAndFurniture();

    // 4. Create Animated Character Avatars
    this.createCharacterAvatars();

    // 5. Setup Animated Ambient Effects (Server LEDs, Coffee Steam)
    this.time.addEvent({
      delay: 250,
      callback: this.blinkServerLights,
      callbackScope: this,
      loop: true,
    });

    this.time.addEvent({
      delay: 400,
      callback: this.animateCoffeeSteam,
      callbackScope: this,
      loop: true,
    });

    // Listen for agent actions and speech events from React
    this.game.events.on('agent-speak', this.handleAgentSpeech, this);
    this.game.events.on('agent-action', this.handleAgentAction, this);
    this.game.events.on('agent-message-flying', this.handleFlyingEnvelope, this);
  }

  private createProceduralTextures() {
    // 1. Wood Tile Light (#E5C896)
    const tLight = this.make.graphics({ x: 0, y: 0 });
    tLight.fillStyle(0xe5c896, 1);
    tLight.fillRect(0, 0, 32, 32);
    tLight.lineStyle(1, 0xd4b57e, 0.6);
    tLight.strokeRect(0, 0, 32, 32);
    tLight.fillStyle(0xd9b982, 0.4);
    tLight.fillRect(3, 8, 26, 2);
    tLight.fillRect(6, 20, 20, 2);
    tLight.generateTexture('tile_wood_light', 32, 32);

    // 2. Wood Tile Dark (#C9A66B)
    const tDark = this.make.graphics({ x: 0, y: 0 });
    tDark.fillStyle(0xc9a66b, 1);
    tDark.fillRect(0, 0, 32, 32);
    tDark.lineStyle(1, 0xb89255, 0.6);
    tDark.strokeRect(0, 0, 32, 32);
    tDark.fillStyle(0xba9457, 0.4);
    tDark.fillRect(4, 14, 24, 2);
    tDark.fillRect(2, 26, 28, 2);
    tDark.generateTexture('tile_wood_dark', 32, 32);

    // 3. Hallway Carpet (#E8D8B0)
    const tCarpet = this.make.graphics({ x: 0, y: 0 });
    tCarpet.fillStyle(0xe8d8b0, 1);
    tCarpet.fillRect(0, 0, 32, 32);
    tCarpet.lineStyle(1, 0xd8c599, 0.4);
    tCarpet.strokeRect(0, 0, 32, 32);
    tCarpet.fillStyle(0xd5c49a, 0.3);
    tCarpet.fillRect(14, 14, 4, 4);
    tCarpet.generateTexture('tile_carpet', 32, 32);

    // 4. Breakroom Checker Tile (#D9CFE0 / #FFFDF5)
    const tBreak = this.make.graphics({ x: 0, y: 0 });
    tBreak.fillStyle(0xd9cfe0, 1);
    tBreak.fillRect(0, 0, 32, 32);
    tBreak.fillStyle(0xfffdf5, 1);
    tBreak.fillRect(0, 0, 16, 16);
    tBreak.fillRect(16, 16, 16, 16);
    tBreak.lineStyle(1, 0xa899b5, 0.5);
    tBreak.strokeRect(0, 0, 32, 32);
    tBreak.generateTexture('tile_breakroom', 32, 32);

    // 5. Executive Rug Pattern (#8B2635)
    const tRug = this.make.graphics({ x: 0, y: 0 });
    tRug.fillStyle(0x7a1f2d, 1);
    tRug.fillRect(0, 0, 32, 32);
    tRug.lineStyle(1, 0x9e2a3b, 0.6);
    tRug.strokeRect(0, 0, 32, 32);
    tRug.fillStyle(0xf4d35e, 0.4); // Gold trim dots
    tRug.fillRect(4, 4, 2, 2);
    tRug.fillRect(26, 4, 2, 2);
    tRug.fillRect(4, 26, 2, 2);
    tRug.fillRect(26, 26, 2, 2);
    tRug.generateTexture('tile_rug', 32, 32);
  }

  private drawFloorZones(w: number, h: number) {
    for (let x = 0; x < w; x += 32) {
      for (let y = 0; y < h; y += 32) {
        // Zone 1: Michael's Executive Corner (Top Left)
        if (x < 210 && y < 180) {
          if (x >= 40 && x <= 180 && y >= 40 && y <= 150) {
            this.add.image(x, y, 'tile_rug').setOrigin(0, 0);
          } else {
            this.add.image(x, y, 'tile_wood_light').setOrigin(0, 0);
          }
        }
        // Zone 2: Breakroom (Bottom Left)
        else if (x < 210 && y >= 340) {
          this.add.image(x, y, 'tile_breakroom').setOrigin(0, 0);
        }
        // Zone 3: Server Room (Bottom Right)
        else if (x >= 320 && y >= 340) {
          const isAlt = ((x / 32) + (y / 32)) % 2 === 0;
          this.add.image(x, y, isAlt ? 'tile_wood_dark' : 'tile_wood_light').setOrigin(0, 0);
        }
        // Zone 4: Central Hallway & Open Office
        else if (x >= 200 && x <= 290) {
          this.add.image(x, y, 'tile_carpet').setOrigin(0, 0);
        } else {
          const isAlt = ((x / 32) + (y / 32)) % 2 === 0;
          this.add.image(x, y, isAlt ? 'tile_wood_light' : 'tile_wood_dark').setOrigin(0, 0);
        }
      }
    }
  }

  private drawWallsAndDoors(w: number, h: number) {
    const gfx = this.add.graphics();

    // Outer Room Border Wall
    gfx.lineStyle(3, 0x1a1320, 1);
    gfx.strokeRect(8, 8, w - 16, h - 16);

    // 1. Michael's Office Partition Walls (Top Left)
    gfx.fillStyle(0x8b6f47, 1);
    gfx.fillRect(8, 175, 140, 10);
    gfx.fillRect(205, 8, 10, 177);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeRect(8, 175, 140, 10);
    gfx.strokeRect(205, 8, 10, 177);

    // Doorway opening for Michael's Office
    gfx.fillStyle(0xe8d8b0, 1);
    gfx.fillRect(148, 175, 57, 10);

    // 2. Breakroom Partition (Bottom Left)
    gfx.fillStyle(0x8b6f47, 1);
    gfx.fillRect(8, 335, 150, 10);
    gfx.fillRect(205, 335, 10, h - 343);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeRect(8, 335, 150, 10);
    gfx.strokeRect(205, 335, 10, h - 343);

    // Doorway for Breakroom
    gfx.fillStyle(0xe8d8b0, 1);
    gfx.fillRect(158, 335, 47, 10);

    // 3. Server Room Partition (Bottom Right)
    gfx.fillStyle(0x2a2438, 1);
    gfx.fillRect(320, 335, w - 328, 10);
    gfx.fillRect(320, 335, 10, h - 343);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeRect(320, 335, w - 328, 10);
    gfx.strokeRect(320, 335, 10, h - 343);

    // Doorway for Server Room
    gfx.fillStyle(0xe8d8b0, 1);
    gfx.fillRect(330, 335, 45, 10);

    // Room Label Badges
    this.drawRoomBadge(22, 18, "👑 MICHAEL'S OFFICE", 0x4ecdc4);
    this.drawRoomBadge(325, 18, "🏪 TECHSTORE HUB", 0xffa07a);
    this.drawRoomBadge(22, 345, "☕ BREAKROOM", 0xffd93d);
    this.drawRoomBadge(385, 345, "⚡ SERVER RACK", 0x6bcf7f);
  }

  private drawRoomBadge(x: number, y: number, text: string, accent: number) {
    const badge = this.add.graphics();
    badge.fillStyle(0xfffdf5, 1);
    badge.fillRoundedRect(x, y, 120, 18, 2);
    badge.lineStyle(1.5, 0x1a1320, 1);
    badge.strokeRoundedRect(x, y, 120, 18, 2);

    // Accent strip
    badge.fillStyle(accent, 1);
    badge.fillRect(x + 2, y + 2, 4, 14);

    this.add.text(x + 10, y + 9, text, {
      fontFamily: 'monospace',
      fontSize: '8px',
      fontStyle: 'bold',
      color: '#1A1320',
    }).setOrigin(0, 0.5);
  }

  private drawStationsAndFurniture() {
    // 1. Michael's Executive Station (130, 110)
    this.drawExecutiveDesk(130, 95);

    // 2. TechStore Merchant Desk (370, 110)
    this.drawWorkstationDesk(370, 95, 0xffa07a, 'INVENTORY & CATALOG');

    // 3. Central Web Grounding / Library Hub (250, 185)
    this.drawWebGroundingStation(250, 185);

    // 4. Authority & Policy Verification Desk (130, 260)
    this.drawWorkstationDesk(130, 245, 0xb197fc, 'SAFETY & BUDGET');

    // 5. Payment Checkout Counter (370, 260)
    this.drawPaymentCounter(370, 245);

    // 6. Breakroom Furniture (Coffee Maker, Water Cooler, Couch)
    this.drawBreakroomFurniture();

    // 7. Server Room Racks (420, 390)
    this.drawServerRacks(380, 375);

    // Potted Plants
    this.drawBonsaiPlant(190, 30);
    this.drawBonsaiPlant(490, 30);
    this.drawBonsaiPlant(305, 260);
    this.drawBonsaiPlant(190, 280);
  }

  private drawExecutiveDesk(x: number, y: number) {
    const gfx = this.add.graphics();

    // Mahogany Desk
    gfx.fillStyle(0x6e1423, 1);
    gfx.fillRoundedRect(x - 30, y - 16, 60, 32, 4);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeRoundedRect(x - 30, y - 16, 60, 32, 4);

    // Dual Monitors
    gfx.fillStyle(0x1a1320, 1);
    gfx.fillRect(x - 22, y - 12, 20, 12);
    gfx.fillRect(x + 2, y - 12, 20, 12);

    // Screen Glows
    gfx.fillStyle(0x4ecdc4, 0.9);
    gfx.fillRect(x - 20, y - 10, 16, 8);
    gfx.fillStyle(0x6bcf7f, 0.9);
    gfx.fillRect(x + 4, y - 10, 16, 8);

    // Gold Executive Nameplate
    gfx.fillStyle(0xffd93d, 1);
    gfx.fillRect(x - 10, y + 4, 20, 5);
    gfx.lineStyle(1, 0x1a1320, 1);
    gfx.strokeRect(x - 10, y + 4, 20, 5);

    // Executive Chair
    gfx.fillStyle(0x8b2635, 1);
    gfx.fillCircle(x, y + 24, 10);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeCircle(x, y + 24, 10);
  }

  private drawWorkstationDesk(x: number, y: number, screenColor: number, label: string) {
    const gfx = this.add.graphics();

    // Desk
    gfx.fillStyle(0xd49b4b, 1);
    gfx.fillRoundedRect(x - 26, y - 15, 52, 30, 3);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeRoundedRect(x - 26, y - 15, 52, 30, 3);

    // CRT Monitor
    gfx.fillStyle(0x2a2438, 1);
    gfx.fillRect(x - 12, y - 12, 24, 14);
    gfx.lineStyle(1.5, 0x1a1320, 1);
    gfx.strokeRect(x - 12, y - 12, 24, 14);

    // Glowing Screen
    gfx.fillStyle(screenColor, 0.9);
    gfx.fillRect(x - 10, y - 10, 20, 10);

    // Keyboard & Mouse
    gfx.fillStyle(0xfffdf5, 1);
    gfx.fillRect(x - 10, y + 4, 14, 5);
    gfx.fillStyle(0xff6b6b, 1);
    gfx.fillCircle(x + 12, y + 6, 2.5); // Coffee Mug

    // Swivel Chair
    gfx.fillStyle(0x3d2e4a, 1);
    gfx.fillCircle(x, y + 22, 9);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeCircle(x, y + 22, 9);

    // Label tag
    this.add.text(x, y - 22, label, {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#3D2E4A',
      fontStyle: 'bold',
    }).setOrigin(0.5);
  }

  private drawWebGroundingStation(x: number, y: number) {
    const gfx = this.add.graphics();

    // Round Holographic / Library Table
    gfx.fillStyle(0x3d2e4a, 1);
    gfx.fillCircle(x, y, 22);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeCircle(x, y, 22);

    // Globe / Radar Screen
    gfx.fillStyle(0x4ecdc4, 0.85);
    gfx.fillCircle(x, y, 14);
    gfx.lineStyle(1.5, 0xfffdf5, 0.8);
    gfx.strokeCircle(x, y, 10);

    // Pulsing Antenna Center
    gfx.fillStyle(0xffd93d, 1);
    gfx.fillCircle(x, y, 4);

    this.add.text(x, y + 28, '🌐 LIVE WEB HUB', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#1A1320',
      fontStyle: 'bold',
    }).setOrigin(0.5);
  }

  private drawPaymentCounter(x: number, y: number) {
    const gfx = this.add.graphics();

    // Marble Checkout Counter
    gfx.fillStyle(0xfffdf5, 1);
    gfx.fillRoundedRect(x - 28, y - 14, 56, 28, 3);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeRoundedRect(x - 28, y - 14, 56, 28, 3);

    // Cash Register POS Machine
    gfx.fillStyle(0x1a1320, 1);
    gfx.fillRect(x - 18, y - 10, 18, 14);
    gfx.fillStyle(0x6bcf7f, 1); // Green POS display
    gfx.fillRect(x - 16, y - 8, 14, 6);

    // Razorpay Chip Reader & Scanner
    gfx.fillStyle(0xffd93d, 1);
    gfx.fillRect(x + 4, y - 6, 12, 12);
    gfx.lineStyle(1, 0x1a1320, 1);
    gfx.strokeRect(x + 4, y - 6, 12, 12);

    this.add.text(x, y - 20, '💳 RAZORPAY POS', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#1A1320',
      fontStyle: 'bold',
    }).setOrigin(0.5);
  }

  private drawBreakroomFurniture() {
    const gfx = this.add.graphics();

    // Coffee Kitchen Counter
    gfx.fillStyle(0xfff8e7, 1);
    gfx.fillRect(20, 370, 55, 26);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeRect(20, 370, 55, 26);

    // Coffee Maker Machine
    gfx.fillStyle(0x3d2e4a, 1);
    gfx.fillRect(25, 362, 16, 14);
    gfx.fillStyle(0xff6b6b, 1);
    gfx.fillRect(27, 368, 12, 6);

    // Water Cooler Station
    gfx.fillStyle(0xfffdf5, 1);
    gfx.fillRect(85, 370, 18, 26);
    gfx.lineStyle(1.5, 0x1a1320, 1);
    gfx.strokeRect(85, 370, 18, 26);
    gfx.fillStyle(0x4ecdc4, 0.85); // Water jug
    gfx.fillRoundedRect(87, 356, 14, 15, 3);

    // Lounge Couch
    gfx.fillStyle(0x4ba85c, 1);
    gfx.fillRoundedRect(120, 375, 45, 22, 4);
    gfx.lineStyle(2, 0x1a1320, 1);
    gfx.strokeRoundedRect(120, 375, 45, 22, 4);
  }

  private drawServerRacks(x: number, y: number) {
    const gfx = this.add.graphics();

    for (let r = 0; r < 3; r++) {
      const rx = x + r * 36;
      gfx.fillStyle(0x13111c, 1);
      gfx.fillRect(rx, y, 26, 52);
      gfx.lineStyle(2, 0x1a1320, 1);
      gfx.strokeRect(rx, y, 26, 52);

      // Server rack grill slots
      gfx.fillStyle(0x2a2438, 1);
      for (let s = 0; s < 4; s++) {
        gfx.fillRect(rx + 3, y + 6 + s * 11, 20, 7);
      }

      // Dynamic LED Container
      const lightGfx = this.add.graphics();
      this.serverLights.push(lightGfx);
    }
  }

  private drawBonsaiPlant(x: number, y: number) {
    const gfx = this.add.graphics();
    gfx.fillStyle(0xba5d39, 1); // Pot
    gfx.fillRoundedRect(x, y + 10, 16, 14, 2);
    gfx.lineStyle(1.5, 0x1a1320, 1);
    gfx.strokeRoundedRect(x, y + 10, 16, 14, 2);

    gfx.fillStyle(0x6bcf7f, 1); // Leaves
    gfx.fillCircle(x + 8, y + 6, 9);
    gfx.fillStyle(0x4ba85c, 1);
    gfx.fillCircle(x + 4, y + 9, 7);
    gfx.fillCircle(x + 12, y + 9, 7);
  }

  private blinkServerLights() {
    const colors = [0x6bcf7f, 0x4ecdc4, 0xffd93d, 0xff6b6b];
    this.serverLights.forEach((gfx, idx) => {
      gfx.clear();
      for (let i = 0; i < 4; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        gfx.fillStyle(color, 1);
        gfx.fillRect(384 + idx * 36, 383 + i * 11, 5, 4);
      }
    });
  }

  private animateCoffeeSteam() {
    // Steam particle rising from coffee machine
    const steam = this.add.circle(33, 358, 2, 0xffffff, 0.7);
    this.tweens.add({
      targets: steam,
      y: 345,
      alpha: 0,
      scale: 1.8,
      duration: 1000,
      ease: 'Sine.easeOut',
      onComplete: () => steam.destroy(),
    });
  }

  private createCharacterAvatars() {
    this.agentsData.forEach((agent) => {
      const avatar = this.createPixelAvatarContainer(agent);
      this.characters[agent.id] = avatar;
    });
  }

  private createPixelAvatarContainer(agent: AgentState): Phaser.GameObjects.Container {
    const container = this.add.container(agent.homeX, agent.homeY);
    const gfx = this.add.graphics();

    // Soft Shadow
    gfx.fillStyle(0x1a1320, 0.35);
    gfx.fillEllipse(0, 18, 20, 7);

    // Pants / Legs
    gfx.fillStyle(agent.pantColor, 1);
    gfx.fillRect(-5, 7, 4, 11);
    gfx.fillRect(1, 7, 4, 11);
    gfx.lineStyle(1, 0x1a1320, 1);
    gfx.strokeRect(-5, 7, 4, 11);
    gfx.strokeRect(1, 7, 4, 11);

    // Torso / Shirt
    gfx.fillStyle(agent.shirtColor, 1);
    gfx.fillRect(-7, -4, 14, 12);
    gfx.lineStyle(1.5, 0x1a1320, 1);
    gfx.strokeRect(-7, -4, 14, 12);

    // Tie / Collar
    gfx.fillStyle(0x1a1320, 1);
    gfx.fillRect(-1, -4, 2, 8);

    // Head
    gfx.fillStyle(0xffd8b3, 1);
    gfx.fillCircle(0, -11, 8);
    gfx.lineStyle(1.5, 0x1a1320, 1);
    gfx.strokeCircle(0, -11, 8);

    // Hair
    gfx.fillStyle(agent.id === 'SALES_AGENT' ? 0x2e1a0c : 0x4a2e18, 1);
    gfx.fillCircle(0, -15, 8);
    gfx.fillRect(-7, -17, 14, 6);

    // Eyes
    gfx.fillStyle(0x1a1320, 1);
    gfx.fillRect(-4, -12, 2, 2);
    gfx.fillRect(2, -12, 2, 2);

    container.add(gfx);

    // Nameplate Badge
    const badge = this.add.graphics();
    badge.fillStyle(0xfffdf5, 1);
    badge.fillRoundedRect(-42, 20, 84, 16, 2);
    badge.lineStyle(1.5, 0x1a1320, 1);
    badge.strokeRoundedRect(-42, 20, 84, 16, 2);

    badge.fillStyle(agent.accent, 1);
    badge.fillRect(-38, 24, 6, 8);

    container.add(badge);

    const nameText = this.add.text(2, 28, agent.name, {
      fontFamily: 'monospace',
      fontSize: '8px',
      fontStyle: 'bold',
      color: '#1A1320',
    }).setOrigin(0.5);
    container.add(nameText);

    // Status Emote Floating Container
    const emoteContainer = this.add.container(0, -28);
    const emoteBg = this.add.graphics();
    emoteBg.fillStyle(agent.accent, 1);
    emoteBg.fillCircle(0, 0, 8);
    emoteBg.lineStyle(1.5, 0x1a1320, 1);
    emoteBg.strokeCircle(0, 0, 8);

    const emoteText = this.add.text(0, 0, '⚡', {
      fontSize: '8px',
    }).setOrigin(0.5);

    emoteContainer.add([emoteBg, emoteText]);
    emoteContainer.setVisible(false);
    container.add(emoteContainer);
    this.statusBadges[agent.id] = emoteContainer;

    // SNES Speech Bubble
    const bubbleContainer = this.add.container(0, -48);
    bubbleContainer.setVisible(false);

    const bubbleBg = this.add.graphics();
    bubbleBg.fillStyle(0xfffdf5, 1);
    bubbleBg.fillRoundedRect(-85, -22, 170, 36, 4);
    bubbleBg.lineStyle(2, 0x1a1320, 1);
    bubbleBg.strokeRoundedRect(-85, -22, 170, 36, 4);

    bubbleBg.lineStyle(1, 0xf4e9c7, 1);
    bubbleBg.strokeRoundedRect(-83, -20, 166, 32, 2);

    // Pointer
    bubbleBg.fillStyle(0xfffdf5, 1);
    bubbleBg.fillTriangle(0, 18, -6, 12, 6, 12);
    bubbleBg.lineStyle(2, 0x1a1320, 1);
    bubbleBg.lineBetween(0, 18, -6, 12);
    bubbleBg.lineBetween(0, 18, 6, 12);

    const bubbleText = this.add.text(0, -4, '', {
      fontFamily: 'monospace',
      fontSize: '9px',
      fontStyle: 'bold',
      color: '#1A1320',
      wordWrap: { width: 155 },
      align: 'center',
    }).setOrigin(0.5);

    bubbleContainer.add([bubbleBg, bubbleText]);
    container.add(bubbleContainer);

    this.speechBubbles[agent.id] = bubbleContainer;

    // Subtle Idle Sway
    this.tweens.add({
      targets: container,
      y: agent.homeY - 2,
      duration: 1000 + Math.random() * 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    return container;
  }

  // Walk Avatar to Station with step animation
  public moveAgentToStation(agentId: string, stationKey: string, onArrival?: () => void) {
    const avatar = this.characters[agentId];
    const station = this.stations[stationKey];
    if (!avatar || !station) return;

    // Show walking emote
    const emote = this.statusBadges[agentId];
    if (emote) {
      emote.setVisible(true);
      (emote.getAt(1) as Phaser.GameObjects.Text).setText('🚶');
    }

    // Tween to target station
    this.tweens.add({
      targets: avatar,
      x: station.x,
      y: station.y,
      duration: 800,
      ease: 'Power2.easeOut',
      onComplete: () => {
        if (emote) {
          (emote.getAt(1) as Phaser.GameObjects.Text).setText('⚡');
        }
        if (onArrival) onArrival();
      },
    });
  }

  public handleAgentSpeech(data: { agent: string; text: string }) {
    const avatar = this.characters[data.agent];
    const bubble = this.speechBubbles[data.agent];

    // Determine task station based on message context
    if (data.text.toLowerCase().includes('laptop') || data.text.toLowerCase().includes('search')) {
      this.moveAgentToStation('SALES_AGENT', 'WEB_RESEARCH_HUB');
    } else if (data.text.toLowerCase().includes('cart') || data.text.toLowerCase().includes('discount')) {
      this.moveAgentToStation('MERCHANT_AGENT', 'MERCHANT_DESK');
      this.moveAgentToStation('SALES_AGENT', 'MERCHANT_DESK');
    } else if (data.text.toLowerCase().includes('pay') || data.text.toLowerCase().includes('order')) {
      this.moveAgentToStation('CUSTOMER', 'PAYMENT_COUNTER');
      this.moveAgentToStation('AUTHORITY_AGENT', 'PAYMENT_COUNTER');
    }

    if (bubble) {
      const textObj = bubble.getAt(1) as Phaser.GameObjects.Text;
      if (textObj) {
        textObj.setText(data.text.slice(0, 52) + (data.text.length > 52 ? '...' : ''));
      }
      bubble.setVisible(true);
      bubble.setAlpha(1);

      this.tweens.add({
        targets: bubble,
        alpha: 0,
        delay: 4500,
        duration: 400,
        onComplete: () => bubble.setVisible(false),
      });
    }
  }

  public handleAgentAction(data: { agent: string; action: string }) {
    const emote = this.statusBadges[data.agent];
    if (emote) {
      const textObj = emote.getAt(1) as Phaser.GameObjects.Text;
      if (data.action === 'SEARCH') textObj.setText('🔍');
      else if (data.action === 'VALIDATE') textObj.setText('🛡️');
      else if (data.action === 'PAY') textObj.setText('💳');
      else textObj.setText('⚡');

      emote.setVisible(true);
    }
  }

  public handleFlyingEnvelope(data: { from: string; to: string }) {
    const sender = this.characters[data.from] || this.characters['SALES_AGENT'];
    const recipient = this.characters[data.to] || this.characters['MERCHANT_AGENT'];
    if (!sender || !recipient) return;

    const envelope = this.add.container(sender.x, sender.y - 15);
    const gfx = this.add.graphics();
    gfx.fillStyle(0xfffdf5, 1);
    gfx.fillRect(-8, -5, 16, 10);
    gfx.lineStyle(1.5, 0x1a1320, 1);
    gfx.strokeRect(-8, -5, 16, 10);
    gfx.fillStyle(0xff6b6b, 1);
    gfx.fillTriangle(0, 1, -6, -4, 6, -4);
    envelope.add(gfx);

    this.tweens.add({
      targets: envelope,
      x: recipient.x,
      y: recipient.y - 15,
      duration: 650,
      ease: 'Quad.easeInOut',
      onComplete: () => {
        envelope.destroy();
      },
    });
  }
}
